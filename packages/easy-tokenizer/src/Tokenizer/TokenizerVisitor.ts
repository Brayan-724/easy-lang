import { TokenizerError } from "@advice";
import type { Token, TokenMeta } from "@Token";
import type { TokenizerContext } from "./TokenizerContext";

export type TokenizerVisitedComplete = Token | Token[] | TokenizerError;
export type TokenizerVisited = TokenizerVisitedComplete | false;

export interface TokenizerVisitable {
  /**
   * Return if visitor should visit this token.
   * @param visitor VisitorContext
   */
  visitTrigger?(visitor: TokenizerVisitor): boolean;

  /**
   * Visit this token.
   * @param visitor VisitorContext
   */
  visit(visitor: TokenizerVisitor): TokenizerVisited;
}

export class TokenizerVisitor {
  context!: TokenizerContext;
  private _actualChar: string = "";

  private readonly _movements: number[] = [];

  forceReset(): void {
    this._movements.length = 0;
  }

  get movements(): number[] {
    return this._movements;
  }

  undoMovement(): void {
    const movement = this._movements.pop();

    if (movement) {
      this.advance(-movement);
    }
  }

  resetMovements() {
    this._movements.forEach((m) => this.advance(-m));
    this._movements.length = 0;
  }

  /**
   * Skip characters and update actualChar
   * @param count Number of characters to be skipped
   * @returns Actual char or TokenizerError
   */
  advance(count: number = 1): string | TokenizerError {
    const l = this.context.advance(count);
    this.updateActualChar(l);
    return l;
  }

  /**
   * First try to verify if is the end of code, if not, then try skip characters.
   * If can't skip characters, then return false.
   * @param count Number of characters to be skipped
   * @returns actualChar or if has error
   */
  tryAdvance(count: number = 1): string | false {
    if (this.isEndOfCode()) {
      return false;
    }

    const l = this.context.tryMovement(
      this.context.advance.bind(this.context),
      count
    );

    if (l === false) {
      return false;
    }

    this.updateActualChar();

    this._movements.push(count);

    return this.actualChar;
  }

  /**
   * First try to verify if is the end of code, if not,
   * then try to get the character with `count` position.
   * @param count Number of characters to be skipped
   * @returns actualChar or if has error
   */
  tryPeek(count: number = 1): string | false {
    if (this.isEndOfCode()) {
      return false;
    }

    const l = this.context.tryMovement(
      this.context.peek.bind(this.context),
      count
    );

    return l;
  }

  /**
   * Verify if is the end of code
   * @returns true if is the end of code
   */
  isEndOfCode(): boolean {
    return this.context.isEndOfCode();
  }

  /**
   * Create an error with meta
   * @param message Error message
   * @param meta Optional meta data, by default is the context meta
   * @returns TokenizerError
   */
  makeError(message: string, meta?: TokenMeta): TokenizerError {
    return new TokenizerError(message, meta || this.context.meta);
  }

  /**
   * If actualChar is not empty or has errors, then update actualChar.
   * If `a` is not provided then try to get it from context with `peek`
   * @param a Actual char to be updated
   */
  updateActualChar(a?: string | TokenizerError): void {
    const peek = a ?? this.context.peek();

    if (peek instanceof TokenizerError) {
      this._actualChar = "";
      throw peek.getAsError(this.context);
    }

    this._actualChar = peek;
  }

  /**
   * Get visit trigger and if it is true, then visit the token.
   * @param token Token to be visited
   * @returns Token instance, TokenizerError or false
   */
  visit(token: TokenizerVisitable): TokenizerVisited {
    if (token.visitTrigger) {
      if (!token.visitTrigger(this)) {
        return false;
      }
    }

    return token.visit(this);
  }

  get actualChar(): string {
    return this._actualChar;
  }
}
