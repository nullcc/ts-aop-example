class BaseObject {
  constructor() { }

  getClass() {
    return this.constructor.prototype.constructor;
  }

  getClassName() {
    return this.constructor.name;
  }

  // for instance
  getPrototypeChain() {
    let obj = this;
    let protoChain = [];
    while (obj = Object.getPrototypeOf(obj)) {
        protoChain.push(obj);
    }
    protoChain.push(null);
    protoChain.splice(0, 0, this);
    return protoChain;
  }

  // for class
  static getPrototypeChain() {
    let obj = this;
    let protoChain = [];
    while (obj = Object.getPrototypeOf(obj)) {
        protoChain.push(obj);
    }
    protoChain.push(null);
    protoChain.splice(0, 0, this);
    return protoChain;
  }

  getInstanceMethodNames () {
    const proto = Object.getPrototypeOf(this);
    const names = Object.getOwnPropertyNames(proto);
    return names.filter (name => typeof this[name] === 'function');
  }
}

export {
  BaseObject
}
