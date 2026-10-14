import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandProcessor } from '../../app/resources/machine/command-processor';
import { byte, pedidoCalculador, pedidoGenerador, respuestaCalculador, respuestaGenerador } from './tramas';

// CommandProcessor (proceso main): arma la respuesta con los bytes que llegan del puerto serie y la
// valida contra lo que se espera del comando enviado (inicio, fin, separadores y tamaño). Lo que no
// valida lo descarta sin avisar: para la app es "sin respuesta" y el reintento lo cubre.

let recibidas: string[];
let procesador: CommandProcessor;

beforeEach(() => {
  recibidas = [];
  procesador = new CommandProcessor({
    onCommandReceived: (comando) => recibidas.push(comando),
    onCommandLog: () => undefined,
  });
});

function enviar(pedido: string): void {
  procesador.startResponseProcessing(pedido);
}

function llega(...pedazos: string[]): void {
  pedazos.forEach((pedazo) => procesador.processDataChunk(pedazo));
}

describe('respuestas válidas', () => {
  it('acepta la respuesta de la calculadora', () => {
    enviar(pedidoCalculador(3));
    llega(respuestaCalculador(3, 150));
    expect(recibidas).toEqual([respuestaCalculador(3, 150)]);
    expect(procesador.getState()).toEqual({ hasPendingResponse: false, bufferLength: 0 });
  });

  it('acepta la respuesta del generador', () => {
    enviar(pedidoGenerador());
    llega(respuestaGenerador());
    expect(recibidas).toEqual([respuestaGenerador()]);
  });

  it('arma la respuesta aunque llegue byte a byte', () => {
    enviar(pedidoCalculador(1));
    llega(...respuestaCalculador(1, 42).split(''));
    expect(recibidas).toEqual([respuestaCalculador(1, 42)]);
  });

  it('acepta valores binarios que coinciden con los caracteres de control (| B Z)', () => {
    // 124 = "|", 66 = "B", 90 = "Z": las posiciones de los separadores son fijas
    for (const valor of [124, 66, 90, 124 * 256 + 124]) {
      enviar(pedidoCalculador(124));
      llega(respuestaCalculador(124, valor));
    }
    expect(recibidas).toHaveLength(4);
  });
});

describe('respuestas descartadas (para la app, sin respuesta)', () => {
  it('sin comando pendiente', () => {
    llega(respuestaCalculador(1));
    expect(recibidas).toEqual([]);
    expect(procesador.getState().bufferLength).toBe(0);
  });

  it('comando sin respuesta esperada conocida', () => {
    enviar(`B|SX|${byte(1)}|Z`);
    llega(respuestaCalculador(1));
    expect(recibidas).toEqual([]);
  });

  it('respuesta de otro dispositivo', () => {
    enviar(pedidoCalculador(1));
    llega(`B|GS|${byte(1)}|Z1234`);
    expect(recibidas).toEqual([]);
  });

  it('sin el fin de trama', () => {
    enviar(pedidoCalculador(1));
    llega(`${respuestaCalculador(1).slice(0, -1)}Y`);
    expect(recibidas).toEqual([]);
  });

  it('con un separador fuera de lugar', () => {
    enviar(pedidoCalculador(1));
    const trama = respuestaCalculador(1);
    llega(`${trama.slice(0, 10)}#${trama.slice(11)}`);
    expect(recibidas).toEqual([]);
  });

  it('incompleta: a los 100 ms de empezar se descarta y lo que llega después también', () => {
    vi.useFakeTimers();
    try {
      enviar(pedidoCalculador(1));
      const trama = respuestaCalculador(1);
      llega(trama.slice(0, 6));
      vi.advanceTimersByTime(100);
      expect(procesador.getState()).toEqual({ hasPendingResponse: false, bufferLength: 0 });
      llega(trama.slice(6));
      expect(recibidas).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('bytes de más (comportamiento actual)', () => {
  it('después de una respuesta válida se descartan', () => {
    enviar(pedidoCalculador(1));
    llega(`${respuestaCalculador(1)}\n`);
    expect(recibidas).toEqual([respuestaCalculador(1)]);
    expect(procesador.getState().bufferLength).toBe(0);
  });

  it('dos respuestas en el mismo bloque: solo se toma la primera', () => {
    enviar(pedidoCalculador(1));
    llega(respuestaCalculador(1, 1) + respuestaCalculador(2, 2));
    expect(recibidas).toEqual([respuestaCalculador(1, 1)]);
  });

  it('un byte suelto antes de la trama hace descartar la respuesta (no busca el inicio de trama)', () => {
    // por ejemplo el "\n" que la máquina virtual agrega al final de cada respuesta, si llega
    // cuando ya hay otro comando esperando
    enviar(pedidoCalculador(1));
    llega('\n', respuestaCalculador(1));
    expect(recibidas).toEqual([]);
  });

  it('restos de una respuesta a medias contaminan la del comando siguiente', () => {
    enviar(pedidoCalculador(1));
    llega(respuestaCalculador(1).slice(0, 4));
    // se envía otro comando antes de que se cumplan los 100 ms
    enviar(pedidoCalculador(2));
    llega(respuestaCalculador(2));
    expect(recibidas).toEqual([]);
  });
});
