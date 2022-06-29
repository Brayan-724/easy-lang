import type { TokenizerVisitor } from "@/Tokenizer";

export type TokenizerTriggerFunc<A extends Array<any>, R> = (
  visitor: TokenizerVisitor,
  ...args: A
) => boolean | R;

export class TokenizerTrigger<A extends Array<any>, R> {
  constructor(readonly trigger: TokenizerTriggerFunc<A, R>) {}

  execute(visitor: TokenizerVisitor, ...args: A): boolean | R {
    return this.trigger(visitor, ...args);
  }
}

export class TokenizerTriggerBuilder<
  A extends Array<any>,
  R extends Array<any>,
  FA extends Array<any> = A,
  PT extends TokenizerTriggerBuilder<any, any, FA, any>[] = []
> {
  private _prevTriggers: PT;
  private _nextTrigger: TokenizerTriggerBuilder<R, any[], FA, any[]> | null =
    null;
  private _trigger!: TokenizerTriggerFunc<A, R>;
  private _hasTrigger: boolean = false;

  constructor(prevTriggers: PT);
  constructor(trigger: TokenizerTriggerFunc<A, R>, prevTriggers: PT);

  constructor(trigger: TokenizerTriggerFunc<A, R> | PT, prevTriggers?: PT) {
    if (Array.isArray(trigger)) {
      this._prevTriggers = trigger;
    } else {
      this.setTrigger(trigger);
      this._prevTriggers = prevTriggers as PT;
    }
  }

  get trigger(): TokenizerTriggerFunc<A, R> {
    return this._trigger;
  }

  setTrigger(trigger: TokenizerTriggerFunc<A, R>): this {
    this._hasTrigger = true;
    this._trigger = trigger;

    return this;
  }

  addTrigger<NR extends any[]>(
    trigger: TokenizerTriggerFunc<R, NR>
  ): TokenizerTriggerBuilder<
    R,
    NR,
    FA,
    [...PT, TokenizerTriggerBuilder<A, R, FA, PT>]
  > {
    if (!this._hasTrigger) {
      throw new Error("No trigger set");
    }

    if (this._nextTrigger) {
      throw new Error("Next trigger already set");
    }

    const nextTrigger = new TokenizerTriggerBuilder<
      R,
      NR,
      FA,
      [...PT, TokenizerTriggerBuilder<A, R, FA, PT>]
    >(trigger, [...this._prevTriggers, this]);

    this._nextTrigger = nextTrigger;
    return nextTrigger;
  }

  buildTrigger(): TokenizerTriggerFunc<FA, R> {
    const trigger = this._trigger;
    const prevTriggers = this._prevTriggers;

    if (prevTriggers) {
      const triggers = prevTriggers.map((trigger) => trigger.trigger);

      return (visitor: TokenizerVisitor, ...args: FA) => {
        let lastOutput: any[] = args;

        for (const trigger of triggers) {
          const result = trigger(visitor, lastOutput);

          if (typeof result === "boolean") {
            return result;
          }

          lastOutput = result;
        }

        return trigger(visitor, ...(lastOutput as A));
      };
    }

    return trigger as unknown as TokenizerTriggerFunc<FA, R>;
  }

  build(): TokenizerTrigger<FA, boolean> {
    return new TokenizerTrigger<FA, boolean>((visitor, ...args) => {
      const trigger = this.buildTrigger();
      const triggerOut = trigger(visitor, ...args);

      if (triggerOut === true) {
        return true;
      }

      return false;
    });
  }
}
