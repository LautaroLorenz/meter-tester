import { describe, expect, it } from 'vitest';
import { CommandDirector } from '../../src/app/models/business/class/command-director.model';
import { CommandDirector as CommandDirectorMain } from '../../app/resources/machine/command-director';
import { byte, pedidoCalculador, respuestaCalculador, respuestaGenerador } from './tramas';

// Los números viajan en binario (big-endian) y en punto fijo: el valor × 10^decimales.

describe('números compactos (renderer)', () => {
  it.each([
    [1, 1, 0, '\x01'],
    [255, 1, 0, '\xFF'],
    [256, 2, 0, '\x01\x00'],
    [1000, 2, 0, '\x03\xE8'],
    [123.4, 2, 1, '\x04\xD2'], // tensión
    [12.34, 2, 2, '\x04\xD2'], // corriente
    [0.85, 3, 2, '\x00\x00\x55'], // factor de potencia
    [2000000000, 4, 0, '\x77\x35\x94\x00'], // constante del patrón
  ])('%s en %s bytes con %s decimales', (numero, bytes, decimales, esperado) => {
    expect(CommandDirector.encodeCompactNumber(numero, bytes, decimales)).toBe(esperado);
    expect(CommandDirector.decodeCompactNumber(esperado, decimales)).toBeCloseTo(numero, 6);
  });

  it('redondea al punto fijo', () => {
    expect(CommandDirector.encodeCompactNumber(1.006, 2, 2)).toBe(CommandDirector.encodeCompactNumber(1.01, 2, 2));
    expect(CommandDirector.encodeCompactNumber(1.004, 2, 2)).toBe(CommandDirector.encodeCompactNumber(1, 2, 2));
    expect(CommandDirector.encodeCompactNumber(0.004, 1, 2)).toBe('\x00');
  });

  it('rechaza números fuera de rango, negativos y tamaños inválidos', () => {
    expect(() => CommandDirector.encodeCompactNumber(256, 1)).toThrow();
    expect(() => CommandDirector.encodeCompactNumber(655.36, 2, 2)).toThrow();
    expect(() => CommandDirector.encodeCompactNumber(-1, 2)).toThrow();
    expect(() => CommandDirector.encodeCompactNumber(1, 5)).toThrow();
    expect(() => CommandDirector.encodeCompactNumber(1, 2, 5)).toThrow();
  });

  it('factor de potencia: signo, valor con 2 decimales y L/C', () => {
    expect(CommandDirector.decodePowerFactor(` ${byte(100)}L`)).toEqual({ value: 1, type: 'L' });
    expect(CommandDirector.decodePowerFactor(`-${byte(85)}C`)).toEqual({ value: -0.85, type: 'C' });
    expect(() => CommandDirector.decodePowerFactor('L')).toThrow();
  });
});

describe('bloques de las tramas', () => {
  it('renderer: separa por posiciones fijas aunque un valor sea "|"', () => {
    const respuesta = respuestaCalculador(124, 124 * 256 + 124);
    expect(CommandDirector.getBlocks(respuesta)).toEqual(['B', 'CS', '|', ' ||', 'Z']);
    expect(CommandDirector.getFrom(respuesta)).toBe('C');
    expect(CommandDirector.getTo(respuesta)).toBe('S');
  });

  it('main: origen y destino de pedidos y respuestas (así empareja pedido y respuesta)', () => {
    const pedido = pedidoCalculador(3);
    expect(CommandDirectorMain.getTo(pedido)).toBe('C');
    expect(CommandDirectorMain.getFrom(respuestaCalculador(3))).toBe('C');
    expect(CommandDirectorMain.getFrom(respuestaGenerador())).toBe('G');
    expect(CommandDirectorMain.getBlocks(respuestaCalculador(124, 124))).toEqual(['B', 'CS', '|', ' \x00|', 'Z']);
  });
});
