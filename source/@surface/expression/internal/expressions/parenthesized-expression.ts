import { hasValue }                  from "@surface/core";
import type IExpression              from "../interfaces/expression";
import type IParenthesizedExpression from "../interfaces/parenthesized-expression";
import NodeType                      from "../node-type.js";

export default class ParenthesizedExpression implements IExpression
{
    private cache: unknown;

    private _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    /* c8 ignore next 4 */
    public set argument(value: IExpression)
    {
        this._argument = value;
    }

    public get type(): NodeType
    {
        return NodeType.ParenthesizedExpression;
    }

    public constructor(argument: IExpression)
    {
        this._argument = argument;
    }

    public clone(): IParenthesizedExpression
    {
        return new ParenthesizedExpression(this.argument.clone());
    }

    public evaluate(scope: object, useCache?: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        return this.cache = this.argument.evaluate(scope, useCache);
    }

    public toString(): string
    {
        return `(${this.argument})`;
    }
}