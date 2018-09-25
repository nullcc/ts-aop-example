import * as fs from "fs";
import { By, until, WebDriver, WebElement } from "selenium-webdriver";
import { BaseObject } from "../object/base";

export class OnionWebDriver extends BaseObject {
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

  public use(method, middleware) {
    const self = this;
    const originalMethod = this[method];
    if (originalMethod) {
      this[method] = async (...args) => {
        let result;
        const ctx = {
          methodName: method,
          args,
        };
        await middleware(ctx, async () => {
          result = await originalMethod.call(self, ...args);
        });
        return result;
      };
    }
  }

  public getOriginalMethod(methodName) {
    return this.methodMap[methodName].bind(this);
  }

  public async get(url) {
    await this.webDriver.get(url);
  }

  public async quit() {
    await this.webDriver.quit();
  }

  public async findElement(
    by: By,
    ec: Function = until.elementLocated,
    timeout: number = 3000
  ) {
    await this.webDriver.wait(ec(by), timeout);
    return this.webDriver.findElement(by);
  }

  public async findAnyElementByText(text: string, timeout: number = 3000) {
    const xpath: string = `//div[text()="${text}"]`;
    const by: By = By.xpath(xpath);
    return this.findElement(by, undefined, timeout);
  }

  public async takeScreenshot(filename) {
    await this.webDriver.sleep(0);
    const screenshot = await this.webDriver.takeScreenshot();
    const data = screenshot.replace(/^data:image\/\w+;base64,/, "");
    const buffer = new Buffer(data, "base64");
    fs.writeFileSync(`screenshot/${filename}.png`, buffer);
  }

  public async sendKeys(webElement: WebElement, ...args) {
    await webElement.sendKeys(...args);
  }

  public async click(webElement: WebElement) {
    await webElement.click();
  }

  public async sleep(time: number) {
    await this.webDriver.sleep(time);
  }
}
