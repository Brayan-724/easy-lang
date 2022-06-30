import {
  TokenEnum,
  TokenTypeEnum,
  Tokenizer,
  createKeywordsTokens,
} from "easy-tokenizer";
import {
  BraceTokenFactory,
  BracketTokenFactory,
  NumberTokenFactory,
  ParenTokenFactory,
  PlusTokenFactory,
  StarTokenFactory,
  IdentTokenFactory,
  StringTokenFactory,
} from "easy-tokenizer/basic";

const keywords = ["fn", "if", "else", "return", "log", "debug"];
const [KeywordToken, KeywordTokenFactory] = createKeywordsTokens(
  keywords,
  TokenEnum.OTHER,
  TokenTypeEnum.KEYWORD,
  undefined,
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

const code = String.raw`
fn main() {
  log "\"Hola\" :D"
}`;

const tokenizer = initializeWithAll(code);

const tokens = tokenizer.tokenize(false);
if (Array.isArray(tokens)) {
  console.log("Code: ");
  console.log(code);
  console.log("Tokens: ");
  console.log(tokens);
} else {
  const err = tokens.getAsError(tokenizer.tokenizerContext);
  console.log("\x1b[0;1;30m" + err.name);
  console.log("\x1b[0;31m" + err.message);
  console.log("\x1b[0;2;30m" + err.stack);
  console.log("\x1b[0m");
}
