class BaseObject {
  public getClass() {
    return this.constructor.prototype.constructor;
  }

  public getClassName() {
    return this.constructor.name;
  }

  // public getInstanceMethodNames() {
  //   const proto = Object.getPrototypeOf(this);
  //   const names = Object.get(proto);  // getOwnPropertyNames
  //   return names.filter(name => typeof this[name] === "function");
  // }

  public getInstanceMethodNames() {
    let props = [];
    let obj = this;
    
    do {
        props = props.concat(Object.getOwnPropertyNames(obj));
        obj = Object.getPrototypeOf(obj);
    } while (obj);
    return props;
    // return props.sort().filter((e, i, arr) => {
    //   if ( e !== arr[i+1] && obj[e] && typeof obj[e] === 'function') {
    //     return true;
    //   }
    // });
  }
}

export { BaseObject };
