import type { Constructor } from "@surface/core";
import type HTMLXElement   from "@surface/htmlx-element";
import { attribute }        from "@surface/htmlx-element";

const CSS_COLORS_PATTERN = /^(#[a-f0-9]{6}|((rgba?|hsla?)\([^)]*)\))$/i;

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const colorable = <T extends Constructor<HTMLXElement & { colorable?: HTMLElement }>>(superClass: T): Constructor<IColorable> & T =>
{
    class Colorable extends superClass implements IColorable
    {
        private _color:     string = "";
        private _textColor: string = "";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public constructor(...args: any[])
        {
            super(...args);
        }

        @attribute
        public get color(): string
        {
            return this._color;
        }

        public set color(value: string)
        {
            if (value)
            {
                this.colorable?.style.setProperty("--this-color", this.getColor(value));
            }
            else
            {
                this.colorable?.style.removeProperty("--this-color");
            }

            this._color = value;
        }

        @attribute
        public get textColor(): string
        {
            return this._textColor;
        }

        public set textColor(value: string)
        {
            if (value)
            {
                this.colorable?.style.setProperty("--this-text-color", this.getColor(value));
            }
            else
            {
                this.colorable?.style.removeProperty("--this-text-color");
            }

            this._textColor = value;
        }

        private getColor(color: string): string
        {
            return CSS_COLORS_PATTERN.test(color) ? color : `var(--smd-${color})`;
        }
    }

    return Colorable;
};

export interface IColorable
{
    color:     string;
    textColor: string;
}

export default colorable;