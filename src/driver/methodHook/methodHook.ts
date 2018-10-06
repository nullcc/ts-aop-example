import { WebDriver } from "selenium-webdriver";
import { BaseWebDriver } from "./base";

export class MethodHookWebDriver extends BaseWebDriver {
  protected webDriver: WebDriver;

  constructor(webDriver) {
    super(webDriver);
    this.webDriver = webDriver;
  }

  /**
   * Register before action and after action for methods.
   * @param methods
   * @param beforeAction
   * @param afterAction
   */
  public registerHooksForMethods(
    methods: string[],
    beforeAction: Function,
    afterAction: Function
  ) {
    const self = this;
    methods.forEach(method => {
      const originalMethod = self[method]; // original method reference
      if (originalMethod) {
        self[method] = async (...args) => {
          // wrap original method
          const beforeActionRes = await beforeAction();
          const methodRes = await originalMethod.call(self, ...args);
          await afterAction(beforeActionRes, methodRes);
          return methodRes;
        };
      }
    });
  }
}
