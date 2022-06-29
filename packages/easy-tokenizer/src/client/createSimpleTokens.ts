import type { TokenEnum, TokenTypeEnum } from "@/enums";
import { Newable, NotNewable } from "@/shim";
import { createClass } from "@/_utils";
import { Token, TokenMeta, type CustomTokenMeta } from "@Token";
import { TokenizerVisited, TokenizerVisitor } from "@Tokenizer";
import { FactoredTokenFactory } from "./FactoredTokenFactory";
import { TokenizerTriggerBuilder } from "./TokenizerTriggerBuilder";

type TupleToUnion<T extends any[]> = T extends [...infer R, infer A]
  ? A | TupleToUnion<R>
  : T extends [infer A]
  ? A
  : T extends Array<infer A>
  ? A
  : never;

export interface SimpleTokensOptions<T extends SimpleTokenMap<any>> {
  visit(visitor: TokenizerVisitor, TokenClasses: T): TokenizerVisited;
  visitTrigger?(visitor: TokenizerVisitor): boolean;
}

export function createSimpleToken<
  T extends TokenEnum,
  TT extends TokenTypeEnum,
  CM extends CustomTokenMeta = CustomTokenMeta
>(
  value: string,
  tokenName: string,
  tokenEnum: T,
  tokenType: TT
): Newable<SimpleToken<T, TT, CM>> {
  return createClass(
    tokenName + "Token",
    class BuildedToken extends SimpleToken<T, TT, CM> {
      override readonly value: string = value;
      override readonly tokenName: string = tokenName;
      override readonly token: T = tokenEnum;
      override readonly tokenType: TT = tokenType;
    }
  );
}

export type SimpleTokenMap<T extends Token> = {
  [K: string]: Newable<T>;
};

type GetTokenInSimpleTokenMap<T extends SimpleTokenMap<any>> =
  T extends SimpleTokenMap<infer R> ? R : never;

export function createSimpleTokenFactory<
  M extends SimpleTokenMap<any>,
  T extends GetTokenInSimpleTokenMap<M> = GetTokenInSimpleTokenMap<M>
>(
  tokenName: string,
  TokenClasses: M,
  options: SimpleTokensOptions<M>
): Newable<FactoredTokenFactory<T>> {
  const tokenClassesKeys = Object.keys(TokenClasses) as (keyof M)[];

  const visitTrigger = (() => {
    if (options.visitTrigger) return options.visitTrigger;

    if (tokenClassesKeys.length === 1) {
      const key = tokenClassesKeys[0]!;
      const tokenClass = TokenClasses[key]!;
      return (visitor: TokenizerVisitor) => {
        return visitor.actualChar === key;
      };
    }

    return (visitor: TokenizerVisitor) => {
      return tokenClassesKeys.some((key) => {
        const tokenClass = TokenClasses[key]!;
        return visitor.actualChar === key;
      });
    };
  })();

  return createClass(
    tokenName + "TokenFactory",
    class BuildedTokenFactory extends FactoredTokenFactory<T> {
      override visit(visitor: TokenizerVisitor): TokenizerVisited {
        return options.visit(visitor, TokenClasses);
      }

      override visitTrigger(_visitor: TokenizerVisitor): boolean {
        return visitTrigger(_visitor);
      }
    }
  ) as Newable<FactoredTokenFactory<T>>;
}

export abstract class SimpleToken<
  T extends TokenEnum = TokenEnum,
  TT extends TokenTypeEnum = TokenTypeEnum,
  CM extends CustomTokenMeta = CustomTokenMeta
> extends Token<T, TT, CM> {
  abstract override readonly value: string;

  constructor(_value: string | undefined, meta: TokenMeta, customMeta: CM) {
    super("", meta, customMeta);
  }
}
