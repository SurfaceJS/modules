import { Nullable }           from "@surface/core";
import CustomElement          from "@surface/custom-element";
import Enumerable             from "@surface/enumerable";
import Component              from "..";
import { attribute, element } from "../decorators";
import template               from "./index.html";

@element("surface-for-each", template)
export default class ForEach extends Component
{
    private _of:       Iterable<unknown> = [];
    private _end:      number = 0;
    private _start:    number = 0;
    private _template: Nullable<HTMLTemplateElement>;

    @attribute
    public get end(): number
    {
        return this._end;
    }

    public set end(value: number)
    {
        if (value != this.end)
        {
            this._end = value;

            if (this.end >= this.start)
            {
                this.changed();
            }
        }
    }

    public get of(): Iterable<unknown>
    {
        return this._of;
    }

    public set of(value: Iterable<unknown>)
    {
        if (value != this.of)
        {
            this._of = value;

            this.changed();
        }
    }

    @attribute
    public get start(): number
    {
        return this._start;
    }

    public set start(value: number)
    {
        if (value != this.start)
        {
            this._start = value;

            if (this.end >= this.start)
            {
                this.changed();
            }
        }
    }

    public get template(): Nullable<HTMLTemplateElement>
    {
        if (!this._template)
        {
            this._template = this.query("template");

            if (this._template)
            {
                super.removeChild(this._template);
            }
        }

        return this._template;
    }

    public constructor()
    {
        super();

        super.bindedCallback = this.changed.bind(this);
    }

    private changed(): void
    {
        if (this.template)
        {
            CustomElement.contextUnbind(this);
            super.innerHTML = "";

            let sequence = Enumerable.from(this.of);

            if (sequence.any())
            {
                if (this.end > 0)
                {
                    sequence = sequence.take(this.end + 1);
                }

                if (this.start > 0)
                {
                    sequence = sequence.skip(this.start);
                }
            }
            else if (this.end > 0)
            {
                sequence = Enumerable.range(this.start, this.end) as Enumerable<unknown>;
            }

            let index = this.start;

            for (const item of sequence)
            {
                const fragment = document.importNode(this.template.content, true);

                CustomElement.contextBind({ ...super.context, index, item } as object, fragment); //TODO - Review binding order

                super.appendChild(fragment);

                index++;
            }
        }
    }

    protected attributeChangedCallback(name: "start"|"end", _: Nullable<string>, newValue: Nullable<string>)
    {
        const value = Number.parseInt(`${newValue}`) || 0;

        if (value != this[name])
        {
            this[name] = value;
        }
    }
}