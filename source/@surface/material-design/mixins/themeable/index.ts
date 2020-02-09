import { Constructor }             from "@surface/core";
import CustomElement               from "@surface/custom-element";
import { attribute, computed } from "@surface/custom-element/decorators";

// tslint:disable:no-any
export default <T extends Constructor<CustomElement>>(superClass: T) =>
{
    class Themeable extends superClass
    {
        @attribute
        public dark: boolean = false;

        @attribute
        public light: boolean = false;

        @computed("dark", "light")
        public get themeClasses(): Record<string, boolean>
        {
            return { dark: this.dark, light: this.light };
        }
    }

    return Themeable;
};