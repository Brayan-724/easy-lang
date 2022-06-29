import type { TokenEnum, TokenTypeEnum } from "@/enums";
import type { Newable } from "@/shim";
import type { CustomTokenMeta, Token } from "@Token";
import { TokenBuilderGroup } from "@user-helpers";
import type { TokenFactory } from "./TokenFactory";

export function createKeywordsTokens<
  T extends TokenEnum,
  TT extends TokenTypeEnum,
  CM extends CustomTokenMeta | undefined = CustomTokenMeta | undefined
>(
  keywords: string[],
  tokenEnum: T,
  tokenTypeEnum: TT,
  customMetaGenerator: CM extends undefined
    ? undefined
    : (keyword: string) => CM
): [Newable<Token<T, TT, CM>>, Newable<TokenFactory<Token<T, TT, CM>>>] {
  const tokenBuilderGroup = new TokenBuilderGroup(
    tokenEnum,
    tokenTypeEnum,
    customMetaGenerator
  );

  for (const keyword of keywords) {
    tokenBuilderGroup.add(keyword);
  }

  return tokenBuilderGroup.build();
}
