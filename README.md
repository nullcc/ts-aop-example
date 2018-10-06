# TS AOP

## AOP Overview

Aspect Oriented Programming (AOP), Chinese meaning is "面向切面编程". We can separate parts of business 
logic with AOP to reduce coupling of them.

Let's image a very common situation, beside execute necessary automated operations, we also need to do 
something like logging, save screenshot when we use selenium-webdriver to do web automated testing. It is obvious that these operations is not strongly related with business logic, but we sure need them. Now the situation is that we need these functions but we no hope to include these code explicitly in modeling stage. So we want a new way to reslove it.

For example, we want to recode time consuming and take a screenshot after every step in web automated testing. The simplest way is to put the code which record time consuming and take a screenshot in every step. But disadvantages of this approach is if we have many step, things will become uncontrollable. It's 
impossible to maintain thousands of steps which there are lots of similar code in every step.

AOP makes it possible to resolve this problem elegantly.


## AOP vs OOP

We are familiar with Object Oriented Programming (OOP). When we get a requirements, firstly we analyze the requirements and extract some domain models. Every domain model has its own attributes and methods. People using encapsulatioBase on thesen, composition, inheritance, polymorphism and design patterns to building software and practice the thinking of OOP.

If you have experiences about building software with OOP you will find that OOP is to model static things.
In other words, OOP is for nouns. For example, we have a `Employee` class with attributes `name`, `age`, `title` and `department`, with methods `work`, `takeABreak` and `loginAdminSystem`. Attributes describe characteristics of objects, and methods are the operations objects can execute. Base on these, we can write some OO code:

```typescript
class Employee {
  private name: string;
  private age: number;
  private title: string;
  private department: string;

  constructor(name: string, age: number, title: string, department: string) {
    this.name = name;
    this.age = age;
    this.title = title;
    this.department = department;
  }

  public work() {
    // code for working...
  }

  public takeABreak() {
    // code for taking a break...
  }

  public loginAdminSystem() {
    // code for logining admin system, it's a sensitive operation
  }
}

const employee = new Employee('Bob', 35, 'Software Development Engineer', 'Devlopment');
employee.work();
employee.takeABreak();
```

Above code is strong related with Employee class which form the business logic. There is no doubt that, OOP is very suitable for describing objects.

But sometime we may want some more "dynamic" things, such as we hope to logging while user is executing a sensitive operation. If we choose OOP implementation, we must modify the code of the sensitive operation `loginAdminSystem` to add logging code to it. Like this:

```typescript
...
public loginAdminSystem() {
  // added: code for logging some information
  // code for logining admin system
}
...
```

It's work of course, but no elegant. Actually it againsts OCP (open closed principle). Logging are not strongly correlated with the sensitive operation above. We had better do not to modify business logic to add logging feature. 

But how to reslove it? We can try AOP. Simplely, we can expose two sections in specific operation: one before it and another after it, then weave in other functions dynamically in runtime. That is to say AOP is for verbs. Our code will become more elegant and extendable with the cooperation of OOP and AOP.

A simple example: function wrapping. Assume we have a function `op`, we want to logging something before and after it:

```
let op = () => {
  console.log('executing op...');
};

let oriOp = op;

op = () => {
  console.log('before op...');
  oriOp();
  console.log('after op...');
}
```

This time we wrap the function instead of modifying it.

AOP code in project is more complex than code above. Basically we need some meta programming technique to support AOP. But the basic principle is similar with code above. It is worth mentioning that AOP is a programming concept, but not own by a specific programming language. Most of programming languages can be written in AOP way.


## Solution 1 - Simple Method Hooks

Solution 1 use hooks (before/after action) to wrap original method to new method, we put the auxiliary functions in hooks.
See [base driver](./src/driver/methodHook/base.ts) and [method hook driver](./src/driver/methodHook/methodHook.ts).

Issues: It's difficult to handle relationship between before action and after action. For example, if we want to record time consuming of an action, the before action and after action will be:

```typescript
// before action
const recordStartTime = async () => {
  const start = new Date().getTime();
  return start;
};

// after action
const recordEndTime = async start => {
  const end = new Date().getTime();
  const consume = end - start;
  console.log(`time consume: ${consume}ms`);
};
```

and `registerHooksForMethods`:

```typescript
public registerHooksForMethods(
    methods: string[],
    beforeAction: Function,
    afterAction: Function
  ) {
    const self = this;
    methods.forEach(method => {
      const originalMethod = self[method]; // original method reference
      if (originalMethod) {
        self[method] = async (...args) => { // wrap original method
          const beforeActionRes = await beforeAction();
          const methodRes = await originalMethod.call(self, ...args);
          await afterAction(beforeActionRes, methodRes);
          return methodRes;
        };
      }
    });
  }
```

As you can see above, in `registerHooksForMethods` method, we have to get the return value of before action and pass it to after action which implementation is ugly and inflexible.

So, we give up this solution even it may work.


## Solution 2 - Static Onion Model

Let's look at an interesting model first: middleware onion model in [Koa](https://koajs.com/):

![Koa middileware onion model](./images/koa_onion.png)

See [base driver](./src/driver/staticOnion/base.ts) and [static onion driver](./src/driver/staticOnion/staticOnion.ts).

Static onion model is much better than method hook. It use onion model to reslove issues in method hook solution. We use a decorator to decorate methods:

```typescript
// decorator
export const webDriverMethod = () => {
  return (target, methodName: string, descriptor: PropertyDescriptor) => {
    const desc = {
      value: "webDriverMethod",
      writable: false
    };
    Object.defineProperty(target[methodName], "__type__", desc);
  };
};

// in BaseWebDriver class, a web driver method
@webDriverMethod()
public async findElement(
  by: By,
  ec: Function = until.elementLocated,
  timeout: number = 3000
) {
  await this.webDriver.wait(ec(by), timeout);
  return this.webDriver.findElement(by);
}
```

Call `use` method to add a middleware:

```typescript
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
      // check this: we must decorate new method every time when adding a middleware
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
```

But there is a little disadvantage: We must decorate new method every time when adding a middleware. In order to avoid this, we can wrap the method in runtime dynamically. Let's move on to Solution 3.


## Solution 3 - Dynamic Onion Model

See [base driver](./src/driver/dynamicOnion/base.ts) and [dynamic onion driver](./src/driver/dynamicOnion/dynamicOnion.ts).

```typescript
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
```

Dynamic onion model is much complex than solution 1 and 2. We use `Object.defineProperty` to define our getter for every method which is taged by `webDriverMethod` decorator. The `compose` method is the key to organize all middlewares and the original method, method getter will call `compose` method when we want to get a method and finally return a wrapped method.

Dynamic onion model is a little difficult to understand but it is worthy to take your time to learn it.

BTW: method hook, static onion model and dynamic onion model these names is invented by myself, if you find a better way to describe them, please tell me.


## Run tests

```shell
npm test
```


## More Informations

- [什么是面向切面编程AOP](https://www.zhihu.com/question/24863332)
- [Koa Web Framework](https://koajs.com/)
- [Object.defineProperty()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)