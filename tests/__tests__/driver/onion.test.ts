import { Builder, By, Key } from "selenium-webdriver";
import { OnionWebDriver } from "../../../src/driver/onion";

const url = "https://www.google.com/";

describe("Test onion web driver", () => {
  test("Record time consume and take screenshot for every step.", async () => {
    const driver = new Builder().forBrowser("chrome").build();

    const myWebDriver = new OnionWebDriver(driver);

    const timeRecordingMiddleware = async (ctx, next) => {
      const start = new Date().getTime();
      await next();
      const end = new Date().getTime();
      const consume = end - start;
      console.log(`${ctx.methodName} time consume: ${consume}ms`);
    };

    const takeScreenshot = async (ctx, next) => {
      await next();
      await myWebDriver.getOriginalMethod("takeScreenshot")(
        `screenshot-${ctx.methodName}-${new Date().getTime()}`
      );
    };

    myWebDriver.use("get", timeRecordingMiddleware);
    myWebDriver.use("quit", timeRecordingMiddleware);
    myWebDriver.use("findElement", timeRecordingMiddleware);
    myWebDriver.use("takeScreenshot", timeRecordingMiddleware);
    myWebDriver.use("sendKeys", timeRecordingMiddleware);
    myWebDriver.use("click", timeRecordingMiddleware);

    myWebDriver.use("get", takeScreenshot);
    myWebDriver.use("quit", takeScreenshot);
    myWebDriver.use("findElement", takeScreenshot);
    myWebDriver.use("takeScreenshot", takeScreenshot);
    myWebDriver.use("sendKeys", takeScreenshot);
    myWebDriver.use("click", takeScreenshot);

    try {
      await myWebDriver.get(url);
      await myWebDriver.takeScreenshot("index");
      const searchInput = await myWebDriver.findElement(
        By.xpath('//*[@id="lst-ib"]')
      );
      await myWebDriver.sendKeys(searchInput, "node.js", " v8");
      await myWebDriver.sendKeys(searchInput, Key.ENTER);
    } catch (err) {
      console.log(err);
    } finally {
      driver.quit();
    }
  });
});
