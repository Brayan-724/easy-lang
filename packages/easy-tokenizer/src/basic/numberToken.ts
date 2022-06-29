import {
  CustomTokenMeta,
  FactoredTokenFactory, Token,
  TokenEnum, TokenizerError,
  TokenizerTriggerBuilder, TokenTypeEnum,
  type TokenizerVisited, type TokenizerVisitor
} from "@";

class NumberTokenMeta extends CustomTokenMeta {
  constructor(
    public readonly isNegative: boolean,
    public readonly isFloat: boolean
  ) {
    super();
  }
}

export class NumberToken extends Token<
  TokenEnum.NUMBER,
  TokenTypeEnum.NUMBER,
  NumberTokenMeta
> {
  tokenName: string = "Number";
  token: TokenEnum.NUMBER = TokenEnum.NUMBER;
  tokenType: TokenTypeEnum.NUMBER = TokenTypeEnum.NUMBER;

  static isNumeric(char: string): boolean {
    return /[0-9]/.test(char);
  }
}

export class NumberTokenFactory extends FactoredTokenFactory<NumberToken> {
  constructor() {
    super("Number", NumberToken);
  }

  _movement(visitor: TokenizerVisitor): string | TokenizerError | false {
    const sharedmeta = visitor.context.useSharedMeta("NumberToken");

    switch (visitor.actualChar) {
      case " ":
      case "\t":
      case "\n":
      case "\r":
        return false;

      case "_":
        if (!visitor.tryAdvance()) return false;
        return this._movement(visitor);

      case ".":
        const alreadyHasFloat = sharedmeta.get("isFloat") === true;
        if (alreadyHasFloat) {
          return new TokenizerError("Unexpected dot", visitor.context.meta);
        }
        const number_ = visitor.actualChar;
        if (
          !visitor.tryAdvance() ||
          !NumberToken.isNumeric(visitor.actualChar)
        ) {
          return new TokenizerError(
            "Trailing dot in number",
            visitor.context.meta
          );
        }

        sharedmeta.set("isFloat", true);

        const movement_ = this._movement(visitor);

        if (movement_ === false) {
          return number_;
        }

        if (movement_ instanceof TokenizerError) {
          return movement_;
        }

        return number_ + movement_;

      default:
        if (!NumberToken.isNumeric(visitor.actualChar)) {
          return new TokenizerError("Not a number", visitor.context.meta);
        }

        const number = visitor.actualChar;
        if (!visitor.tryAdvance()) {
          return number;
        }

        const movement = this._movement(visitor);

        if (movement === false) {
          return number;
        }

        if (movement instanceof TokenizerError) {
          return movement;
        }

        return number + movement;
    }
  }

  visit(visitor: TokenizerVisitor): TokenizerVisited {
    const meta = visitor.context.meta;
    const sharedmeta = visitor.context.useSharedMeta("NumberToken");

    sharedmeta.clear();

    let isNegative = false;

    if (visitor.actualChar === "-") {
      if (!visitor.tryAdvance()) {
        return false;
      }

      isNegative = true;
    }

    const value = this._movement(visitor);

    if (value === false) {
      return false;
    }

    if (value instanceof TokenizerError) {
      return value;
    }

    const numberMeta = new NumberTokenMeta(
      isNegative,
      sharedmeta.get("isFloat") === true
    );

    return this.create(value, meta, numberMeta);
  }

  override visitTrigger(visitor: TokenizerVisitor): boolean {
    return new TokenizerTriggerBuilder<[], [string]>([])
      .setTrigger((visitor) => {
        if (NumberToken.isNumeric(visitor.actualChar)) {
          return true;
        }

        return [visitor.actualChar];
      })
      .addTrigger((visitor, firstChar) => {
        const secondChar = visitor.tryPeek(1) || "";

        const secondCharIsNumberic = NumberToken.isNumeric(secondChar);

        if (firstChar === "-") {
          return secondCharIsNumberic;
        }

        if (firstChar === ".") {
          return secondCharIsNumberic;
        }

        return [firstChar, secondChar];
      })
      .addTrigger<[]>((visitor, firstChar, secondChar) => {
        const thirdChar = visitor.tryPeek(2) || "";

        if (firstChar === "-" && secondChar === ".") {
          return NumberToken.isNumeric(thirdChar);
        }

        return false;
      })
      .build()
      .execute(visitor);
  }
}
