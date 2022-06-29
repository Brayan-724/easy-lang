export enum TokenTypeEnum {
  EOF,
  IDENTIFIER,
  OPERATOR,
  NUMBER,
  STRING,
  COMMENT,
  KEYWORD,
  PUNCTUATION,
}

export enum TokenEnum {
  NONE,
  OTHER,

  // Operators
  PAREN,
  BRACKET,
  BRACE,
  ANGLED_BRACKET,
  DOT,
  PLUS,
  MINUS,
  STAR,
  STAR_STAR,
  SLASH,

  // Values
  NUMBER,
  STRING,
}

export enum ParenStateEnum {
  OPEN,
  CLOSE,
}
