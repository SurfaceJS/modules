import { Indexer }         from "@surface/core";
import ITemplateDescriptor from "../interfaces/template-descriptor";
import { STATIC_METADATA } from "../symbols";

export default class StaticMetadata
{
    public converters:         Indexer<(target: Indexer, value: string) => void>     = { };
    public shadowRootInit:     ShadowRootInit                                        = { mode: "open" };
    public observedAttributes: string[]                                              = [];
    public styles:             CSSStyleSheet[]                                       = [];

    public template!:   HTMLTemplateElement;
    public descriptor!: ITemplateDescriptor;

    public static from(target: Function): StaticMetadata
    {
        if (!Reflect.has(target, STATIC_METADATA))
        {
            Reflect.defineProperty(target, STATIC_METADATA, { value: new StaticMetadata() });
        }
        else if (!target.hasOwnProperty(STATIC_METADATA))
        {
            Reflect.defineProperty(target, STATIC_METADATA, { value: (Reflect.get(target, STATIC_METADATA) as StaticMetadata).inherit() });
        }

        return Reflect.get(target, STATIC_METADATA) as StaticMetadata;
    }

    public inherit(): StaticMetadata
    {
        const clone = new StaticMetadata();

        clone.converters         = { ...this.converters };
        clone.observedAttributes = [...this.observedAttributes];
        clone.styles             = [...this.styles];

        return clone;
    }
}