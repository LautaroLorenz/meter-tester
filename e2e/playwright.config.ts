import { CLIENTS } from './support/clients';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: '.',
  timeout: 60000,
  // en el CI (PC lenta, compartida) un reintento: si pasa al reintentar, el reporte lo marca "flaky"
  retries: process.env.CI ? 1 : 0,
  outputDir: './screenshots',
  reporter: [['list'], ['html', { outputFolder: './report', open: 'never' }]],
  expect: {
    // en el CI la base de datos (sobre todo en Windows) a veces tarda más de los 5 s por defecto
    timeout: process.env.CI ? 15000 : 5000,
    toMatchSnapshot: { threshold: 0.2 },
  },
  // un cliente solo: npx playwright test -c e2e/playwright.config.ts --project=chaco
  // los tests @un-cliente cubren funciones comunes a todos (ABM): corren solo en el primero (edet)
  projects: Object.keys(CLIENTS).map((client, index) => ({
    name: client,
    use: { client },
    grepInvert: index === 0 ? undefined : /@un-cliente/,
  })),
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
module.exports = config;
