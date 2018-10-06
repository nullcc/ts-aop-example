import { WebDriver } from "selenium-webdriver";
import { BaseWebDriver } from "./base";

export class StaticOnionWebDriver extends BaseWebDriver {
  protected webDriver: WebDriver;

  constructor(webDriver) {
    super(webDriver);
  }

  public use(middleware) {
    const webDriverMethods = this.getWebDriverMethods();
    const self = this;
    for (const method of webDriverMethods) {
      const originalMethod = this[method];
      if (originalMethod) {
        this[method] = async (...args) => {
          let result;
          const ctx = {
            methodName: method,
            args
          };
          await middleware(ctx, async () => {
            result = await originalMethod.call(self, ...args);
          });
          return result;
        };
        this.decorate(this[method]);
      }
    }
  }

  private decorate(method) {
    const desc = {
      value: "webDriverMethod",
      writable: false
    };
    Object.defineProperty(method, "__type__", desc);
  }
}
