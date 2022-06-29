import { TokenFactory, TokenizerTriggerBuilder } from "@/client";
import type { TokenEnum, TokenTypeEnum } from "@/enums";
import type { Newable } from "@/shim";
import { CustomTokenMeta, Token, TokenMeta } from "@/Token";
import type { TokenizerVisited, TokenizerVisitor } from "@/Tokenizer";
import { arrayN, createClass } from "@/_utils";

export class TokenBuilderGroup<
  T extends TokenEnum = TokenEnum,
  TT extends TokenTypeEnum = TokenTypeEnum,
  CM extends CustomTokenMeta | undefined = CustomTokenMeta | undefined
> {
  private static _lastId = 0;
  static readonly identRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

  readonly keywords: string[] = [];
  readonly id = TokenBuilderGroup._lastId++;

  readonly customMetaGenerator: CM extends undefined
    ? undefined
    : (keyword: string) => CM;

  constructor(
    readonly tokenEnum: T,
    readonly tokenTypeEnum: TT,
    customMetaGenerator: CM extends undefined
      ? undefined
      : (keyword: string) => CM
  ) {
    this.customMetaGenerator = customMetaGenerator;
  }

  add(keyword: string): void {
    this.keywords.push(keyword);
  }

  buildTrigger() {
    const triggerBuilder = new TokenizerTriggerBuilder<[], []>([]);

    triggerBuilder.setTrigger((visitor) => {
      const { actualChar } = visitor;

      for (const keyword of this.keywords) {
        if (actualChar === keyword[0]) {
          return true;
        }
      }

      return false;
    });

    return triggerBuilder.build();
  }

  build(): [
    Newable<Token<T, TT, CM>>,
    Newable<TokenFactory<Token<T, TT, CM>>>
  ] {
    const { uniqueKeywords } = this.getProperties();

    const [separatedByCharacters, maxLength] =
      this.getSeparatedCharacters(uniqueKeywords);

    const tokenClass = this.buildToken();

    const tokenFactoryClass = this.buildTokenFactory(
      tokenClass,
      separatedByCharacters,
      maxLength
    );

    return [tokenClass, tokenFactoryClass];
  }

  private buildTokenFactory(
    tokenClass: Newable<Token<T, TT, CM>>,
    separatedByCharacters: string[][],
    maxLength: number
  ) {
    const { id, uniqueKeywords, tokenFactoryName, tokenTrigger } =
      this.getProperties();

    const customMetaGenerator = this.customMetaGenerator;

    return createClass(
      tokenFactoryName,
      class BuildedTokenFactory extends TokenFactory<Token<T, TT, CM>> {
        readonly id = id;
        constructor() {
          super(tokenClass);
        }

        override create(value: string, meta: TokenMeta): Token<T, TT, CM> {
          const customMeta = customMetaGenerator?.(value);
          return new tokenClass(value, meta, customMeta);
        }

        override visit(visitor: TokenizerVisitor): TokenizerVisited {
          let index = 0;
          let possibles = arrayN<number>(uniqueKeywords.length).map(
            (_, i) => i
          );

          while (index < maxLength) {
            if (possibles.length === 0) return false;

            const actualChar = visitor.actualChar;

            for (const possible of possibles) {
              // Get the characters of the possible keyword at index
              const character = separatedByCharacters[index]![possible];

              // Preventing possibles errors or bugs (Same for similar code)
              if (typeof character === "undefined")
                return visitor.makeError(
                  "[Internal, Unreacheable] No character at index " + index
                );

              // If this keyword has ended
              if (
                character === "" &&
                !TokenBuilderGroup.identRegex.test(visitor.actualChar)
              ) {
                // And is the last one, then create it and return
                if (possibles.length >= 1) {
                  const keyword = uniqueKeywords[possible];

                  if (!keyword)
                    return visitor.makeError(
                      "[Internal, Unreacheable] No keyword at index " + index
                    );

                  return this.create(keyword, visitor.context.meta);
                } else {
                  // Else, remove it from the possibles
                  possibles = possibles.filter((p) => p !== possible);
                }
              }

              // If this character is different from the actual character
              // Then remove it from the possibles
              if (actualChar !== character) {
                possibles = possibles.filter((p) => p !== possible);
              }
            }

            index++;
            const out = visitor.tryAdvance();
            if (out === false)
              return visitor.makeError("Unexpected end of file");
          }

          // If we have a unique keyword, then create it and return
          if (possibles.length === 1) {
            const keyword = uniqueKeywords[possibles[0]!];

            if (!keyword)
              return visitor.makeError(
                "[Internal, Unreacheable] No keyword at index " + possibles[0]
              );

            return this.create(keyword, visitor.context.meta);
          }

          return false;
        }

        override visitTrigger(visitor: TokenizerVisitor): boolean {
          return tokenTrigger.execute(visitor);
        }
      }
    );
  }

  private buildToken() {
    const { tokenName, tokenEnum, tokenTypeEnum } = this.getProperties();

    return createClass(
      tokenName,
      class BuildedToken extends Token<T, TT, CM> {
        tokenName = tokenName;
        token = tokenEnum;
        tokenType = tokenTypeEnum;
      }
    );
  }

  private getProperties() {
    const id = this.id;
    const name = "Keywords" + id;
    const tokenName = `${name}Token`;
    const tokenFactoryName = `${name}Factory`;

    const tokenEnum = this.tokenEnum;
    const tokenTypeEnum = this.tokenTypeEnum;

    const keywords = this.keywords;
    const tokenTrigger = this.buildTrigger();

    const uniqueKeywords = keywords.filter((keyword, index) => {
      return keywords.indexOf(keyword) === index;
    });

    const properties = {
      id,
      uniqueKeywords,
      tokenName,
      tokenEnum,
      tokenTypeEnum,
      tokenFactoryName,
      tokenTrigger,
    };

    this.getProperties = () => properties;

    return properties;
  }

  /**
   * Separate the keywords into groups of characters\
   * That see like this:\
   *?| From:\
   *?| A B C D E\
   *?| - - - - -\
   *?| B D A\
   *?| - - -\
   *?| C A C D\
   *?| - - - -\
   *?| To:\
   *?| A | B | C | D | E\
   *?| B | D | A |   |\
   *?| C | A | C | D |\
   * The white-spaces are an empty string
   * @param uniqueKeywords The keywords to separate
   * @return [separatedByCharacters, maxLength]
   */
  private getSeparatedCharacters(
    uniqueKeywords: string[]
  ): [separatedByCharacters: string[][], maxLength: number] {
    let maxLength = 0;
    const out = uniqueKeywords
      // Split by characters and take max length for normalization
      .map((keyword) => {
        const splitted = keyword.split("");

        maxLength = Math.max(maxLength, splitted.length);

        return splitted;
      })
      // Reorder the keywords by character
      .reduce((prv, acc) => {
        // Normalize string to fixed length
        const padEnd = arrayN<string>(maxLength - acc.length).fill("");
        const finalString = [...acc, ...padEnd];

        // Add to the previous array
        return finalString.map((c, i) => {
          const cPrv = prv[i];

          return cPrv ? [...cPrv, c] : [c];
        });
      }, [] as string[][]);
    return [out, maxLength];
  }
}
