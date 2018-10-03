import { WebDriver } from "selenium-webdriver";
import { BaseWebDriver } from "./base";

export class OnionWebDriver extends BaseWebDriver {
  protected webDriver: WebDriver;

  constructor(webDriver) {
    super(webDriver);
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
}
