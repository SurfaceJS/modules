import type IExpression      from "../interfaces/expression";
import type ITemplateElement from "../interfaces/template-element";
import type ITemplateLiteral from "../interfaces/template-literal";
import NodeType              from "../node-type.js";

export default class TemplateLiteral implements IExpression
{
    private _expressions: IExpression[];
    private _quasis:      ITemplateElement[];

    public get expressions(): IExpression[]
    {
        return this._expressions;
    }

    /* c8 ignore next 4 */
    public set expressions(value: IExpression[])
    {
        this._expressions = value;
    }

    public get quasis(): ITemplateElement[]
    {
        return this._quasis;
    }

    /* c8 ignore next 4 */
    public set quasis(value: ITemplateElement[])
    {
        this._quasis = value;
    }

    public get type(): NodeType
    {
        return NodeType.TemplateLiteral;
    }

    public constructor(quasis: ITemplateElement[], expressions: IExpression[])
    {
        this._expressions = expressions;
        this._quasis      = quasis;
    }

    public clone(): ITemplateLiteral
    {
        return new TemplateLiteral(this.quasis.map(x => x.clone()), this.expressions.map(x => x.clone()));
    }

    public evaluate(scope: object): string
    {
        let result = "";

        for (let i = 0; i < this.expressions.length; i++)
        {
            result += `${this.quasis[i].cooked}${this.expressions[i].evaluate(scope)}`;
        }

        return result + this.quasis[this.quasis.length - 1].cooked;
    }

    public toString(): string
    {
        let result = "";

        for (let i = 0; i < this.expressions.length; i++)
        {
            result += `${this.quasis[i].raw}\$\{${this.expressions[i]}\}`;
        }

        return `\`${result + this.quasis[this.quasis.length - 1].raw}\``;
    }
}