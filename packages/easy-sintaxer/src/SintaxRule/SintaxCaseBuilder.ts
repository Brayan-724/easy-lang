import { PartExtra, PartType, SintaxCase } from "./SintaxCase";
import { SintaxPart } from "./SintaxPart";

export class SintaxCaseBuilder {
  name: string | null = null;
  readonly parts: SintaxPart[] = [];

  constructor() {}

  setName(name: string) {
    this.name = name;
    return this;
  }

  addPart(type: PartType, name: string, extra?: PartExtra) {
    this.parts.push(new SintaxPart(type, name, extra));
    return this;
  }

  build() {
    if (!this.name) {
      throw new Error("SintaxCaseBuilder: name is required");
    }

    if (this.name.trim() === "") {
      throw new Error("SintaxCase name cannot be empty");
    }

    if (this.parts.length === 0) {
      throw new Error("SintaxCaseBuilder: at least one part is required");
    }

    return new SintaxCase(this.name.trim(), this.parts);
  }
}
