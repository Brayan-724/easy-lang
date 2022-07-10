import { SintaxPart } from "./SintaxPart";

export type PartType = "rule" | "token" | "static";

export type PartExtra = {
  customMeta?: object;
  value?: string;
};

export class SintaxCase {
  constructor(readonly name: string, readonly parts: SintaxPart[]) {}
}
