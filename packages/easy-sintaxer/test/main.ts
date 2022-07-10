import { NumberTokenFactory, PlusTokenFactory } from "easy-tokenizer/basic";
import { SintaxerBuilder } from "@";

describe("Main test", () => {
  describe("Test 1", () => {
    const sintaxerBuilder = new SintaxerBuilder();

    sintaxerBuilder.addTokenFactory(new PlusTokenFactory());
    sintaxerBuilder.addTokenFactory(new NumberTokenFactory());

    const sintaxer = sintaxerBuilder.build(`1 + 2`, true);

    console.log(sintaxer);
  });
});
