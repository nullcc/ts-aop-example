import { Builder, By, Key } from "selenium-webdriver";
import { StaticOnionWebDriver } from "../../../src/driver/staticOnion/staticOnion";

const url = "https://www.google.com/";

describe("Test onion web driver", () => {
  test("Record time consume and take screenshot for every step.", async () => {
    const driver = new Builder().forBrowser("chrome").build();

    const myWebDriver = new StaticOnionWebDriver(driver);

    const timeRecordingMiddleware = async (ctx, next) => {
      const start = new Date().getTime();
      await next();
      const end = new Date().getTime();
      const consume = end - start;
      console.log(`${ctx.methodName} time consume: ${consume}ms`);
    };

    const takeScreenshot = async (ctx, next) => {
      await next();
      console.log("take screenshot...");
      await myWebDriver.getOriginalMethod("takeScreenshot")(
        `screenshot-${new Date().getTime()}`
      );
    };

    myWebDriver.use(timeRecordingMiddleware);
    myWebDriver.use(takeScreenshot);

    try {
      await myWebDriver.get(url);
      await myWebDriver.takeScreenshot("index");
      const searchInput = await myWebDriver.findElement(
        By.xpath('//*[@id="lst-ib"]')
      );
      await myWebDriver.sendKeys(searchInput, "node.js", " v8");
      await myWebDriver.sendKeys(searchInput, Key.ENTER);
    } catch (err) {
      console.error(err);
    } finally {
      driver.quit();
    }
  });
});
