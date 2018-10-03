import { WebDriver } from "selenium-webdriver";
import { BaseWebDriver } from "./base";

export class OnionWebDriver extends BaseWebDriver {
  protected webDriver: WebDriver;
  private methodMap: any;

  constructor(webDriver) {
    super(webDriver);
    this.methodMap = {};
    const methods = this.getWebDriverMethods();

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
}
