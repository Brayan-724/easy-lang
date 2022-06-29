import { TokenEnum, Tokenizer, TokenTypeEnum } from "@";
import { IdentTokenFactory } from "@/basic/identToken";
import {
  BraceTokenFactory,
  BracketTokenFactory,
  NumberTokenFactory,
  ParenTokenFactory,
  PlusTokenFactory,
  StarTokenFactory,
} from "@basic";
import { StringTokenFactory } from "@basic/stringToken";
import { createKeywordsTokens } from "@client/createKeywordTokens";

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

/**
Code: 
fn () {
  log "\"Hola\" :D"
}

Tokens: 
[
  BuildedToken [Keywords0Token] {
    value: 'fn',
    meta: TokenMeta { line: 1, column: 2 },
    _customMeta: undefined,
    tokenName: 'Keywords0Token',
    token: 1,
    tokenType: 6
  },
  ParenToken {
    value: '(',
    meta: TokenMeta { line: 1, column: 3 },
    _customMeta: ParenTokenMeta { state: 0 },
    tokenType: 7,
    tokenName: 'Paren',
    token: 2
  },
  ParenToken {
    value: ')',
    meta: TokenMeta { line: 1, column: 4 },
    _customMeta: ParenTokenMeta { state: 1 },
    tokenType: 7,
    tokenName: 'Paren',
    token: 2
  },
  BraceToken {
    value: '{',
    meta: TokenMeta { line: 1, column: 6 },
    _customMeta: ParenTokenMeta { state: 0 },
    tokenType: 7,
    tokenName: 'Brace',
    token: 4
  },
  BuildedToken [Keywords0Token] {
    value: 'log',
    meta: TokenMeta { line: 2, column: 5 },
    _customMeta: undefined,
    tokenName: 'Keywords0Token',
    token: 1,
    tokenType: 6
  },
  StringToken {
    value: '"Hola" :D',
    meta: TokenMeta { line: 2, column: 6 },
    _customMeta: undefined,
    tokenName: 'String',
    token: 13,
    tokenType: 4
  },
  BraceToken {
    value: '}',
    meta: TokenMeta { line: 2, column: 20 },
    _customMeta: ParenTokenMeta { state: 1 },
    tokenType: 7,
    tokenName: 'Brace',
    token: 4
  }
]

 */
