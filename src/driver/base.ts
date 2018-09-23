import * as fs from 'fs';
import { WebDriver, By, until, WebElement } from "selenium-webdriver";
import { BaseObject } from '../object/base';

export class BaseWebDriver extends BaseObject {
  protected webDriver: WebDriver;
  private methodMap: any;

  constructor(webDriver) {
    super();
    this.webDriver = webDriver;
    this.methodMap = {};
    const methods = this.getInstanceMethodNames();
    const self = this;
    methods.forEach(method => {
      self.methodMap[method] = self[method];
    });
  }

  registerHooksForMethods(methods: string[], beforeAction: Function, afterAction: Function) {
    const self = this;
    methods.forEach((method) => {
      const originalMethod = self[method];
      if (originalMethod) {
        self[method] = async (...args) => {
          const beforeActionRes = await beforeAction();
          const methodRes = await originalMethod.call(self, ...args);
          await afterAction(beforeActionRes, methodRes);
          return methodRes;
        }
      }
    });
  }

  getOriginalMethod(methodName) {
    return this.methodMap[methodName].bind(this);
  }

  async get(url) {
    await this.webDriver.get(url);
  }

  async quit() {
    await this.webDriver.quit();
  }

  async findElement(by: By, ec: Function=until.elementLocated, timeout: number=3000) {
    await this.webDriver.wait(ec(by), timeout);
    return await this.webDriver.findElement(by);
  }

  async findAnyElementByText(text: string, timeout: number=3000) {
    const xpath: string = `//div[text()="${text}"]`;
    const by: By = By.xpath(xpath);
    return this.findElement(by, undefined, timeout);
  }

  async takeScreenshot(filename) {
    await this.webDriver.sleep(0);
    const screenshot = await this.webDriver.takeScreenshot();
    var data = screenshot.replace(/^data:image\/\w+;base64,/, "");
    var buffer = new Buffer(data, 'base64');
    fs.writeFileSync(`screenshot/${filename}.png`, buffer);
  }

  async sendKeys(webElement: WebElement, ...args) {
    await webElement.sendKeys(...args);
  }

  async click(webElement: WebElement) {
    await webElement.click();
  }

  async sleep(time: number) {
    await this.webDriver.sleep(time);
  }
}
