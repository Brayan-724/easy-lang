import { Mutable, Newable } from "@/shim";

export function createClass<T>(name: string, klass: Newable<T>): Newable<T> {
  const klass_ = klass as Mutable<Newable<T>>;

  // @ts-ignore - `name` is a read-only property
  // klass_["name" as any] = name;
  
  // @ts-ignore - We want add a symbol without changes in the typo
  klass_.prototype[Symbol.toStringTag] = name;

  return klass_ as Newable<T>;
}

export function arrayN<T = unknown>(n: number): T[] {
  return Array.from({ length: n });
}