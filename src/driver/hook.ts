import { WebDriver } from "selenium-webdriver";
import { BaseWebDriver } from "./base";

export class HookWebDriver extends BaseWebDriver {
  protected webDriver: WebDriver;
  private methodMap: any;

  constructor(webDriver) {
    super(webDriver);
    this.webDriver = webDriver;
    this.methodMap = {};
    const methods = this.getWebDriverMethods();
    const self = this;
    methods.forEach(method => {
      self.methodMap[method] = self[method];
    });
  }

  public registerHooksForMethods(
    methods: string[],
    beforeAction: Function,
    afterAction: Function
  ) {
    const self = this;
    methods.forEach(method => {
      const originalMethod = self[method];
      if (originalMethod) {
        self[method] = async (...args) => {
          const beforeActionRes = await beforeAction();
          const methodRes = await originalMethod.call(self, ...args);
          await afterAction(beforeActionRes, methodRes);
          return methodRes;
        };
      }
    });
  }

  public getOriginalMethod(methodName) {
    return this.methodMap[methodName].bind(this);
  }
}
