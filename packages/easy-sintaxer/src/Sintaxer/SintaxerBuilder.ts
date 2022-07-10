import { TokenFactory, Tokenizer, TokenizerError } from "easy-tokenizer";
import { Sintaxer } from "./Sintaxer";

export class SintaxerBuilder {
  private _tokenizer: Tokenizer | null = null;
  private _tokenFactories: TokenFactory[] = [];

  constructor() {}

  getTokenizer(): Tokenizer {
    if (!this._tokenizer) {
      throw new Error("Code not set. Use setCode()");
    }

    return this._tokenizer;
  }

  setCode(code: string): this {
    this._tokenizer = new Tokenizer(code);
    return this;
  }

  addTokenFactory(tokenFactory: TokenFactory): this {
    this._tokenFactories.push(tokenFactory);
    return this;
  }

  private _registerTokens(): void {
    const tokenizer = this.getTokenizer();

    this._tokenFactories.forEach((tokenFactory) => {
      tokenizer.addTokenFactory(tokenFactory);
    });
  }

  tokenize<E extends boolean>(throwErr: E) {
    this._registerTokens();
    return this.getTokenizer().tokenize<E>(throwErr);
  }

  tokenizeCode<E extends boolean>(code: string, throwErr: E) {
    this.setCode(code);
    return this.tokenize<E>(throwErr);
  }

  build<E extends boolean>(
    throwErr: E
  ): Sintaxer | (E extends true ? never : TokenizerError);
  build<E extends boolean>(
    code: string,
    throwErr: E
  ): Sintaxer | (E extends true ? never : TokenizerError);
  build<E extends boolean>(
    code?: string | E,
    throwErr?: E
  ): Sintaxer | (E extends true ? never : TokenizerError) {
    const _code = typeof code === "string" ? code : false;
    const _throwErr =
      typeof code === "boolean"
        ? code
        : typeof throwErr === "boolean"
        ? throwErr
        : true;

    if (_code) {
      this.setCode(_code);
    }

    const tokens = this.tokenize(_throwErr);

    if (tokens instanceof TokenizerError) {
      return tokens;
    }

    const sintaxer = new Sintaxer(tokens);

    this._tokenFactories.forEach((tokenFactory) => {
      sintaxer.registerToken(tokenFactory);
    });

    return sintaxer;
  }
}
