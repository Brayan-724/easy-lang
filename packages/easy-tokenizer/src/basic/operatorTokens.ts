import { TokenEnum, TokenTypeEnum } from "@/enums";
import { Newable } from "@/shim";
import { FactoredTokenFactory } from "@client";
import { Token } from "@Token";
import { TokenizerVisited, TokenizerVisitor } from "@Tokenizer";

abstract class BaseOperatorToken<T extends TokenEnum> extends Token<
  T,
  TokenTypeEnum.OPERATOR,
  undefined
> {
  abstract override tokenName: string;
  tokenType: TokenTypeEnum.OPERATOR = TokenTypeEnum.OPERATOR;
}

abstract class BaseOperatorTokenFactory<
  T extends TokenEnum
> extends FactoredTokenFactory<BaseOperatorToken<T>> {
  abstract readonly operator: string;

  constructor(tokenClass: Newable<BaseOperatorToken<T>>) {
    super("", tokenClass);
  }

  visit(visitor: TokenizerVisitor): TokenizerVisited {
    return this.create(visitor.actualChar, visitor.context.meta, undefined);
  }

  override visitTrigger(_visitor: TokenizerVisitor): boolean {
    const startWith = _visitor.actualChar === this.operator[0];
    if (!startWith) return false;

    const nextChar = _visitor.tryPeek(1);

    if (nextChar === false) return false;

    return nextChar !== "=";
  }
}

export class PlusToken extends BaseOperatorToken<TokenEnum.PLUS> {
  override tokenName: string = "Plus";
  override readonly token: TokenEnum.PLUS = TokenEnum.PLUS;
}

export class PlusTokenFactory extends BaseOperatorTokenFactory<TokenEnum.PLUS> {
  override operator: string = "+";

  constructor() {
    super(PlusToken);
  }
}

export class StarToken extends BaseOperatorToken<TokenEnum.STAR> {
  override tokenName: string = "Star";
  override readonly token: TokenEnum.STAR = TokenEnum.STAR;
}

export class StarStarToken extends BaseOperatorToken<TokenEnum.STAR_STAR> {
  override tokenName: string = "StarStar";
  override readonly token: TokenEnum.STAR_STAR = TokenEnum.STAR_STAR;
}

export class StarTokenFactory extends BaseOperatorTokenFactory<TokenEnum.STAR> {
  override operator: string = "*";

  constructor() {
    super(StarToken);
  }

  override visit(visitor: TokenizerVisitor): TokenizerVisited {
    const isDoubled = visitor.tryPeek(1) === "*";

    if (isDoubled) {
      visitor.advance(1);
      return new StarStarToken(
        "**",
        visitor.context.meta,
        undefined
      );
    }

    return this.create(visitor.actualChar, visitor.context.meta, undefined);
  }
}
