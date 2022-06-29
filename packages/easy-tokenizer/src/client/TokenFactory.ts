import type { Newable } from "@/shim";
import type {
  GetCustomTokenMeta,
  GetTokenEnum,
  GetTokenTypeEnum,
  Token,
  TokenMeta
} from "@Token";
import type {
  TokenizerVisitable,
  TokenizerVisited,
  TokenizerVisitor
} from "@Tokenizer";

export abstract class TokenFactory<TK extends Token = Token>
  implements TokenizerVisitable
{
  readonly tokenName: string;
  readonly token: GetTokenEnum<TK>;
  readonly tokenType: GetTokenTypeEnum<TK>;

  constructor(readonly tokenClass: Newable<TK>) {
    const tokenInstance = new tokenClass("", {});
    this.tokenName = tokenInstance.tokenName;
    this.token = tokenInstance.token as GetTokenEnum<TK>;
    this.tokenType = tokenInstance.tokenType as GetTokenTypeEnum<TK>;
  }

  create(
    value: string,
    meta: TokenMeta,
    customMeta: GetCustomTokenMeta<TK>
  ): TK {
    return new this.tokenClass(value, meta, customMeta);
  }

  visitTrigger(_visitor: TokenizerVisitor): boolean {
    return true;
  }

  abstract visit(visitor: TokenizerVisitor): TokenizerVisited;
}
