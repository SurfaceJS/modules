export type ArithmeticOperator        = "+" | "-" | "*" | "/" | "%" | "**";
export type AssignmentOperator        = "=" | "*=" | "**=" | "/=" | "%=" | "+=" | "-=" | "<<=" | ">>=" | ">>>=" | "&=" | "^=" | "|=" | LogicalAssignmentOperator;
export type BinaryBitwiseOperator     = "&" | "|" | "^";
export type BitwiseShiftOperator      = "<<" | ">>" | ">>>";
export type EqualityOperator          = "==" | "===" | "!=" | "!==";
export type LiteralValue              = boolean | null | number | RegExp | string;
export type LogicalOperator           = "&&" | "||" | "??";
export type LogicalAssignmentOperator = "&&=" | "||=" | "??=";
export type RelationalOperator        = "<=" | ">=" | "<" | ">" | "in" | "instanceof";
export type UnaryOperator             = "+" | "-" | "~" | "!" | "typeof";
export type UpdateOperator            = "++" | "--";

export type BinaryOperator = ArithmeticOperator | BinaryBitwiseOperator | BitwiseShiftOperator | EqualityOperator | RelationalOperator;