import { Indexer }       from "@surface/core";
import IPropertyListener from "../interfaces/notifier";

export default class PropertyListener<TTarget extends Indexer = Indexer, TKey extends keyof TTarget = string> implements IPropertyListener
{
    public constructor(private target: TTarget, private readonly key: TKey)
    { }

    public update(target: TTarget)
    {
        if (this.target != target)
        {
            this.target = target;
        }
    }

    public notify(value: TTarget[TKey]): void
    {
        this.target[this.key] = value;
    }

    public toString(): string
    {
        return `{ "${this.key}": ${JSON.stringify(this.target)} }`;
    }
}