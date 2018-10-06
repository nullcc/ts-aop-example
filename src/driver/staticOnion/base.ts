import * as fs from "fs";
import { By, until, WebDriver, WebElement } from "selenium-webdriver";
import { BaseObject } from "../../object/base";

// class instance method decorator which set an attribute `__type__` on specific method
// with value `webDriverMethod` to tag method
export const webDriverMethod = () => {
  return (target, methodName: string, descriptor: PropertyDescriptor) => {
    const desc = {
      value: "webDriverMethod",
      writable: false
    };
    Object.defineProperty(target[methodName], "__type__", desc);
  };
};

export class BaseWebDriver extends BaseObject {
  protected webDriver: WebDriver;
  protected methodMap: any;

  constructor(webDriver) {
    super();
    this.webDriver = webDriver;
    const methods = this.getWebDriverMethods();
    this.methodMap = {}; // keep original method, k: method name, v: method
    const self = this;
    methods.forEach(method => {
      self.methodMap[method] = self[method];
    });
  }

  /**
   * Use descriptor to find all methods which are taged as `webDriverMethod`.
   */
  public getWebDriverMethods() {
    const methods = this.getInstanceMethodNames();
    const webDriverMethods = [];
    for (const method of methods) {
      const descriptor = Object.getOwnPropertyDescriptor(
        this[method],
        "__type__"
      );
      if (descriptor && descriptor.value === "webDriverMethod") {
        webDriverMethods.push(method);
      }
    }
    return webDriverMethods;
  }

  /**
   * Get original method reference by method name.
   * @param methodName
   */
  public getOriginalMethod(methodName) {
    return this.methodMap[methodName].bind(this);
  }

  /**
   * Browser navigate to url.
   * @param url
   */
  @webDriverMethod()
  public async get(url) {
    await this.webDriver.get(url);
  }

  /**
   * Browser quit.
   */
  @webDriverMethod()
  public async quit() {
    await this.webDriver.quit();
  }

  /**
   * Find element on web page.
   * @param by
   * @param ec
   * @param timeout
   */
  @webDriverMethod()
  public async findElement(
    by: By,
    ec: Function = until.elementLocated,
    timeout: number = 3000
  ) {
    await this.webDriver.wait(ec(by), timeout);
    return this.webDriver.findElement(by);
  }

  /**
   * Find element on web page by text.
   * @param text
   * @param timeout
   */
  @webDriverMethod()
  public async findAnyElementByText(text: string, timeout: number = 3000) {
    const xpath: string = `//div[text()="${text}"]`;
    const by: By = By.xpath(xpath);
    return this.findElement(by, undefined, timeout);
  }

  /**
   * Take a screenshot and save.
   * @param filename
   */
  @webDriverMethod()
  public async takeScreenshot(filename) {
    await this.webDriver.sleep(0);
    const screenshot = await this.webDriver.takeScreenshot();
    const data = screenshot.replace(/^data:image\/\w+;base64,/, "");
    const buffer = new Buffer(data, "base64");
    fs.writeFileSync(`screenshot/${filename}.png`, buffer);
  }

  /**
   * Send keys to element.
   * @param webElement
   * @param args
   */
  @webDriverMethod()
  public async sendKeys(webElement: WebElement, ...args) {
    await webElement.sendKeys(...args);
  }

  /**
   * Click element.
   * @param webElement
   */
  @webDriverMethod()
  public async click(webElement: WebElement) {
    await webElement.click();
  }

  /**
   * Sleep.
   * @param time
   */
  @webDriverMethod()
  public async sleep(time: number) {
    await this.webDriver.sleep(time);
  }
}
