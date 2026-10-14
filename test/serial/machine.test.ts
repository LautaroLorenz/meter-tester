import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockBinding, MockPortBinding } from '@serialport/binding-mock';
import { SerialPortStream } from '@serialport/stream';
import { pedidoCalculador, pedidoGenerador, respuestaCalculador, respuestaGenerador } from './tramas';

// Proceso main (machine.ts): manda el comando por el puerto serie, espera la respuesta 1,5 s y si no
// llega lo reenvía hasta 2 veces (3 intentos). Se prueba con el puerto simulado de serialport, sin
// Electron: el canal IPC "software-write" se llama directo.

const ipc = vi.hoisted(() => new Map<string, (...args: unknown[]) => unknown>());
vi.mock('electron', () => {
  const ipcMain = {
    handle: (canal: string, fn: (...args: unknown[]) => unknown) => ipc.set(canal, fn),
    on: (canal: string, fn: (...args: unknown[]) => unknown) => ipc.set(canal, fn),
  };
  return { ipcMain, default: { ipcMain } };
});
// serialport carga bindings nativos compilados para Electron: no hacen falta con el puerto simulado
vi.mock('serialport', () => ({ SerialPort: { list: async () => [] } }));
vi.mock('../../app/resources/virtual-machine/virtual-machine', () => ({
  default: { setCommandProcessor: () => undefined },
}));

import machine from '../../app/resources/machine/machine';

type Respuesta = { result?: string; error?: Error };

let puerto: SerialPortStream<MockBinding>;
let recibidos: string[];
/** cómo contesta la máquina simulada a cada comando que recibe */
let maquina: (comando: string, intento: number) => void;

function contestar(trama: string, demoraMs = 0): void {
  const enviar = () => (puerto.port as MockPortBinding).emitData(Buffer.from(trama, 'latin1'));
  demoraMs ? setTimeout(enviar, demoraMs) : setImmediate(enviar);
}

async function escribir(comando: string): Promise<{ respuesta: Respuesta; ms: number }> {
  const inicio = Date.now();
  const respuesta = (await ipc.get('software-write')!(null, { command: comando })) as Respuesta;
  return { respuesta, ms: Date.now() - inicio };
}

beforeAll(async () => {
  MockBinding.createPort('/dev/MAQUINA', { echo: false, record: false });
  puerto = new SerialPortStream({ binding: MockBinding, path: '/dev/MAQUINA', baudRate: 19200 });
  await new Promise((listo) => puerto.on('open', listo));
  machine.register();
  machine.setSerialPort(puerto);
  machine.observeSoftwareWrite(machine.onSoftwareWrite$);

  // cada comando escrito llega a la máquina simulada
  const binding = puerto.port as MockPortBinding;
  const escribirOriginal = binding.write.bind(binding);
  binding.write = async (buffer: Buffer) => {
    await escribirOriginal(buffer);
    const comando = buffer.toString('latin1');
    recibidos.push(comando);
    maquina(comando, recibidos.filter((c) => c === comando).length);
  };
});

afterAll(async () => {
  machine.cleanup();
  await new Promise((listo) => puerto.close(listo));
  MockBinding.reset();
});

beforeEach(async () => {
  recibidos = [];
  maquina = () => undefined;
  // que no quede nada pendiente del test anterior
  await new Promise((listo) => setTimeout(listo, 200));
});

describe('reintentos del proceso main', () => {
  it('responde al primer intento: un solo envío', async () => {
    maquina = () => contestar(respuestaCalculador(1, 10));
    const { respuesta, ms } = await escribir(pedidoCalculador(1));
    expect(respuesta).toEqual({ result: respuestaCalculador(1, 10) });
    expect(recibidos).toHaveLength(1);
    expect(ms).toBeLessThan(500);
  });

  it('no responde el primer intento: reenvía a los 1,5 s y toma la respuesta', async () => {
    maquina = (_, intento) => intento === 2 && contestar(respuestaCalculador(1, 20));
    const { respuesta, ms } = await escribir(pedidoCalculador(1));
    expect(respuesta).toEqual({ result: respuestaCalculador(1, 20) });
    expect(recibidos).toEqual([pedidoCalculador(1), pedidoCalculador(1)]);
    expect(ms).toBeGreaterThanOrEqual(1500);
    expect(ms).toBeLessThan(2500);
  });

  it('no responde nunca: 3 envíos y error por timeout a los ~4,5 s', async () => {
    const { respuesta, ms } = await escribir(pedidoCalculador(1));
    expect(respuesta.result).toBeUndefined();
    expect(respuesta.error?.message).toBe('Timeout');
    expect(recibidos).toHaveLength(3);
    expect(ms).toBeGreaterThanOrEqual(4500);
    expect(ms).toBeLessThan(5500);
  });

  it('trama corrupta: se descarta y vale la del reintento', async () => {
    maquina = (_, intento) =>
      contestar(intento === 1 ? `${respuestaCalculador(1).slice(0, -1)}Y` : respuestaCalculador(1, 30));
    const { respuesta } = await escribir(pedidoCalculador(1));
    expect(respuesta).toEqual({ result: respuestaCalculador(1, 30) });
    expect(recibidos).toHaveLength(2);
  });

  it('respuesta tardía (1,6 s): se toma como respuesta del reintento', async () => {
    maquina = (_, intento) => intento === 1 && contestar(respuestaCalculador(1, 40), 1600);
    const { respuesta, ms } = await escribir(pedidoCalculador(1));
    expect(respuesta).toEqual({ result: respuestaCalculador(1, 40) });
    expect(recibidos).toHaveLength(2);
    expect(ms).toBeLessThan(2500);
  });

  it('respuesta con el número de otro puesto: se acepta igual (no valida el puesto)', async () => {
    maquina = () => contestar(respuestaCalculador(7, 50));
    const { respuesta } = await escribir(pedidoCalculador(1));
    expect(respuesta).toEqual({ result: respuestaCalculador(7, 50) });
  });

  it('respuesta de otro dispositivo: no cuenta y termina en timeout', async () => {
    maquina = () => contestar(respuestaGenerador());
    const { respuesta } = await escribir(pedidoCalculador(1));
    expect(respuesta.error?.message).toBe('Timeout');
    expect(recibidos).toHaveLength(3);
  });

  it('generador: mismo mecanismo', async () => {
    maquina = () => contestar(respuestaGenerador());
    const { respuesta } = await escribir(pedidoGenerador());
    expect(respuesta).toEqual({ result: respuestaGenerador() });
  });
});
