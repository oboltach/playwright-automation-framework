// playwright.config.js
import { defineConfig } from '@playwright/test'; //helps define your Playwright config safely.
import dotenv from 'dotenv'; //loads the library that reads .env files.

dotenv.config(); //actually reads .env and makes its variables available via process.env.

/**
* By keeping the fallback values in playwright.config.js, your tests always run against the real public demo URLs (ParaBank, Herokuapp, ReqRes)
* if no .env file exists. Later, you can drop in a .env file to override them for demo/staging, but by default everything works out-of-the-box.
 */

const UI_BASE = process.env.BASE_URL_PARABANK || 'https://parabank.parasoft.com';
const POPUP_BASE = process.env.BASE_URL_HEROKUAPP || 'https://the-internet.herokuapp.com';
const API_BASE = process.env.API_REQRES || 'https://restful-booker.herokuapp.com';

export default defineConfig({
  testDir: 'playwright/tests', //tells Playwright to look for all test files inside the tests/ folder at the project root — it’s the default and most common setup.
  timeout: 30_000,  //each test has up to 30 seconds total to finish, otherwise Playwright fails it.
  expect: { timeout: 5_000 }, //each Playwright assertion waits up to 5 seconds for the condition to become true before failing.
  fullyParallel: true, //means Playwright won’t just parallelize within a file, but will also run different test files at the same time
  retries: process.env.CI ? 2 : 0, //In CI → retry each failing test up to 2 times to reduce flakiness, local - no retry
  reporter: [ //HTML report is generated for every run, regardless of pass/fail, open means if it is auto opened after each test or not
    ['list'], //console reporter. shows test progres in list format
    ['html', { open: 'never', outputFolder: 'playwright-report' }] // generates an interactive HTML report you can open in a browser
  ],
  use: {
    trace: 'on-first-retry', //trace is collected only when a test fails and retries once (other options: off, on, retain-on-failure)
    video: 'retain-on-failure', //keep video only for failed tests (other options: off, on)
    screenshot: 'only-on-failure', //take a screenshot only if the test fails (other options: off, on)
    actionTimeout: 10_000, //Default max time for individual actions (click, fill, type, etc.)
    navigationTimeout: 15_000 //Default max time for page navigations (like page.goto(), link clicks that cause navigation)
  },
  projects: [
    {
      name: 'ui',
      testDir: 'playwright/tests/ui',
      use: {
        baseURL: UI_BASE
      },
      metadata: { // for any extra information about a project (like extra URLs, environment names, API versions, etc.).
        popupBase: POPUP_BASE
      }
    },
    {
      name: 'api', //No use in API project because we’re not driving a browser; use.baseURL is optional.
      testDir: 'playwright/tests/api',
      metadata: {
        apiBaseUrl: API_BASE
      }
    }
  ]
});
