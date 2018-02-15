import IExpression, { Context, ConstantExpression } from "./expression";
import Parser from "./parser";

import { Action } from "@surface/types";

export default class BindParser
{
    private readonly source:  string;
    private readonly notify?: Action;
    private index:   number;
    private context: Context;

    private constructor(context: Context, source: string, notify?: Action)
    {
        this.context = context;
        this.source  = source;
        this.notify  = notify;

        this.index = 0;
    }

    public static scan(context: Context, source: string, notify?: Action): IExpression
    {
        const expressions = new BindParser(context, source, notify).parse(0);

        if (expressions.length == 1)
        {
            return expressions[0];
        }
        else
        {
            return { evaluate: () => expressions.map(x => `${x.evaluate()}`).reduce((previous, current) => previous + current) };
        }
    }

    private advance(): void
    {
        this.index++;
    }

    private parse(start: number): Array<IExpression>
    {
        let scaped = false;

        const expressions: Array<IExpression> = [];

        while (!this.eof() && (this.source.substring(this.index, this.index + 2) != "{{" || scaped))
        {
            scaped = this.source[this.index] == "\\" && !scaped;
            this.advance();
        }

        if (start < this.index)
        {
            const textFragment = this.source.substring(start, this.index)
                .replace(/\\\\/g, "\\")
                .replace(/\\\{/g, "{")
                .replace(/\\\}/g, "}");

            expressions.push(new ConstantExpression(textFragment));
        }

        if (!this.eof())
        {
            let start = this.index + 2;
            let stack = 0;
            do
            {
                if (this.source[this.index] == "{" && !scaped)
                {
                    stack++;
                }

                if (this.source[this.index] == "}" && !scaped)
                {
                    stack--;
                }

                this.advance();
            }
            while (!this.eof() && stack > 0);

            expressions.push(new Parser(this.context, this.source.substring(start, this.index - 2), this.notify).parse());

            return [...expressions, ...this.parse(this.index)];
        }

        return expressions;
    }

    private eof(): boolean
    {
        return this.index == this.source.length;
    }
}