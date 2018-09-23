class BaseObject {
  public getClass() {
    return this.constructor.prototype.constructor;
  }

  public getClassName() {
    return this.constructor.name;
  }

  public getInstanceMethodNames() {
    const proto = Object.getPrototypeOf(this);
    const names = Object.getOwnPropertyNames(proto);
    return names.filter(name => typeof this[name] === "function");
  }
}

export { BaseObject };
