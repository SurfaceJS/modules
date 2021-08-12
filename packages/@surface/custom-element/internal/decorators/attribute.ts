import type { Constructor, Indexer }                           from "@surface/core";
import { DisposableMetadata, HookableMetadata, camelToDashed } from "@surface/core";
import type ICustomElement                                     from "../interfaces/custom-element";
import Metadata                                                from "../metadata/metadata.js";
import PrototypeMetadata                                       from "../metadata/prototype-metadata.js";
import StaticMetadata                                          from "../metadata/static-metadata.js";
import AsyncObserver                                           from "../reactivity/async-observer.js";
import { scheduler }                                           from "../singletons.js";

type Serializer =
{
    parse:     (value: string) => unknown,
    stringfy?: (value: unknown) => string,
};

type Types = typeof Boolean | typeof Number | typeof String;

type AttributeOptions =
{

    /** Type to be converted or serializer that will handle the conversion. */
    type:  Types | Serializer,

    /** Attribute name */
    name?: string,
};

const STANDARD_BOOLEANS = new Set(["checked", "disabled", "readonly"]);

function getTypeSerializer(type: AttributeOptions["type"]): Serializer
{
    if (typeof type == "function")
    {
        switch (type)
        {
            case Boolean:
                return { parse: x => x === "" || x == "true" };
            case Number:
                return { parse: x => Number(x) || 0 };
            case String:
            default:
                return { parse: x => x };
        }
    }

    return type;
}

function patchPrototype(prototype: ICustomElement): void
{
    const metadata = PrototypeMetadata.from(prototype);

    if (!metadata.attributeChangedCallback)
    {
        const callback = prototype.attributeChangedCallback;

        if (!callback || callback != metadata.attributeChangedCallback)
        {
            function attributeChangedCallback(this: ICustomElement, attributeName: string, oldValue: string | undefined, newValue: string, namespace: string | undefined): void
            {
                const metadata = Metadata.from(this);

                if (!metadata.isPropagatingCallback && !metadata.reflectingAttribute.has(attributeName))
                {
                    const action = (): void =>
                    {
                        const value = attributeName == newValue && STANDARD_BOOLEANS.has(attributeName) ? "" : newValue;

                        StaticMetadata.from(this.constructor).converters[attributeName]?.(this as object as Indexer, value);
                    };

                    void scheduler.enqueue(action, "high");
                }

                metadata.isPropagatingCallback = true;

                callback?.call(this, attributeName, oldValue, newValue, namespace);

                metadata.isPropagatingCallback = false;
            }

            metadata.attributeChangedCallback = prototype.attributeChangedCallback = attributeChangedCallback;
        }
    }

    if (!prototype.constructor.hasOwnProperty("observedAttributes"))
    {
        function get(this: Constructor): string[]
        {
            return StaticMetadata.from(this).observedAttributes;
        }

        Object.defineProperty(prototype.constructor, "observedAttributes", { get });
    }
}

/**
 * Keep sync between attribute and the decorated property.
 * @param type type to be converted.
 */
function attribute(type: Types): (target: ICustomElement, propertyKey: string) => void;

/**
 * Keep sync between attribute and the decorated property.
 * @param options attribute sync options.
 */
function attribute(options: AttributeOptions): (prototype: ICustomElement, propertyKey: string) => void;

/** Keep sync between attribute and the decorated property. */
function attribute(prototype: ICustomElement, propertyKey: string): void;
function attribute(...args: [Types | AttributeOptions] |  [ICustomElement, string, PropertyDescriptor?]): ((prototype: ICustomElement, propertyKey: string) => void) | void
{
    const decorator = (prototype: ICustomElement, propertyKey: string): void =>
    {
        const options: AttributeOptions = args.length == 1
            ? typeof args[0] == "function"
                ? { type: args[0] }
                : args[0]
            : { type: String };

        const constructor = prototype.constructor as Constructor;

        const attributeName = options.name ?? camelToDashed(propertyKey);

        const staticMetadata = StaticMetadata.from(constructor);

        staticMetadata.observedAttributes.push(attributeName);

        const serializer = getTypeSerializer(options.type);

        staticMetadata.converters[attributeName] = (target: Indexer, value: string) =>
        {
            const current = target[propertyKey];
            const parsed  = serializer.parse(value);

            if (!Object.is(current, parsed))
            {
                target[propertyKey] = parsed;
            }
        };

        const initializer = (instance: HTMLElement): void =>
        {
            const metadata = Metadata.from(instance);

            const action = (value: unknown): void =>
            {
                metadata.reflectingAttribute.add(attributeName);

                if (typeof value == "boolean" && !serializer.stringfy)
                {
                    value ? instance.setAttribute(attributeName, "") : instance.removeAttribute(attributeName);
                }
                else
                {
                    instance.setAttribute(attributeName, (serializer.stringfy ?? String)(value));
                }

                metadata.reflectingAttribute.delete(attributeName);
            };

            const subscription = AsyncObserver.observe(instance, [propertyKey], scheduler).subscribe(action);

            DisposableMetadata.from(instance).add({ dispose: () => subscription.unsubscribe() });
        };

        HookableMetadata.from(constructor as Constructor<HTMLElement>).finishers.push(initializer);

        patchPrototype(prototype);
    };

    if (args.length == 1)
    {
        return decorator;
    }

    const [target, propertyKey] = args;

    decorator(target, propertyKey);
}

export { AttributeOptions };

export default attribute;
