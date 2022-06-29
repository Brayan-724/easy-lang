import { TokenMeta } from "../Token";
import { type TokenizerContext } from "../Tokenizer";

export class TokenizerAdvice {
  readonly _errorBase: Error = new Error(this.message);

  constructor(
    readonly name: string,
    readonly message: string,
    readonly meta: TokenMeta
  ) {
    this._errorBase.name = name;
  }

  getAsError(context: TokenizerContext): Error {
    const error = new Error();
    error.stack =
      `(anonymous:${this.meta.toString()})\n` +
      (this._errorBase.stack || error.stack || "");
    error.name = this.name;

    const errorsCount = context.getErrorsCount();

    const codeInLine = context.getLine(this.meta.line);
    const hasPrevLine = this.meta.line > 0;
    const hasNextLine = this.meta.line < context.getCodeByLines().length - 1;
    const prevCodeInLine = hasPrevLine
      ? context.getLine(this.meta.line - 1)
      : "";
    const nextCodeInLine = hasNextLine
      ? context.getLine(this.meta.line + 1)
      : "";

    if (errorsCount !== context.getErrorsCount()) {
      context.errorManager.throwLastError();
    }

    const line = (this.meta.line + 1).toString();
    const prevLine = hasPrevLine ? this.meta.line.toString() : "";
    const nextLine = hasNextLine ? (this.meta.line + 2).toString() : "";
    const space = (n: number, ch: string = " ") => ch.repeat(n);
    error.message =
      this.message +
      " at code:" +
      this.meta.toString() +
      "\n" +
      (hasPrevLine ? `${prevLine} | ${prevCodeInLine}` : "") +
      `${line} | ${
        codeInLine.endsWith("\n") ? codeInLine : codeInLine + "\n"
      }` +
      `${space(line.length)} |_${space(this.meta.column, "_")}^\n` +
      (hasNextLine ? `${nextLine} | ${nextCodeInLine}` : "");

    return error;
  }

  
}
