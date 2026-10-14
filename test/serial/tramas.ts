// Tramas del protocolo para los tests: B|<origen><destino>|...|Z

/** Byte con el valor indicado (los números viajan en binario, big-endian) */
export const byte = (valor: number): string => String.fromCharCode(valor);

/** Pedido de resultado del software a la calculadora de un puesto */
export const pedidoCalculador = (puesto: number): string => `B|SC|${byte(puesto)}|${byte(2)}|Z`;

/** Respuesta de la calculadora: B|CS|<puesto>|<signo><2 bytes>|Z (12 bytes) */
export const respuestaCalculador = (puesto: number, valor = 0, signo = ' '): string =>
  `B|CS|${byte(puesto)}|${signo}${byte(Math.floor(valor / 256))}${byte(valor % 256)}|Z`;

export const pedidoGenerador = (): string => `B|SG|${byte(1)}|Z`;

/** Respuesta del generador: B|GS|<ACK>|Z (8 bytes) */
export const respuestaGenerador = (): string => `B|GS|${byte(1)}|Z`;
