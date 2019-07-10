/**
 * Named type for keys of injected objects
 */
export type InjectionKey = string;

/**
 * Defines Class type
 */
export interface Class<T> extends Function {
  new (...args: any[]): T;
}

/**
 * Storage container for dependencies
 *
 * @export
 * @class DependencyContainer
 */
export class DependencyContainer {
  private container: Map<InjectionKey, Class<any> | any> = new Map();

  /**
   * Initializes dependencies by instantiating the classes and storing the instance of the class in the container
   *
   * @memberof DependencyContainer
   */
  public initialize() {
    this.container.forEach((val, key) => {
      let dependency = val;
      if (this.isConstructable(val)) {
        dependency = this.buildConstructable(val);
      }
      this.register(key, dependency);
    });
  }

  /**
   * Registers a dependency within the container without instantiating
   *
   * @param {InjectionKey} key [The key the dependency should be stored at]
   * @param {Injectable<any>} value [The class construct to be stored in the container]
   * @memberof DependencyContainer
   */
  public register(key: InjectionKey, value: Class<any> | any) {
    this.container.set(key, value);
  }

  /**
   * Resolves requested dependency from container
   *
   * @template T
   * @param {InjectionKey} key [The key the dependency should be stored at]
   * @returns {T}
   * @memberof DependencyContainer
   */
  public resolve<T>(key: InjectionKey): T {
    return (this.container.get(key) as any) as T;
  }

  /**
   * Checks if object can be created using the `new` keyword
   *
   * @private
   * @param {(Class<any> | any)} object [The object to test]
   * @returns {boolean}
   * @memberof DependencyContainer
   */
  private isConstructable(object: Class<any> | any): boolean {
    try {
      new object();
    } catch (err) {
      if (err.message.indexOf('is not a constructor') >= 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Creates and returns a new instance of the constructable object and copies over existing static properties and methods to object instance
   *
   * @private
   * @param {Class<any>} object [The object to be constructed]
   * @returns {Class<any>} [The instance of the object with existing static properties]
   * @memberof DependencyContainer
   */
  private buildConstructable(object: Class<any>): Class<any> {
    const staticPropKeys = Object.keys(object);
    const staticClassPrototype: { [index: string]: any } = { ...object };
    const constructable = new object();
    staticPropKeys.forEach(
      key => (constructable[key] = staticClassPrototype[key]),
    );
    return constructable;
  }
}
