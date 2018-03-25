import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

import { Nullable } from "@surface/types";

export default class ArrayExpression implements IExpression
{
    private readonly _elements: Array<IExpression>;
    public get elements(): Array<IExpression>
    {
        return this._elements;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Array;
    }

    public constructor(elements: Array<IExpression>)
    {
        this._elements = elements;
    }


    public evaluate(): Array<Nullable<Object>>
    {
        return this.elements.map(x => x.evaluate());
    }
}