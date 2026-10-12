import { CLIENTS } from './support/clients';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: '.',
  timeout: 60000,
  outputDir: './screenshots',
  reporter: [['list'], ['html', { outputFolder: './report', open: 'never' }]],
  expect: {
    toMatchSnapshot: { threshold: 0.2 },
  },
  // un cliente solo: npx playwright test -c e2e/playwright.config.ts --project=chaco
  projects: Object.keys(CLIENTS).map((client) => ({ name: client, use: { client } })),
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
module.exports = config;
