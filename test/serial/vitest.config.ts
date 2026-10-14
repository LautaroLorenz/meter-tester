import * as PATH from 'path';
import { defineConfig } from 'vitest/config';

// Tests del protocolo serial, sin interfaz ni Electron: `npm run test:serial`.
// Los paquetes de serialport viven en app/node_modules (dependencias del proceso main).
const APP_MODULES = PATH.resolve(__dirname, '../../app/node_modules');

export default defineConfig({
  test: {
    root: PATH.resolve(__dirname, '../..'),
    include: ['test/serial/**/*.test.ts'],
    // los reintentos del proceso main esperan 1,5 s por intento
    testTimeout: 15000,
  },
  resolve: {
    // en app/ cada .ts tiene al lado su .js compilado (que usa require y no pasa por los mocks):
    // se prueba el fuente
    extensions: ['.ts', '.mjs', '.js', '.json'],
    alias: {
      '@serialport/binding-mock': PATH.join(APP_MODULES, '@serialport/binding-mock'),
      '@serialport/stream': PATH.join(APP_MODULES, '@serialport/stream'),
    },
  },
});
