import type { Serializable } from "@/shim";

export interface TokenMetaSerialized {
  line: number;
  column: number;
}

export class TokenMeta implements Serializable<TokenMetaSerialized> {
  constructor(public readonly line: number, public readonly column: number) {}

  toString(): string {
    return `${this.line + 1}:${this.column + 1}`;
  }

  toJSON(): TokenMetaSerialized {
    return {
      line: this.line,
      column: this.column,
    };
  }
}
