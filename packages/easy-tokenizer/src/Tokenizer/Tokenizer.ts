import { TokenizerError } from "@advice";
import type { TokenFactory } from "@client/TokenFactory";
import type { Token } from "@Token";
import { TokenizerContext } from "./TokenizerContext";
import {
  TokenizerVisited,
  TokenizerVisitor,
  type TokenizerVisitedComplete,
} from "./TokenizerVisitor";

export class Tokenizer {
  readonly tokenFactories: TokenFactory<any>[] = [];
  readonly tokenizerVisitor = new TokenizerVisitor();
  readonly tokenizerContext: TokenizerContext;

  constructor(readonly code: string) {
    this.tokenizerContext = new TokenizerContext(code);
    this.tokenizerVisitor.context = this.tokenizerContext;
  }

  addTokenFactory(tokenFactory: TokenFactory) {
    this.tokenFactories.push(tokenFactory);
  }

  protected _visit_factories(): TokenizerVisited {
    this.tokenizerVisitor.updateActualChar();

    this.tokenizerVisitor.forceReset();
    for (const tokenFactory of this.tokenFactories) {
      const token = this.tokenizerVisitor.visit(tokenFactory);

      if (token === false) {
        this.tokenizerVisitor.resetMovements();
        continue;
      }

      return token;
    }

    return false;
  }

  scan(): Token[] | TokenizerError[] {
    const tokens = this._visit_factories();

    if (this.tokenizerContext.hasErrors()) {
      return this.tokenizerContext.clearErrors();
    }

    if (tokens === false) {
      const permittedTokens = [" ", "\n", "\t", "\r"];

      if (permittedTokens.includes(this.tokenizerVisitor.actualChar)) {
        return [];
      } else {
        return [
          new TokenizerError("Unexpected token", this.tokenizerContext.meta),
        ];
      }
    }

    return (Array.isArray(tokens) ? tokens : [tokens]) as Token[];
  }

  tokenize<TE extends boolean>(
    throwErr: TE
  ): Token[] | (TE extends true ? never : TokenizerError) {
    const outTokens: Token[] = [];

    while (!this.tokenizerVisitor.isEndOfCode()) {
      const tokens = this.scan();

      if (tokens instanceof TokenizerError) {
        if (throwErr) {
          throw tokens.getAsError(this.tokenizerContext);
        }

        return tokens as Token[] | (TE extends true ? never : TokenizerError);
      }

      for (const token of tokens) {
        if (token instanceof TokenizerError) {
          if (throwErr) {
            throw token.getAsError(this.tokenizerContext);
          }

          return token as Token[] | (TE extends true ? never : TokenizerError);
        }

        outTokens.push(token);
      }

      this.tokenizerVisitor.tryAdvance();
    }

    return outTokens;
  }
}
