import { FactoredTokenFactory } from "@client";
import { ParenStateEnum, TokenEnum, TokenTypeEnum } from "@/enums";
import { Newable } from "@/shim";
import { CustomTokenMeta, Token } from "@Token";
import { TokenizerVisitor, TokenizerVisited } from "@/Tokenizer";

export class ParenTokenMeta extends CustomTokenMeta {
  constructor(public readonly state: ParenStateEnum) {
    super();
  }
}

abstract class BaseParenToken<T extends TokenEnum> extends Token<
  T,
  TokenTypeEnum.PUNCTUATION,
  ParenTokenMeta
> {
  abstract override tokenName: string;
  tokenType: TokenTypeEnum.PUNCTUATION = TokenTypeEnum.PUNCTUATION;
}

abstract class BaseParenTokenFactory<
  T extends TokenEnum
> extends FactoredTokenFactory<BaseParenToken<T>> {
  abstract readonly openChar: string;
  abstract readonly closeChar: string;

  constructor(tokenClass: Newable<BaseParenToken<T>>) {
    super("", tokenClass);
  }

  private getCustomMeta(char_: string): ParenTokenMeta | null {
    switch (char_) {
      case this.openChar:
        return new ParenTokenMeta(ParenStateEnum.OPEN);
      case this.closeChar:
        return new ParenTokenMeta(ParenStateEnum.CLOSE);
      default:
        return null;
    }
  }

  override visit(visitor: TokenizerVisitor): TokenizerVisited {
    const meta = this.getCustomMeta(visitor.actualChar);

    if (meta === null) {
      return false;
    }

    return this.create(visitor.actualChar, visitor.context.meta, meta);
  }

  override visitTrigger(visitor: TokenizerVisitor): boolean {
    return (
      visitor.actualChar === this.openChar ||
      visitor.actualChar === this.closeChar
    );
  }
}

export class ParenToken extends BaseParenToken<TokenEnum.PAREN> {
  override tokenName: string = "Paren";
  override readonly token: TokenEnum.PAREN = TokenEnum.PAREN;
}

export class ParenTokenFactory extends BaseParenTokenFactory<TokenEnum.PAREN> {
  override readonly openChar: string = "(";
  override readonly closeChar: string = ")";

  constructor() {
    super(ParenToken);
  }
}

export class BracketToken extends BaseParenToken<TokenEnum.BRACKET> {
  override tokenName: string = "Bracket";
  override readonly token: TokenEnum.BRACKET = TokenEnum.BRACKET;
}

export class BracketTokenFactory extends BaseParenTokenFactory<TokenEnum.BRACKET> {
  override readonly openChar: string = "[";
  override readonly closeChar: string = "]";

  constructor() {
    super(BracketToken);
  }
}

export class BraceToken extends BaseParenToken<TokenEnum.BRACE> {
  override tokenName: string = "Brace";
  override readonly token: TokenEnum.BRACE = TokenEnum.BRACE;
}

export class BraceTokenFactory extends BaseParenTokenFactory<TokenEnum.BRACE> {
  override readonly openChar: string = "{";
  override readonly closeChar: string = "}";

  constructor() {
    super(BraceToken);
  }
}
