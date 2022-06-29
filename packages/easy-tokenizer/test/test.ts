import { expect } from "chai";
import { TokenEnum, Tokenizer, TokenTypeEnum } from "@";
import { BraceTokenFactory, BracketTokenFactory, NumberTokenFactory, ParenTokenFactory, PlusTokenFactory, StarTokenFactory } from "@basic";
import { createKeywordsTokens } from "@/client/createKeywordTokens";
import { StringTokenFactory } from "@/basic/stringToken";
import { IdentTokenFactory } from "@/basic/identToken";

const keywords = ["fn", "if", "else", "return", "log", "debug"];
const [KeywordToken, KeywordTokenFactory] = createKeywordsTokens(
  keywords,
  TokenEnum.OTHER,
  TokenTypeEnum.KEYWORD,
  undefined
);

function addAllTokenizers(tokenizer: Tokenizer) {
  tokenizer.addTokenFactory(new NumberTokenFactory());
  tokenizer.addTokenFactory(new StringTokenFactory());
  
  tokenizer.addTokenFactory(new PlusTokenFactory());
  tokenizer.addTokenFactory(new StarTokenFactory());
  
  tokenizer.addTokenFactory(new KeywordTokenFactory());
  
  tokenizer.addTokenFactory(new ParenTokenFactory());
  tokenizer.addTokenFactory(new BracketTokenFactory());
  tokenizer.addTokenFactory(new BraceTokenFactory());

  tokenizer.addTokenFactory(new IdentTokenFactory());
}

function initializeWithAll(code: string): Tokenizer {
  const tokenizer = new Tokenizer(code);
  addAllTokenizers(tokenizer);
  return tokenizer;
}

describe("Main Test", () => {
  it("Operator", () => {
    const tokenizer = initializeWithAll("1 + 2 * 4 ** 2");

    const tokens = tokenizer.tokenize();
    // console.log(tokens);

    expect(tokens, "Tokens type").to.be.instanceOf(Array);
    expect(tokens, "Tokens length").to.have.lengthOf(7);
  });

  it("Keywords", () => {
    const tokenizer = initializeWithAll(keywords.join(" "));

    const tokens = tokenizer.tokenize();
    // console.log(tokens);

    expect(tokens, "Tokens type").to.be.instanceOf(Array);
    expect(tokens, "Tokens length").to.have.lengthOf(6);
  });

  it("Parens", () => {
    const tokenizer = initializeWithAll("()");

    const tokens = tokenizer.tokenize();
    // console.log(tokens);

    expect(tokens, "Tokens type").to.be.instanceOf(Array);
    expect(tokens, "Tokens length").to.have.lengthOf(2);
  });

  it("Final", () => {
    const tokenizer = initializeWithAll(String.raw`
fn main() {
  log "\"Hola\" :D"
}`);

    const tokens = tokenizer.tokenize();
    console.log(tokens);

    expect(tokens, "Tokens").to.be.instanceOf(Array);
    expect(tokens, "Tokens length").to.have.lengthOf(8);
  });
});
