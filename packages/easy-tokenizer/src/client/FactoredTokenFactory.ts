import type { Newable } from "../shim";
import type { Token } from "../Token";
import { TokenFactory } from "./TokenFactory";

export abstract class FactoredTokenFactory<
  TK extends Token = Token
> extends TokenFactory<TK> {
  constructor(
    tokenName: string,
    public override readonly tokenClass: Newable<TK>
  ) {
    super(tokenClass);
  }
}
