import { TokenEnum, TokenTypeEnum } from "@/enums";
import type { Serializable } from "@/shim";
import { CustomTokenMeta } from "./CustomTokenMeta";
import type { TokenMeta, TokenMetaSerialized } from "./TokenMeta";

export type GetTokenProperties<T extends Token> = T extends Token<
  infer T_,
  infer TT,
  infer CM
>
  ? [T_, TT, CM]
  : never;

export type GetTokenEnum<T extends Token> = T extends Token<infer T_, any, any>
  ? T_
  : never;
export type GetTokenTypeEnum<T extends Token> = T extends Token<
  any,
  infer TT,
  any
>
  ? TT
  : never;
export type GetCustomTokenMeta<T extends Token> = T extends Token<
  any,
  any,
  infer CM
>
  ? CM
  : never;

export interface TokenSerialized {
  tokenName: string;
  token: TokenEnum;
  tokenType: TokenTypeEnum;
  value: string;
  meta: TokenMetaSerialized;
}

export abstract class Token<
  T extends TokenEnum = TokenEnum,
  TT extends TokenTypeEnum = TokenTypeEnum,
  CM extends CustomTokenMeta | undefined = CustomTokenMeta | undefined
> implements Serializable<TokenSerialized>
{
  abstract readonly tokenName: string;
  abstract readonly token: T;
  abstract readonly tokenType: TT;

  constructor(
    public readonly value: string,
    public readonly meta: TokenMeta,
    public readonly _customMeta: CM
  ) {}

  toString(): string {
    const _customMeta =
      this._customMeta instanceof CustomTokenMeta
        ? this._customMeta.toJSON()
        : undefined;

    const meta =
      _customMeta !== undefined
        ? Object.entries(_customMeta)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")
        : "no custom meta";

    return `${this.tokenName}(${this.value}, ${meta})`;
  }

  toJSON(): TokenSerialized {
    return {
      tokenName: this.tokenName,
      token: this.token,
      tokenType: this.tokenType,
      value: this.value,
      meta: this.meta.toJSON(),
    };
  }
}
