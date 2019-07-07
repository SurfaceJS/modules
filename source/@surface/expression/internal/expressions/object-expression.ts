import { Indexer, Nullable } from "@surface/core";
import { hasValue }          from "@surface/core/common/generic";
import IExpression           from "../../interfaces/expression";
import IProperty             from "../../interfaces/property";
import ISpreadElement        from "../../interfaces/spread-element";
import NodeType              from "../../node-type";
import TypeGuard             from "../type-guard";

export default class ObjectExpression implements IExpression
{
    private cache: Nullable<Indexer>;

    private _properties: Array<IProperty|ISpreadElement>;
    public get properties(): Array<IProperty|ISpreadElement>
    {
        return this._properties;
    }

    public set properties(value: Array<IProperty|ISpreadElement>)
    {
        this._properties = value;
    }

    public get type(): NodeType
    {
        return NodeType.ObjectExpression;
    }

    public constructor(properties: Array<IProperty|ISpreadElement>)
    {
        this._properties = properties;
    }

    public evaluate(scope: Indexer, useChache: boolean): Indexer
    {
        if (useChache && hasValue(this.cache))
        {
            return this.cache;
        }

        const evaluation: Indexer = { };

        for (const property of this.properties)
        {
            if (TypeGuard.isProperty(property))
            {
                evaluation[property.key.evaluate(scope, useChache) as string|number] = property.value.evaluate(scope, useChache);
            }
            else
            {
                Object.assign(evaluation, property.argument.evaluate(scope, useChache));
            }
        }

        return this.cache = evaluation;
    }

    public toString(): string
    {
        return this.properties.length > 0 ? `{ ${this.properties.map(x => x.toString()).join(", ")} }` : "{ }";
    }
}