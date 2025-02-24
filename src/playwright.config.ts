import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: false,
    reporter: [["html", { open: "never" }]],
    use: {
        actionTimeout: 0,
        trace: "on-first-retry",
        headless: true,
        viewport: {
            width: 1280,
            height: 720,
        },
        screenshot: "only-on-failure",
        launchOptions: {
            args: ["--no-sandbox", "--use-angle=gl", "--enable-gpu"],
        },
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
            },
        },
    ],
    timeout: 1200 * 1000,
});
