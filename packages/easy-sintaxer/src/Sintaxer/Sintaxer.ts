import { Token, TokenFactory } from "easy-tokenizer";


export class Sintaxer {
  private readonly _tokens: TokenFactory[] = [];

  constructor(private readonly outTokens: Token[]) { }

  registerToken<T extends TokenFactory>(token: T): this {
    this._tokens.push(token);
    return this;
  }

  
}
