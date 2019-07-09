import { Constructor, Indexer, Nullable } from "@surface/core";
import IExpression                        from "../../interfaces/expression";
import ArrayExpression                    from "../../internal/expressions/array-expression";
import ArrowFunctionExpression            from "../../internal/expressions/arrow-function-expression";
import AssignmentExpression               from "../../internal/expressions/assignment-expression";
import BinaryExpression                   from "../../internal/expressions/binary-expression" ;
import CallExpression                     from "../../internal/expressions/call-expression";
import ConditionalExpression              from "../../internal/expressions/conditional-expression";
import Identifier                         from "../../internal/expressions/identifier";
import Literal                            from "../../internal/expressions/literal";
import LogicalExpression                  from "../../internal/expressions/logical-expression";
import MemberExpression                   from "../../internal/expressions/member-expression";
import NewExpression                      from "../../internal/expressions/new-expression";
import ObjectExpression                   from "../../internal/expressions/object-expression";
import SequenceExpression                 from "../../internal/expressions/sequence-expression";
import TemplateLiteral                    from "../../internal/expressions/template-literal";
import ThisExpression                     from "../../internal/expressions/this-expression";
import UnaryExpression                    from "../../internal/expressions/unary-expression";
import UpdateExpression                   from "../../internal/expressions/update-expression";
import Messages                           from "../../internal/messages";
import SyntaxError                        from "../../syntax-error";

export type ExpressionFixtureSpec =
{
    scope:    Indexer,
    raw:      string,
    toString: string,
    type:     Constructor<IExpression>,
    value:    Nullable<Object>,
};

export type InvalidExpressionFixtureSpec =
{
    context: Object,
    error:   Error,
    raw:     string,
};

const scope =
{
    this:
    {
        id:        1,
        value:     1,
        value1:    0,
        new:       "new",
        greater:   (left: number, right: number) => left > right,
        lesser:    (left: number, right: number) => left < right,
        increment: (value: number) => ++value,
        getObject: () => ({ value: "Hello World!!!" }),
        getValue:  () => 42
    },
    getScope()
    {
        return this;
    },
    MyClass: class MyClass
    {
        public id:     number;
        public active: boolean;

        public constructor(id?: number, active?: boolean)
        {
            this.id     = id || 0;
            this.active = !!active;
        }

        public getId(): number
        {
            return this.id;
        }
    },
    noop(value: unknown)
    {
        return value;
    }
};

// tslint:disable-next-line:no-any
export const validExpressions: Array<ExpressionFixtureSpec> =
[
    {
        scope:    scope,
        raw:      "[]",
        value:    [],
        toString: "[]",
        type:     ArrayExpression,
    },
    {
        scope:    scope,
        raw:      "[, 1, 2, , 3, ,]",
        value:    [undefined, 1, 2, undefined, 3, undefined,],
        toString: "[undefined, 1, 2, undefined, 3, undefined]",
        type:     ArrayExpression,
    },
    {
        scope:    scope,
        raw:      "[1, 'foo', true, { foo: 'bar' }]",
        value:    [1, "foo", true, { foo: "bar" }],
        toString: "[1, \"foo\", true, { foo: \"bar\" }]",
        type:     ArrayExpression,
    },
    {
        scope:    { one: 1, two: 2 },
        raw:      "[1, 'foo', true, ...[{ foo: one }, { bar: two }]]",
        value:    [1, "foo", true, { foo: 1 }, { bar: 2 }],
        toString: "[1, \"foo\", true, ...[{ foo: one }, { bar: two }]]",
        type:     ArrayExpression,
    },
    {
        scope:    { factory: () => [1, 2, 3] },
        raw:      "[0, ...factory()]",
        value:    [0, 1, 2, 3],
        toString: "[0, ...factory()]",
        type:     ArrayExpression,
    },
    {
        scope:    scope,
        raw:      "() => undefined",
        value:    () => undefined,
        toString: "() => undefined",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "a => a++",
        value:    (a: number) => a++,
        toString: "(a) => a++",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a) => a++",
        value:    (a: number) => a++,
        toString: "(a) => a++",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a = 1) => a++",
        value:    (a: number = 1) => a++,
        toString: "(a = 1) => a++",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, b) => a + b",
        value:    (a: number, b: number) => a + b,
        toString: "(a, b) => a + b",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "([a]) => a",
        value:    ([a]: Array<string>) => a,
        toString: "([a]) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "([a = 1]) => a",
        value:    ([a = 1]: Array<number>) => a,
        toString: "([a = 1]) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, [b, c]) => a + b + c",
        value:    (a: number, [b, c]: Array<number>) => a + b + c,
        toString: "(a, [b, c]) => a + b + c",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, [b, [c]]) => a + b + c",
        value:    (a: number, [b, [c]]: [number, Array<number>]) => a + b + c,
        toString: "(a, [b, [c]]) => a + b + c",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...a) => a",
        value:    (...a: Array<number>) => a,
        toString: "(...a) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...[a]) => a",
        value:    (...[a]: Array<number>) => a,
        toString: "(...[a]) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...[a, ...b]) => a + b[0]",
        value:    (...[a, ...b]: Array<number>) => a + b[0],
        toString: "(...[a, ...b]) => a + b[0]",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ a }) => a",
        value:    ({ a }: { a: string }) => a,
        toString: "({ a }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ a = 1 }) => a",
        value:    ({ a = 1 }: { a: number }) => a,
        toString: "({ a = 1 }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ a: b }) => b",
        value:    ({ a: b }: { a: number }) => b,
        toString: "({ a: b }) => b",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, { b, x: { c } }) => a + b + c",
        value:    (a: number, { b, x: { c } }: { b: number, x: { c: number } }) => a + b + c,
        toString: "(a, { b, x: { c } }) => a + b + c",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, { b, x: { ...c } }) => [a, b, c]",
        value:    (a: number, { b, x: { ...c } }: { b: number, x: { c: number } }) => [a, b, c],
        toString: "(a, { b, x: { ...c } }) => [a, b, c]",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...{ a }) => a",
        value:    (...{ a }: { a: number }) => a,
        toString: "(...{ a }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...{ a, x: { b } }) => a + b",
        value:    (...{ a, x: { b } }: { a: number, x: { b: number } }) => a + b,
        toString: "(...{ a, x: { b } }) => a + b",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "this.value = 0",
        value:    0,
        toString: "this.value = 0",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value = this.value1 += 2",
        value:    2,
        toString: "this.value = this.value1 += 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value *= 2",
        value:    4,
        toString: "this.value *= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value **= 2",
        value:    16,
        toString: "this.value **= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value /= 2",
        value:    8,
        toString: "this.value /= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value %= 2",
        value:    0,
        toString: "this.value %= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value += 2",
        value:    2,
        toString: "this.value += 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value -= 1",
        value:    1,
        toString: "this.value -= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value <<= 2",
        value:    4,
        toString: "this.value <<= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value >>= 1",
        value:    2,
        toString: "this.value >>= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value >>>= 1",
        value:    1,
        toString: "this.value >>>= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value &= 1",
        value:    1,
        toString: "this.value &= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value ^= 1",
        value:    0,
        toString: "this.value ^= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value |= 1",
        value:    1,
        toString: "this.value |= 1",
        type:     AssignmentExpression
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "x = y++",
        value:    2,
        toString: "x = y++",
        type:     AssignmentExpression
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "x = ++y",
        value:    3,
        toString: "x = ++y",
        type:     AssignmentExpression
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "x += (x++, x + y)",
        value:    6,
        toString: "x += (x++, x + y)",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "1 + 1",
        value:    2,
        toString: "1 + 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 - 1",
        value:    0,
        toString: "1 - 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "2 * 2",
        value:    4,
        toString: "2 * 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "4 / 2",
        value:    2,
        toString: "4 / 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "10 % 3",
        value:    1,
        toString: "10 % 3",
        type:     BinaryExpression,
    },
    {
        scope:    { this: { id: 1 } },
        raw:      "'id' in this",
        value:    true,
        toString: "\"id\" in this",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 == 1",
        value:    true,
        toString: "1 == 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 === 1",
        value:    true,
        toString: "1 === 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 != 1",
        value:    false,
        toString: "1 != 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 !== 1",
        value:    false,
        toString: "1 !== 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "({ }) instanceof { }.constructor",
        value:    true,
        toString: "({ }) instanceof { }.constructor",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 <= 0",
        value:    false,
        toString: "1 <= 0",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 >= 0",
        value:    true,
        toString: "1 >= 0",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 > 0",
        value:    true,
        toString: "1 > 0",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 < 0",
        value:    false,
        toString: "1 < 0",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 & 2",
        value:    0,
        toString: "1 & 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 | 2",
        value:    3,
        toString: "1 | 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 ^ 2",
        value:    3,
        toString: "1 ^ 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "2 ** 2",
        value:    4,
        toString: "2 ** 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "0b1000 << 2",
        value:    0b100000,
        toString: "8 << 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "0b1000 >> 2",
        value:    0b10,
        toString: "8 >> 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "0b1000 >>> 2",
        value:    0b10,
        toString: "8 >>> 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "1 + 1 * 2 / 2",
        value:    2,
        toString: "1 + 1 * 2 / 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "noop(true)",
        value:    true,
        toString: "noop(true)",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "getScope()",
        value:    null,
        toString: "getScope()",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "this.getValue()",
        value:    42,
        toString: "this.getValue()",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "this.increment(1)",
        value:    2,
        toString: "this.increment(1)",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "this.greater(1, 2)",
        value:    false,
        toString: "this.greater(1, 2)",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "this.greater(...[1, 2],)",
        value:    false,
        toString: "this.greater(...[1, 2])",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "/test/.test(\"test\")",
        value:    true,
        toString: "/test/.test(\"test\")",
        type:     CallExpression
    },
    {
        scope:    scope,
        raw:      "/test/i.test(\"TEST\")",
        value:    true,
        toString: "/test/i.test(\"TEST\")",
        type:     CallExpression
    },
    {
        scope:    scope,
        raw:      "(true ? this.greater : this.lesser)(1, 2)",
        value:    false,
        toString: "(true ? this.greater : this.lesser)(1, 2)",
        type:     CallExpression
    },
    {
        scope:    { greater: (a: number, b: number) => a == 1 && b == 2, factory: () => [1, 2] },
        raw:      "greater(...factory())",
        value:    true,
        toString: "greater(...factory())",
        type:     CallExpression
    },
    {
        scope:    { ...scope, factory: () => [2, true]},
        raw:      "new MyClass(...factory()).getId()",
        value:    2,
        toString: "new MyClass(...factory()).getId()",
        type:     CallExpression,
    },
    {
        scope:    { },
        raw:      "(() => 1)()",
        value:    1,
        toString: "(() => 1)()",
        type:     CallExpression
    },
    {
        scope:      { b: 1 },
        raw:      "(a => a + b)(1)",
        value:    2,
        toString: "((a) => a + b)(1)",
        type:     CallExpression
    },
    {
        scope:    { b: 1 },
        raw:      "(a => a + b)(1)",
        value:    2,
        toString: "((a) => a + b)(1)",
        type:     CallExpression
    },
    {
        scope:    { b: 1 },
        raw:      "((a, b) => a + b)(1, 2)",
        value:    3,
        toString: "((a, b) => a + b)(1, 2)",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "((...a) => a)(1, 2)",
        value:    [1, 2],
        toString: "((...a) => a)(1, 2)",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "((...[a, b]) => [a, b])(1, 2)",
        value:    [1, 2],
        toString: "((...[a, b]) => [a, b])(1, 2)",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "(([a, b]) => [a, b])([1, 2])",
        value:    [1, 2],
        toString: "(([a, b]) => [a, b])([1, 2])",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "(([, b]) => [b])([1, 2])",
        value:    [2],
        toString: "(([, b]) => [b])([1, 2])",
        type:     CallExpression
    },
    {
        scope:    scope,
        raw:      "1 > 2 ? \"greater\" : \"smaller\"",
        value:    "smaller",
        toString: "1 > 2 ? \"greater\" : \"smaller\"",
        type:     ConditionalExpression
    },
    {
        scope:    scope,
        raw:      "2 > 1 ? \"greater\" : \"smaller\"",
        value:    "greater",
        toString: "2 > 1 ? \"greater\" : \"smaller\"",
        type:     ConditionalExpression
    },
    {
        scope:    scope,
        raw:      "undefined",
        value:    undefined,
        toString: "undefined",
        type:     Identifier,
    },
    {
        scope:    scope,
        raw:      "1",
        value:    1,
        toString: "1",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "\"double quotes\"",
        value:    "double quotes",
        toString: "\"double quotes\"",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "'single quotes'",
        value:    "single quotes",
        toString: "\"single quotes\"",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "true",
        value:    true,
        toString: "true",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "false",
        value:    false,
        toString: "false",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "null",
        value:    null,
        toString: "null",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "/test/",
        value:    /test/,
        toString: "/test/",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "/test/gi",
        value:    /test/gi,
        toString: "/test/gi",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "true && false",
        value:    false,
        toString: "true && false",
        type:     LogicalExpression,
    },
    {
        scope:    scope,
        raw:      "true || false",
        value:    true,
        toString: "true || false",
        type:     LogicalExpression,
    },
    {
        scope:    scope,
        raw:      "false || true",
        value:    true,
        toString: "false || true",
        type:     LogicalExpression,
    },
    {
        scope:    scope,
        raw:      "this.new",
        value:    "new",
        toString: "this.new",
        type:     MemberExpression,
    },
    {
        scope:    { this: { id: 1 } },
        raw:      "this.id",
        value:    1,
        toString: "this.id",
        type:     MemberExpression,
    },
    {
        scope:    scope,
        raw:      "this.increment",
        value:    scope.this.increment,
        toString: "this.increment",
        type:     MemberExpression,
    },
    {
        scope:    scope,
        raw:      "this['increment']",
        value:    scope.this.increment,
        toString: "this[\"increment\"]",
        type:     MemberExpression,
    },
    {
        scope:    scope,
        raw:      "this.getObject().value",
        value:    "Hello World!!!",
        toString: "this.getObject().value",
        type:     MemberExpression,
    },
    {
        scope:    scope,
        raw:      "new MyClass",
        value:    { id: 0, active: false },
        toString: "new MyClass()",
        type:     NewExpression,
    },
    {
        scope:    { ...scope, factory: () => [1, true]},
        raw:      "new MyClass(...factory())",
        value:    { id: 1, active: true },
        toString: "new MyClass(...factory())",
        type:     NewExpression,
    },
    {
        scope:    scope,
        raw:      "{ }",
        value:    { },
        toString: "{ }",
        type:     ObjectExpression,
    },
    {
        scope: scope,
        raw:      "{ 1: 1 }",
        value:    { 1: 1 },
        toString: "{ 1: 1 }",
        type:     ObjectExpression,
    },
    {
        scope:    scope,
        raw:      "{ new: 1 }",
        value:    { new: 1 },
        toString: "{ new: 1 }",
        type:     ObjectExpression,
    },
    {
        scope:    scope,
        raw:      "{ foo: 1, bar: [1, ...[2, 3]], [{id: 1}.id]: 1 }",
        value:    { foo: 1, bar: [1, 2, 3], [{id: 1}.id]: 1 },
        toString: "{ foo: 1, bar: [1, ...[2, 3]], [{ id: 1 }.id]: 1 }",
        type:     ObjectExpression,
    },
    {
        scope:    scope,
        raw:      "{ foo: 'bar', ...{ id: 2, value: 3 } }",
        value:    { foo: "bar", id: 2, value: 3 },
        toString: "{ foo: \"bar\", ...{ id: 2, value: 3 } }",
        type:     ObjectExpression,
    },
    {
        scope:    scope,
        raw:      "{ foo: 'bar', ...[1, 2] }",
        value:    { 0: 1, 1: 2, foo: "bar" },
        toString: "{ foo: \"bar\", ...[1, 2] }",
        type:     ObjectExpression,
    },
    {
        scope:    { id: 1 },
        raw:      "{ id }",
        value:    { id: 1 },
        toString: "{ id }",
        type:     ObjectExpression,
    },
    {
        scope:    { id: 1 },
        raw:      "{ [id]: 2 }",
        value:    { 1: 2 },
        toString: "{ [id]: 2 }",
        type:     ObjectExpression,
    },
    {
        scope:    { factory: () => ({ id: 1 }) },
        raw:      "{ foo: 1, ...factory() }",
        value:    { foo: 1, id: 1 },
        toString: "{ foo: 1, ...factory() }",
        type:     ObjectExpression,
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "x++, y + x",
        value:    4,
        toString: "(x++, y + x)",
        type:     SequenceExpression,
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "(x++, y + x)",
        value:    4,
        toString: "(x++, y + x)",
        type:     SequenceExpression,
    },
    {
        scope:    scope,
        raw:      "`The id is: ${this.id}`",
        value:    "The id is: 1",
        toString: "`The id is: ${this.id}`",
        type:     TemplateLiteral
    },
    {
        scope:    { this: { id: 1 } },
        raw:      "this",
        value:    { id: 1 },
        toString: "this",
        type:     ThisExpression,
    },
    {
        scope:    scope,
        raw:      "+1",
        value:    1,
        toString: "+1",
        type:     UnaryExpression
    },
    {
        scope:    scope,
        raw:      "-1",
        value:    -1,
        toString: "-1",
        type:     UnaryExpression
    },
    {
        scope:    scope,
        raw:      "~1",
        value:    -2,
        toString: "~1",
        type:     UnaryExpression
    },
    {
        scope:    scope,
        raw:      "!true",
        value:    false,
        toString: "!true",
        type:     UnaryExpression
    },
    {
        scope:    scope,
        raw:      "typeof 1",
        value:    "number",
        toString: "typeof 1",
        type:     UnaryExpression
    },
    {
        scope:    { value: 1 },
        raw:      "++value",
        value:    2,
        toString: "++value",
        type:     UpdateExpression
    },
    {
        scope: { 識別子: 1 },
        raw:      "識別子--",
        value:    1,
        toString: "識別子--",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 } },
        raw:      "++this.value",
        value:    2,
        toString: "++this.value",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 } },
        raw:      "--this.value",
        value:    0,
        toString: "--this.value",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 } },
        raw:      "this.value++",
        value:    1,
        toString: "this.value++",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 } },
        raw:      "this.value--",
        value:    1,
        toString: "this.value--",
        type:     UpdateExpression
    },
];

export const invalidExpressions: Array<InvalidExpressionFixtureSpec> =
[
    {
        context: scope,
        raw:     "this.''",
        error:   new SyntaxError(Messages.unexpectedString, 1, 5, 6)
    },
    {
        context: scope,
        raw:     "this.1",
        error:   new SyntaxError(Messages.unexpectedNumber, 1, 4, 5)
    },
    {
        context: scope,
        raw:     ".",
        error:   new SyntaxError(Messages.unexpectedToken + " .", 1, 0, 1)
    },
    {
        context: scope,
        raw:     "if",
        error:   new SyntaxError(Messages.unexpectedToken + " if", 1, 0, 1)
    },
    {
        context: scope,
        raw:     "this.?",
        error:   new SyntaxError(Messages.unexpectedToken + " ?", 1, 5, 6)
    },
    {
        context: scope,
        raw:     "this if",
        error:   new SyntaxError(Messages.unexpectedToken + " if", 1, 5, 6)
    },
    {
        context: scope,
        raw:     "{ (foo) }",
        error:   new SyntaxError(Messages.unexpectedToken + " (", 1, 2, 3)
    },
    {
        context: scope,
        raw:     "{ new }",
        error:   new SyntaxError(Messages.unexpectedToken + " }", 1, 6, 7)
    },
    {
        context: scope,
        raw:     "1 + if",
        error:   new SyntaxError(Messages.unexpectedToken + " if", 1, 4, 5)
    },
    {
        context: scope,
        raw:     "[ ? ]",
        error:   new SyntaxError(Messages.unexpectedToken + " ?", 1, 2, 3)
    },
    {
        context: scope,
        raw:     "",
        error:   new SyntaxError(Messages.unexpectedEndOfExpression, 1, 0, 1)
    },
    {
        context: scope,
        raw:     "1 < 2 ? true .",
        error:   new SyntaxError(Messages.unexpectedEndOfExpression, 1, 14, 15)
    },
    {
        context: scope,
        raw:     "(x.y = 1) => 1",
        error:   new SyntaxError(Messages.illegalPropertyInDeclarationContext, 1, 10, 11)
    },
    {
        context: scope,
        raw:     "({ x = 1 })",
        error:   new SyntaxError(Messages.unexpectedToken + " =", 1, 5, 6)
    },
    {
        context: scope,
        raw:     "([x.y]) => 1",
        error:   new SyntaxError(Messages.unexpectedToken + " =>", 1, 8, 9)
    },
    {
        context: scope,
        raw:     "({ x: 1 }) => 1",
        error:   new SyntaxError(Messages.unexpectedToken + " =>", 1, 11, 12)
    },
    {
        context: scope,
        raw:     "([{ x: 1 }]) => 1",
        error:   new SyntaxError(Messages.unexpectedToken + " =>", 1, 13, 14)
    },
    {
        context: scope,
        raw:     "(...{ a, { b }}) => a + b",
        error:   new SyntaxError(Messages.unexpectedToken + " {", 1, 9, 10)
    },
    {
        context: scope,
        raw:     "(a, { b, x: { c: 1 } }) => a + b + c",
        error:   new SyntaxError(Messages.unexpectedToken + " =>", 1, 24, 25)
    },
    {
        context: scope,
        raw:     "(...{ a, ...{ b } }) => a",
        error:   new SyntaxError(Messages.restOperatorMustBeFollowedByAnIdentifierInDeclarationContexts, 1, 18, 19)
    },
    {
        context: scope,
        raw:     "(...a = []) => a",
        error:   new SyntaxError(Messages.restParameterMayNotHaveAdefaultInitializer, 1, 10, 11)
    },
    {
        context: scope,
        raw:     "([x, ...y = []]) => y",
        error:   new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 17, 18)
    },
];