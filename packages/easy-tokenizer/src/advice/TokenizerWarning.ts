import { TokenMeta } from "../Token";
import { TokenizerAdvice } from "./TokenizerAdvice";

export class TokenizerWarning extends TokenizerAdvice {
  constructor(message: string, meta: TokenMeta) {
    super("TokenizerWarning", message, meta);
  }
}
