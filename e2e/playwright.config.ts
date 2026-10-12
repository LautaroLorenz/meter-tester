/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: '.',
  timeout: 60000,
  outputDir: './screenshots',
  reporter: [['list'], ['html', { outputFolder: './report', open: 'never' }]],
  expect: {
    toMatchSnapshot: { threshold: 0.2 },
  },
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
module.exports = config;
