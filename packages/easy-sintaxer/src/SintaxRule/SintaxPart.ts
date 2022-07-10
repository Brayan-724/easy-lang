import { PartExtra, PartType } from "./SintaxCase";

export class SintaxPart {
  constructor(
    readonly type: PartType,
    readonly name: string,
    readonly extra?: PartExtra
  ) {}
}
