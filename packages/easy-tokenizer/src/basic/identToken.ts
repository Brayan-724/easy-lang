import { FactoredTokenFactory } from "@/client";
import { TokenEnum, TokenTypeEnum } from "@/enums";
import { Token } from "@/Token";
import { TokenizerVisitor, TokenizerVisited } from "@/Tokenizer";

export class IdentToken extends Token<
  TokenEnum.OTHER,
  TokenTypeEnum.IDENTIFIER
> {
  override readonly tokenName: string = "Ident";
  override readonly token: TokenEnum.OTHER = TokenEnum.OTHER;
  override readonly tokenType: TokenTypeEnum.IDENTIFIER =
    TokenTypeEnum.IDENTIFIER;
}

export class IdentTokenFactory extends FactoredTokenFactory<IdentToken> {
  static readonly identRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

  constructor() {
    super("", IdentToken);
  }

  override visit(visitor: TokenizerVisitor): TokenizerVisited {
    const meta = visitor.context.meta;
    const next = visitor.tryPeek(0);
    if (next === false) return false;

    function _next(): string | false {
      const next = visitor.tryPeek(1);
      if (next === false) return false;

      if (!IdentTokenFactory.identRegex.test(next)) {
        return "";
      }

      const ad = visitor.tryAdvance();
      if (ad === false) return false;
      const v = _next();
      if (typeof v !== "string") return v;

      return next + v;
    }

    const value = _next();

    if (typeof value !== "string") {
      return value;
    }

    return this.create(next + value, meta, undefined);
  }

  override visitTrigger(visitor: TokenizerVisitor): boolean {
    return IdentTokenFactory.identRegex.test(visitor.actualChar);
  }
}
