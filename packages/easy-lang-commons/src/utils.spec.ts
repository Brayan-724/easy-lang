import { expect } from "chai";
import { arrayN, createClass } from "./utils";

describe("/Utils", () => {
  describe("arrayN", () => {
    it("should return an array of n elements", () => {
      const count = 10;
      for (let i = 0; i < count; i++) {
        const arr = arrayN(i);
        expect(arr).to.have.lengthOf(i);
      }
    });

    it("should return an array of n elements with undefined", () => {
      const count = 10;
      const generate = (n: number) =>
        " "
          .repeat(n)
          .split("")
          .map(() => undefined);
      for (let i = 0; i < count; i++) {
        const arr = arrayN(i);
        expect(arr).to.have.lengthOf(i);
        expect(arr).to.be.deep.equal(generate(i));
      }
    });
  });

  describe("createClass", () => {
    class TestClass {
      public static staticTest = "staticTest";
      public static staticMethod() {}

      instanceTest = "instanceTest";
      instanceMethod() {}
    }

    it("should return a class", () => {
      const cls = createClass("TestClass", TestClass);
      expect(cls).to.be.instanceOf(Function);
    });

    it("should return a class with static properties", () => {
      const cls = createClass("TestClass", TestClass);
      expect(cls.staticTest).to.be.equal("staticTest");
      expect(cls.staticMethod).to.be.instanceOf(Function);
    });

    it("should return a class with instance properties", () => {
      const cls = createClass("TestClass", TestClass);
      const instance = new cls();
      expect(instance.instanceTest).to.be.equal("instanceTest");
      expect(instance.instanceMethod).to.be.instanceOf(Function);
    });

    it("Symbol.toStringTag should be set to the class name", () => {
      const cls = createClass("TestClass", TestClass);
      const instance = new cls();
      expect(instance[Symbol.toStringTag]).to.be.equal("TestClass");
    });
  });
});
