class BaseObject {
  public getClass() {
    return this.constructor.prototype.constructor;
  }

  public getClassName() {
    return this.constructor.name;
  }

  public getInstanceMethodNames() {
    let props = [];
    let obj = this;
    do {
      props = props.concat(Object.getOwnPropertyNames(obj));
      obj = Object.getPrototypeOf(obj);
    } while (obj);
    return props.sort().filter((e, i, arr) => {
      if (e !== arr[i + 1] && this[e] && typeof this[e] === "function") {
        return true;
      }
    });
  }
}

export { BaseObject };
