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
  private container: Map<InjectionKey, Class<any>> = new Map();

  /**
   * Initializes dependencies by instantiating the classes and storing the instance of the class in the container
   *
   * @memberof DependencyContainer
   */
  public initialize() {
    this.container.forEach((val, key) => {
      this.register(key, new (<Class<any>> val)());
    });
  }

  /**
   * Registers a dependency within the container without instantiating
   *
   * @param {InjectionKey} key [The key the dependency should be stored at]
   * @param {Injectable<any>} value [The class construct to be stored in the container]
   * @memberof DependencyContainer
   */
  public register(key: InjectionKey, value: Class<any>) {
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
}
