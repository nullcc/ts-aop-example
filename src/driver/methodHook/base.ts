import * as fs from "fs";
import { By, until, WebDriver, WebElement } from "selenium-webdriver";
import { BaseObject } from "../../object/base";

export class BaseWebDriver extends BaseObject {
  protected webDriver: WebDriver;
  protected methodMap: any;

  constructor(webDriver) {
    super();
    this.webDriver = webDriver;
    this.methodMap = {}; // keep original method, k: method name, v: method
    const self = this;
    const methods = [
      'get', 
      'quit', 
      'findElement', 
      'findAnyElementByText', 
      'takeScreenshot',
      'sendKeys',
      'click',
      'sleep',
    ];
    methods.forEach(method => {
      self.methodMap[method] = self[method];
    });
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
  public async get(url) {
    await this.webDriver.get(url);
  }

  /**
   * Browser quit.
   */
  public async quit() {
    await this.webDriver.quit();
  }

  /**
   * Find element on web page.
   * @param by
   * @param ec
   * @param timeout
   */
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
  public async findAnyElementByText(text: string, timeout: number = 3000) {
    const xpath: string = `//div[text()="${text}"]`;
    const by: By = By.xpath(xpath);
    return this.findElement(by, undefined, timeout);
  }

  /**
   * Take a screenshot and save.
   * @param filename
   */
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
  public async sendKeys(webElement: WebElement, ...args) {
    await webElement.sendKeys(...args);
  }

  /**
   * Click element.
   * @param webElement
   */
  public async click(webElement: WebElement) {
    await webElement.click();
  }

  /**
   * Sleep.
   * @param time
   */
  public async sleep(time: number) {
    await this.webDriver.sleep(time);
  }
}
