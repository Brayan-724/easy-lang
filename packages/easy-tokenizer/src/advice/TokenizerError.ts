import { TokenMeta } from "../Token";
import { TokenizerAdvice } from "./TokenizerAdvice";

export class TokenizerError extends TokenizerAdvice {
  constructor(message: string, meta: TokenMeta) {
    super("TokenizerError", message, meta);
  }
}
