import { Indexer }              from ".";
import { hasValue, isIterable } from "./common/generic";
import { enumerateKeys }        from "./common/object";

export default class Hashcode
{
    private readonly cache:      WeakMap<object, string> = new WeakMap();
    private readonly references: Array<object> = [];

    public static encode(source: unknown): number
    {
        return new Hashcode().encode(source);
    }

    private encode(source: unknown): number
    {
        const initialValue = 7;
        const max          = 0x7FFFFFFF;
        const bits         = 32;

        const signature = this.getSignature(source);

        return signature.split("").reduce((previous, current) => (previous * bits * current.charCodeAt(0)) % max, initialValue);
    }

    private getSignature(source: unknown): string
    {
        let signature = "";

        if (source instanceof Object && typeof source != "function")
        {
            const cache = this.cache.get(source);

            if (cache)
            {
                return cache;
            }

            if (isIterable(source))
            {
                let index = 0;
                for (const element of source)
                {
                    signature = signature ? `${signature},${index}:${this.getSignature(element)}` : `${index}:${this.getSignature(element)}`;
                    index++;
                }

                signature = `[${signature}][${source.constructor.name}]`;
            }
            else
            {
                if (this.references.includes(source))
                {
                    return `[circular][${source.constructor.name}]`;
                }

                this.references.push(source);

                for (const key of enumerateKeys(source))
                {
                    const value = (source as Indexer)[key];

                    signature = signature ? `${signature},${key}:${this.getSignature(value)}` : `${key}:${this.getSignature(value)}`;
                }

                this.references.splice(this.references.indexOf(source));

                signature = `{${signature}}[${source.constructor.name}]`;
            }

            this.cache.set(source, signature);
        }
        else if (hasValue(source))
        {
            signature = `${source.toString()}#${source.constructor.name}`;
        }
        else
        {
            signature = `${source}#?`;
        }

        return signature;
    }
}