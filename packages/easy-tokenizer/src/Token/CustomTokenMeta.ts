import type { Serializable } from "@/shim";

export type CustomTokenMetaSerialized = Record<string, unknown>;

export class CustomTokenMeta
  implements Serializable<CustomTokenMetaSerialized>
{
  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  toJSON() {
    return Object.keys(this).reduce<Record<string, unknown>>((acc, key) => {
      // @ts-ignore
      acc[key] = this[key];
      return acc;
    }, {});
  }
}
