import { WebDriver } from "selenium-webdriver";
import { BaseWebDriver } from "./base";

export class DynamicOnionWebDriver extends BaseWebDriver {
  protected webDriver: WebDriver;
  private middlewares = [];

  constructor(webDriver) {
    super(webDriver);
    const methods = this.getWebDriverMethods();
    const self = this;
    for (const method of methods) {
      const desc = {
        enumerable: true,
        configurable: true,
        get() {
          if (methods.includes(method) && this.compose) {
            const ctx = { // put some information in ctx if necessary
              methodName: method,
            }
            const originFn = async (...args) => {
              return this.methodMap[method].call(self, ...args);
            };
            const fn = this.compose();
            return fn.bind(null, ctx, originFn.bind(self));
          }
          return this.methodMap[method].bind(this);
        },
        set(value) {
          this[method] = value;
        }
      };
      Object.defineProperty(this, method, desc);
    }
  }

  public use(middleware) {
    if (typeof middleware !== "function") {
      throw new TypeError("Middleware must be a function!");
    }
    this.middlewares.push(middleware);
  }

  private compose() {
    const middlewares = this.middlewares;
    const self = this;
    return async (ctx, next, ...args) => {
      let res;
      const dispatch = async i => {
        let fn = middlewares[i];
        if (i === middlewares.length) {
          fn = next;
        }
        if (!fn) {
          return Promise.resolve();
        }
        try {
          if (i === middlewares.length) {
            res = await Promise.resolve(fn.call(self, ...args));
            return res;
          }
          return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
        } catch (err) {
          return Promise.reject(err);
        }
      };
      await dispatch(0);
      return res;
    };
  }
}
