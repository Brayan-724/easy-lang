import { TokenizerError, TokenizerWarning } from "@advice";
import { TokenMeta } from "@Token";
import { ErrorManager } from "./ErrorManager";

export class TokenizerContext {
  protected codeSplitted: string[];
  protected codeSplittedByLine: string[];
  protected codeSplittedInLine: string[];
  private _columnIndex: number = 0;
  private _lineIndex: number = 0;
  private _lineLength: number = 0;

  readonly errorManager = new ErrorManager(this);

  protected addError: typeof ErrorManager.prototype.addError = (error) => {
    return this.errorManager.addError(error);
  };

  protected addWarning: typeof ErrorManager.prototype.addWarning = (error) => {
    return this.errorManager.addWarning(error);
  };

  hasErrors: typeof ErrorManager.prototype.hasErrors = () => {
    return this.errorManager.hasErrors();
  };

  clearErrors: typeof ErrorManager.prototype.clearErrors = () => {
    return this.errorManager.clearErrors();
  };

  getErrors: typeof ErrorManager.prototype.getErrors = () => {
    return this.errorManager.getErrors();
  };

  getErrorsCount: typeof ErrorManager.prototype.getErrorsCount = () => {
    return this.errorManager.getErrorsCount();
  };

  sharedMeta: Map<string, Map<string, unknown>> = new Map();

  useSharedMeta(key: string): Map<string, unknown> {
    if (!this.sharedMeta.has(key)) {
      this.sharedMeta.set(key, new Map());
    }

    return this.sharedMeta.get(key) as Map<string, unknown>;
  }

  constructor(readonly code: string) {
    code += " ";
    this.codeSplitted = [...code];
    this.codeSplittedByLine = code
      .split("\n")
      .map((line, index, splitted) =>
        splitted.length - 1 === index ? line : line + "\n"
      );

    this.codeSplittedInLine = [...this.getLine(0)];
    this._lineLength = this.codeSplittedInLine.length;
  }

  get columnIndex(): number {
    return this._columnIndex;
  }

  set columnIndex(value: number) {
    if (value < 0) {
      this.addError(
        new TokenizerError(
          `Cannot set column index to negative value`,
          this.meta
        )
      );
    } else if (value > this._lineLength) {
      if (this.lineIndex + 1 >= this.codeSplittedByLine.length) {
        this.addError(new TokenizerError(`Unexpected end of code`, this.meta));
      } else {
        const lineLength = this.lineLength;
        this.lineIndex++;
        this.columnIndex = value - lineLength;
      }
    } else {
      this._columnIndex = value;
    }
  }

  get lineIndex(): number {
    return this._lineIndex;
  }

  set lineIndex(value: number) {
    if (value >= this.codeSplittedByLine.length) {
      this.addError(new TokenizerError(`Unexpected end of code`, this.meta));
    } else {
      const line = this.getLine(value);
      this._lineIndex = value;
      this._columnIndex = 0;
      this._lineLength = line.length;
      this.codeSplittedInLine = [...line];
    }
  }

  get lineLength(): number {
    return this._lineLength;
  }

  get meta(): TokenMeta {
    return new TokenMeta(this.lineIndex, this.columnIndex);
  }

  /**
   * Get line content.
   * If line index is out of range, returns an empty string and push error.
   * @param l line index
   */
  getLine(l: number): string {
    const line = this.codeSplittedByLine[l];

    if (line === undefined) {
      this.addError(new TokenizerError(`Line ${l} does not exist`, this.meta));
      return "";
    }

    return line;
  }

  /**
   * Get column character.
   * If column index is out of range, returns an empty string and push error.
   * @param c column index
   */
  getColumn(c: number): string {
    const column = this.codeSplittedInLine[c];

    if (column === undefined) {
      this.addError(
        new TokenizerError(`Column ${c} does not exist`, this.meta)
      );
      return "";
    }

    return column;
  }

  getCodeByLines(): string[] {
    return this.codeSplittedByLine;
  }

  getCodeByColumns(line: number): string[] {
    return this.getLine(line).split("");
  }

  /**
   * Try to advance the column index.
   * @param count number of characters to advance
   * @returns actualChar or TokenizerError
   */
  advance(count: number = 1): string | TokenizerError {
    if (this.columnIndex + count >= this.codeSplitted.length) {
      return this.addError(
        new TokenizerError(`Unexpected end of code`, this.meta)
      );
    }

    if (count < 1) {
      if (count === 0) {
        return this.addError(
          new TokenizerError(`Cannot advance 0 characters`, this.meta)
        );
      }
      this.addWarning(
        new TokenizerWarning(
          `Cannot advance negative characters, use \`return\` instead of`,
          this.meta
        )
      );
    }

    this.columnIndex += count;

    return this.codeSplittedInLine[this.columnIndex] as string;
  }

  return(count: number = 1): string | TokenizerError {
    if (this.columnIndex - count < 0) {
      return this.addError(
        new TokenizerError(`Unexpected end of code`, this.meta)
      );
    }

    if (count < 1) {
      if (count === 0) {
        return this.addError(
          new TokenizerError(`Cannot return 0 characters`, this.meta)
        );
      }

      this.addWarning(
        new TokenizerWarning(
          `Cannot return negative characters, use \`advance\` instead of`,
          this.meta
        )
      );
    }

    this.columnIndex -= count;

    return this.codeSplitted[this.columnIndex] as string;
  }

  /**
   * Try to get the character at the relative position from the current column without move the cursor.
   * @param relativeIndex The index relative to the current position
   * @returns Peeked character or TokenizerError
   */
  peek(relativeIndex: number = 0): string | TokenizerError {
    // Verify if the current column plus `relativeIndex` is the end of line
    if (this.columnIndex + relativeIndex >= this.codeSplittedInLine.length) {
      // If it is, check if the next line exists
      if (this.lineIndex + 1 >= this.codeSplittedByLine.length) {
        return this.addError(
          new TokenizerError(`Unexpected end of code`, this.meta)
        );
      }

      const lineLength = this.codeSplittedInLine.length;
      const columnIndex = this.columnIndex;
      const diff = lineLength - this.columnIndex;
      this.lineIndex++;
      const value = this.peek(relativeIndex - diff);
      this.lineIndex--;
      this.columnIndex = columnIndex;
      return value;
    }

    // Same as above, but for negative indexes
    if (this.columnIndex + relativeIndex < 0) {
      if (this.lineIndex - 1 >= this.codeSplittedByLine.length) {
        return this.addError(
          new TokenizerError(`Unexpected index out of code`, this.meta)
        );
      }

      const lineLength = this.codeSplittedInLine.length;
      const columnIndex = this.columnIndex;
      this.lineIndex--;
      const value = this.peek(lineLength + relativeIndex);
      this.lineIndex++;
      this.columnIndex = columnIndex;
      return value;
    }

    if (relativeIndex === 0) {
      return this.codeSplittedInLine[this.columnIndex] as string;
    }

    return this.codeSplittedInLine[this.columnIndex + relativeIndex] as string;
  }

  tryMovement<F extends (...args: any[]) => any>(
    movement: F,
    ...args: Parameters<F>
  ): _FalseOrError<ReturnType<F>> {
    const result = movement(...args);

    if (result instanceof TokenizerError) {
      this.errorManager.popLastError();
      return false as _FalseOrError<ReturnType<F>>;
    }

    return result as _FalseOrError<ReturnType<F>>;
  }

  /**
   * Verify if is the end of code
   * @returns true if is the end of code
   */
  isEndOfCode(): boolean {
    return (
      this.lineIndex >= this.codeSplittedByLine.length - 1 &&
      this.columnIndex >= this.codeSplittedInLine.length - 1
    );
  }
}

type _FalseOrError<T> = T extends TokenizerError ? false : T;
