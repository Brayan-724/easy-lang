import { TokenEnum, Tokenizer, TokenTypeEnum } from "@";
import { TokenBuilder, TokenBuilderGroup } from "@user-helpers";
import { expect } from "chai";

describe("User Helpers", () => {
  //* ------------------------------------------------------------------------
  it("TokenBuilder", () => {
    const tokenBuilder = new TokenBuilder();

    // tokenBuilder.trigger;
  });

  //* ------------------------------------------------------------------------
  describe("TokenBuilderGroup", () => {
    beforeEach(() => {
      // @ts-ignore
      TokenBuilderGroup._lastId = 0;
    });
    //* ------------------------------------------------------------------------
    it("Access to it", () => {
      TokenBuilderGroup;
    });

    //* ------------------------------------------------------------------------
    it("Instanceable (new)", () => {
      const tokenBuilderGroup = new TokenBuilderGroup(
        TokenEnum.NONE,
        TokenTypeEnum.EOF
      );
    });

    //* ------------------------------------------------------------------------
    it(".add", () => {
      const tokenBuilderGroup = new TokenBuilderGroup(
        TokenEnum.NONE,
        TokenTypeEnum.EOF
      );

      let keywords = ["a", "b", "c", "d", "e"];

      for (let [i, keyword] of keywords.entries()) {
        tokenBuilderGroup.add(keyword);

        expect(tokenBuilderGroup.keywords).to.be.lengthOf(i + 1);
        expect(tokenBuilderGroup.keywords[i]).to.equal(keyword);
      }

      expect(tokenBuilderGroup.keywords).to.be.lengthOf(5);
      expect(tokenBuilderGroup.keywords).to.be.deep.equal(keywords);
    });

    it("Build", () => {
      const tokenBuilderGroup = new TokenBuilderGroup(
        TokenEnum.OTHER,
        TokenTypeEnum.KEYWORD
      );

      tokenBuilderGroup.add("function");
      tokenBuilderGroup.add("log");

      expect(tokenBuilderGroup.keywords).to.have.lengthOf(2);

      const builded = tokenBuilderGroup.build();

      expect(builded).to.be.instanceOf(Array);
      expect(builded).to.have.lengthOf(2);

      const [BuildedToken, BuildedTokenFactory] = builded;

      expect(BuildedToken).to.be.instanceOf(Function);
      expect(BuildedTokenFactory).to.be.instanceOf(Function);

      const token = new BuildedToken();

      expect(token).to.be.have.property("tokenName").to.equal("Keywords0Token");
      expect(token).to.be.have.property("token").to.equal(TokenEnum.OTHER);
      expect(token)
        .to.be.have.property("tokenType")
        .to.equal(TokenTypeEnum.KEYWORD);
    });

    //* ------------------------------------------------------------------------
    it("Use it", () => {
      const tokenBuilderGroup = new TokenBuilderGroup(
        TokenEnum.OTHER,
        TokenTypeEnum.KEYWORD
      );

      tokenBuilderGroup.add("function");
      tokenBuilderGroup.add("log");

      const [BuildedToken, BuildedTokenFactory] = tokenBuilderGroup.build();

      const tokenizer = new Tokenizer("log function");

      tokenizer.addTokenFactory(new BuildedTokenFactory());

      const out = tokenizer.tokenize();

      // console.log(out);
    });
  });
});
