import type { Delegate, Subscription } from "@surface/core";

export default class ReactiveMap<K, V> extends Map<K, V>
{
    protected readonly listeners: Set<Delegate<[this]>> = new Set();

    private notify(): void
    {
        this.listeners.forEach(listener => listener(this));
    }

    public override set(key: K, value: V): this
    {
        super.set(key, value);

        this.notify();

        return this;
    }

    public override delete(key: K): boolean
    {
        const deleted = super.delete(key);

        this.notify();

        return deleted;
    }

    public override clear(): void
    {
        super.clear();

        this.notify();
    }

    public subscribe(listerner: Delegate<[this]>): Subscription
    {
        this.listeners.add(listerner);

        return { unsubscribe: () => this.unsubscribe(listerner) };
    }

    public unsubscribe(listerner: Delegate<[this]>): void
    {
        if (!this.listeners.delete(listerner))
        {
            throw new Error("Listerner not subscribed");
        }
    }
}