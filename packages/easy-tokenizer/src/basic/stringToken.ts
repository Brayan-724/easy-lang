import { TokenizerError } from "@/advice";
import { FactoredTokenFactory } from "@/client";
import { TokenEnum, TokenTypeEnum } from "@/enums";
import { Token } from "@/Token";
import { TokenizerVisited, TokenizerVisitor } from "@/Tokenizer";

export class StringToken extends Token<
  TokenEnum.STRING,
  TokenTypeEnum.STRING,
  undefined
> {
  override tokenName: string = "String";
  override readonly token: TokenEnum.STRING = TokenEnum.STRING;
  override readonly tokenType: TokenTypeEnum.STRING = TokenTypeEnum.STRING;
}

export class StringTokenFactory extends FactoredTokenFactory<StringToken> {
  constructor() {
    super("", StringToken);
  }

  visit(visitor: TokenizerVisitor): TokenizerVisited {
    let isEscaped = false;
    const meta = visitor.context.meta;

    function _next(): string | false | TokenizerError {
      const next = visitor.tryPeek(1);
      if (next === false) return false;

      if (next === "\\") {
        isEscaped = !isEscaped;

        const ad = visitor.tryAdvance();
        if (ad === false) return false;

        return _next();
      }

      if (next === '"' && !isEscaped) {
        const ad = visitor.tryAdvance();
        if (ad === false) return false;

        return "";
      }

      if (isEscaped) {
        isEscaped = false;
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

    return this.create(value, meta, undefined);
  }

  override visitTrigger(visitor: TokenizerVisitor): boolean {
    return visitor.actualChar === '"';
  }
}
