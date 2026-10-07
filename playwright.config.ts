import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  use: {
    baseURL: process.env.APP_TEST_URL || "http://localhost:3000",
    trace: "retain-on-failure",
  },
  workers: 1,
  reporter: "list",
  timeout: 120000,
  expect: { timeout: 15000 },
});
