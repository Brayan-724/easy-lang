import type { Mutable, Newable } from "./shim";

/**
 * **Mutex Gived Class**\
 * Modify `@toStringTag` to the given class.\
 * \
 * *This is principally used to give a god typing in ts.*
 * @param name Name to set to the class
 * @param klass Constructor of the class
 */
export function createClass<T extends Newable<any>>(name: string, klass: T): T {
  const klass_ = klass as Mutable<T>;

  // @ts-ignore - `name` is a read-only property
  // klass_["name" as any] = name;
  
  // @ts-ignore - We want add a symbol without changes in the typo
  klass_.prototype[Symbol.toStringTag] = name;

  return klass_ as T;
}

/**
 * Create a new array with the given length.
 * All elements are set to `undefined`.
 * @param n The number of elements to return
 */
export function arrayN<T = unknown>(n: number): T[] {
  return Array.from({ length: n });
}