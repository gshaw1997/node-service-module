import {
  DependencyContainer,
  InjectionKey,
  Class,
} from './DependencyContainer';

/**
 * Defines a valid provider object type
 */
type Constructor<T> = Function & { prototype: T };

/**
 * Defines a ClassProvider which is used for defining a dependency and it's key
 */
export interface ClassProvider {
  provide: Constructor<any> | InjectionKey;
  useClass: Class<any> | any;
}

/**
 * Provides reusable set of functions and properties for building a ServiceModule
 *
 * @export
 * @abstract
 * @class ServiceModule
 */
export abstract class ServiceModule {
  private static dependencies: DependencyContainer;
  private static providerKeys: InjectionKey[] = [];
  private static _initialized: boolean = false;

  protected constructor() {}

  /**
   * Returns the initialized property
   * This flag indicates whether or not the module has been initialized
   *
   * @readonly
   * @protected
   * @static
   * @type {boolean}
   * @memberof ServiceModule
   */
  protected static get initialized(): boolean {
    return this._initialized;
  }

  /**
   * Initializes module and it's dependencies
   * Only one instance of a ServiceModule can be initialized at a time.
   * To re-initialize the module (say if you want to provide new dependencies) the module must be initialized by destroying the module and re-initializing
   *
   *
   * @static
   * @memberof ServiceModule
   */
  public static initialize(): void {
    if (!this._initialized) {
      this.dependencies.initialize();
      this._initialized = true;
    } else {
      throw new Error(
        `${
          this.name
        } is already initialized. Please destroy the existing instance of this module before initializing a new one.`,
      );
    }
  }

  /**
   * Destroys references to this module. Used for teardown
   *
   * @static
   * @memberof ServiceModule
   */
  public static destroy(): void {
    if (this._initialized) {
      this.dependencies = new DependencyContainer();
      this.providerKeys = [];
      this._initialized = false;
    } else {
      throw new Error(`No instance of ${this.name} has been initialized.`);
    }
  }

  /**
   * Sets the module's providers (dependencies) and registers them with the dependency container for instantiation upon module initialization
   *
   * @static
   * @memberof ServiceModule
   */
  public static set providers(myProviders: ClassProvider[]) {
    this.dependencies = new DependencyContainer();
    if (!this._initialized) {
      myProviders.forEach(provider => {
        let injectionKey = '';
        if (typeof provider.provide === 'string') {
          injectionKey = provider.provide;
        } else {
          injectionKey = provider.provide.name;
        }
        this.providerKeys.push(injectionKey);
        this.dependencies.register(injectionKey, provider.useClass);
      });
    } else {
      throw new Error(
        `${
          this.name
        } has already been initialized. Cannot set providers after module is initialized.`,
      );
    }
  }

  /**
   * Resolves the requested dependency if the module has been initialized
   *
   * @static
   * @template T
   * @param {Constructor<T> | InjectionKey} dependency
   * @returns {T}
   * @memberof ServiceModule
   */
  public static resolveDependency<T>(
    dependency: Constructor<T> | InjectionKey,
  ): T {
    if (!this._initialized) {
      throw new Error(
        `${
          this.name
        } has not yet been initialized. Please use the initializer to utilize this module.`,
      );
    }
    let dependencyKey = '';
    if (typeof dependency === 'string') {
      dependencyKey = dependency;
    } else {
      dependencyKey = dependency.name;
    }
    if (!this.providerKeys.includes(dependencyKey)) {
      throw new Error(`Nothing provided for ${dependencyKey}.`);
    }
    return this.dependencies.resolve(dependencyKey);
  }
}

/**
 * Decorator for the ServiceModule Class
 * Provides a clean interface for setting module's providers
 *
 * @export
 * @param {ClassProvider[]} providers [List of static dependencies to provide to the module]
 * @returns
 */
export function serviceModule({
  providers = [],
}: {
  providers: ClassProvider[];
}) {
  return (target: any) => {
    target.providers = providers;
  };
}
