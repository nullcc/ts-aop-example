import * as fs from "fs";
import { By, until, WebDriver, WebElement } from "selenium-webdriver";
import { BaseObject } from "../object/base";

export const webDriverMethod = () => {
  return (target, methodName: string, descriptor: PropertyDescriptor) => {
    const desc = {
      value: 'webDriverMethod',
      writable: false,
    };
    Object.defineProperty(target[methodName], '__type__', desc);
  }
}

export class BaseWebDriver extends BaseObject {
  protected webDriver: WebDriver;
  protected methodMap: any;

  constructor(webDriver) {
    super();
    this.webDriver = webDriver;
    this.methodMap = {};
    const methods = this.getWebDriverMethods();
    const self = this;
    methods.forEach(method => {
      self.methodMap[method] = self[method];
    });
  }

  public getWebDriverMethods() {
    const methods = this.getInstanceMethodNames();
    const webDriverMethods = [];
    for (const method of methods) {
      const descriptor = Object.getOwnPropertyDescriptor(this[method], '__type__');
      if (descriptor && descriptor.value === 'webDriverMethod') {
        webDriverMethods.push(method);
      }
    }
    return webDriverMethods;
  }

  public getOriginalMethod(methodName) {
    return this.methodMap[methodName].bind(this);
  }
  
  @webDriverMethod()
  public async get(url) {
    await this.webDriver.get(url);
  }

  @webDriverMethod()
  public async quit() {
    await this.webDriver.quit();
  }

  @webDriverMethod()
  public async findElement(
    by: By,
    ec: Function = until.elementLocated,
    timeout: number = 3000
  ) {
    await this.webDriver.wait(ec(by), timeout);
    return this.webDriver.findElement(by);
  }

  @webDriverMethod()
  public async findAnyElementByText(text: string, timeout: number = 3000) {
    const xpath: string = `//div[text()="${text}"]`;
    const by: By = By.xpath(xpath);
    return this.findElement(by, undefined, timeout);
  }

  @webDriverMethod()
  public async takeScreenshot(filename) {
    await this.webDriver.sleep(0);
    const screenshot = await this.webDriver.takeScreenshot();
    const data = screenshot.replace(/^data:image\/\w+;base64,/, "");
    const buffer = new Buffer(data, "base64");
    fs.writeFileSync(`screenshot/${filename}.png`, buffer);
  }
  
  @webDriverMethod()
  public async sendKeys(webElement: WebElement, ...args) {
    await webElement.sendKeys(...args);
  }

  @webDriverMethod()
  public async click(webElement: WebElement) {
    await webElement.click();
  }

  @webDriverMethod()
  public async sleep(time: number) {
    await this.webDriver.sleep(time);
  }
}
