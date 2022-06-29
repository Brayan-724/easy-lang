import type { Newable } from "../shim";
import type { Token } from "../Token";
import { TokenFactory } from "./TokenFactory";

export abstract class FactoredTokenFactory<
  TK extends Token = Token
> extends TokenFactory<TK> {
  constructor(
    public override readonly tokenName: string,
    public override readonly tokenClass: Newable<TK>
  ) {
    super(tokenClass);
  }
}
