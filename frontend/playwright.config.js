import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://localhost:5174",
    trace: "retain-on-failure",
    launchOptions: process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] }
      : {},
  },
  outputDir: "../qa-artifacts/browser",
  webServer: [
    {
      command: "node ../backend/tests/preview-server.js",
      url: "http://127.0.0.1:3000/api/health",
      timeout: 30000,
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 5174 --strictPort",
      url: "http://localhost:5174",
      timeout: 30000,
      reuseExistingServer: false,
    },
  ],
});
