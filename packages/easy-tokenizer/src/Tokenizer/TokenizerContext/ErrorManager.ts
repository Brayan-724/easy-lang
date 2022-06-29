import {
  TokenizerAdvice,
  TokenizerError,
  type TokenizerWarning
} from "@advice";
import type { TokenizerContext } from "./TokenizerContext";

export class ErrorManager {
  errors: TokenizerError[] = [];
  warnings: TokenizerWarning[] = [];

  constructor(private readonly context: TokenizerContext) {}

  getLastError(): TokenizerError {
    if (this.errors.length === 0) {
      return new TokenizerError(`No error`, this.context.meta);
    }

    return this.errors[this.errors.length - 1] as TokenizerError;
  }

  addError(error: TokenizerError): TokenizerError {
    this.errors.push(error);
    return error;
  }

  addWarning(warning: TokenizerWarning): TokenizerWarning {
    this.warnings.push(warning);
    return warning;
  }

  popLastError(): TokenizerError {
    if (this.errors.length === 0) {
      return new TokenizerError(`No error`, this.context.meta);
    }

    return this.errors.pop() as TokenizerError;
  }

  throwError(error: TokenizerAdvice): never {
    throw error.getAsError(this.context);
  }

  throwLastError(): never {
    this.throwError(this.popLastError());
  }

  getErrors(): TokenizerError[] {
    return [...this.errors];
  }

  getErrorsCount(): number {
    return this.errors.length;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  clearErrors(): TokenizerError[] {
    return this.errors.splice(0, this.errors.length);
  }
}
