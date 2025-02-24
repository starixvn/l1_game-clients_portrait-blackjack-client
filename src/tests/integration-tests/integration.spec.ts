import { expect, test } from "@playwright/test";
import { Manager, TestCase, debug, startJob } from "@sg/cocos-integration-testing";

function assert<T>({ name, client }: TestCase, actual: T, expected: T) {
    debug(`${name}`, `the value of ${client.actual} should be ${client.expected}`);

    expect(actual).toStrictEqual(expected);
}

test.beforeEach(async ({ page }) => {
    function evaluate(code: string) {
        return page.evaluate((code) => eval(code), code);
    }

    await page.goto(process.env.CLIENT_URL || "http://localhost:9999/?token=x&lang=vi-VN");
    await Manager.initialize(process.env.CLIENT_DATA_DIR || "tests/integration-tests/data");

    startJob({
        server: false,
        assert,
        evaluate,
    });
});

test("start job", async ({ page }) => {
    setInterval(async () => {
        if (!page.isClosed()) {
            try {
                const fps = await page.evaluate("1 / cc.game.deltaTime");

                console.log(`fps: ${fps}`);
            } catch (error) {
                // Skip it, error on the page reload
            }
        }
    }, 5000);

    page.on("console", (msg) => {
        console[msg.type()]?.(msg.text());
    });

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (Manager.done() && !Manager.running) {
                clearInterval(interval);

                page.close();
                resolve();
            }
        }, 1000);
    });
});
