import type { TokenEnum, TokenTypeEnum } from "@/enums";
import type { Newable } from "@/shim";
import { createClass } from "@/_utils";
import { Token, type CustomTokenMeta, type TokenMeta } from "@Token";

export function createTokenClass<
  T extends TokenEnum,
  TT extends TokenTypeEnum,
  CM extends CustomTokenMeta | undefined = undefined
>(tokenName: string, token: T, tokenType: TT): Newable<Token<T, TT, CM>> {
  return createClass(
    tokenName,
    class BuildedToken extends Token<T, TT, CM> {
      tokenName: string = tokenName;
      token: T = token;
      tokenType: TT = tokenType;

      constructor(value: string, meta: TokenMeta, customMeta: CM) {
        super(value, meta, customMeta);
      }
    }
  );
}
