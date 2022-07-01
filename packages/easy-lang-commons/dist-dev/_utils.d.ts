import type { Newable } from "./shim";
export declare function createClass<T>(name: string, klass: Newable<T>): Newable<T>;
export declare function arrayN<T = unknown>(n: number): T[];
