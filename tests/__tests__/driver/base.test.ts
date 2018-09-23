import { Builder, By, Key} from 'selenium-webdriver';
import { BaseWebDriver } from '../../../src/driver/base';

const url = 'https://www.google.com/';

describe("Test base web driver", () => {
  test("Record step time consume.", async () => {
    const driver = new Builder()
      .forBrowser('chrome')
      .build();

    const myWebDriver = new BaseWebDriver(driver);

    const recordStartTime = async () => {
      const start = new Date().getTime();
      return start;
    };
    const recordEndTime = async (start) => {
      const end = new Date().getTime();
      const consume = end - start;
      console.log(`time consume: ${consume}ms`);
    };

    myWebDriver.registerHooksForMethods([
      'get',
      'quit',
      'findElement',
      'takeScreenshot',
      'sendKeys',
      'click',
    ], recordStartTime, recordEndTime);

    try {
      await myWebDriver.get(url);
      await myWebDriver.takeScreenshot('index');
      const searchInput = await myWebDriver.findElement(By.xpath('//*[@id="lst-ib"]'));
      await myWebDriver.sendKeys(searchInput, 'node.js', ' v8');
      await myWebDriver.sendKeys(searchInput, Key.ENTER);
    } catch(err) {
      console.log(err);
    } finally {
      driver.quit();
    }
  });

  test("Open google main page and search somethings", async () => {
    const driver = new Builder()
      .forBrowser('chrome')
      .build();

    const myWebDriver = new BaseWebDriver(driver);

    const nullOp = async () => {
      return;
    };
    const takeScreenshot = async () => {
      await myWebDriver.getOriginalMethod('takeScreenshot')(`screenshot-${new Date()}`);
    };

    myWebDriver.registerHooksForMethods([
      'get',
      'quit',
      'findElement',
      'takeScreenshot',
      'sendKeys',
      'click',
    ], nullOp, takeScreenshot);

    try {
      await myWebDriver.get(url);
      await myWebDriver.takeScreenshot('index');
      const searchInput = await myWebDriver.findElement(By.xpath('//*[@id="lst-ib"]'));
      await myWebDriver.sendKeys(searchInput, 'node.js', ' v8');
      await myWebDriver.sendKeys(searchInput, Key.ENTER);
    } catch(err) {
      console.log(err);
    } finally {
      driver.quit();
    }
  });
});
