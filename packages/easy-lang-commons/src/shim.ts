export type TFunction<F extends (...args: any[]) => any> = F extends (
  ...args: infer A
) => infer R
  ? CFunction<A, R>
  : never;
export interface CFunction<A extends Array<any>, R> extends Function {
  bind(thisArg: any): (...args: A) => R;
}

export interface Newable<T> {
  new (...args: any[]): T;
  prototype: T;
  name: string;
}

export type NotNewable<T> = T extends abstract new (...args: any[]) => infer R
  ? R
  : T extends Newable<infer R>
  ? R
  : never;

export interface Serializable<T> {
  toJSON(): T;
  toString(): string;
}

export type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};
