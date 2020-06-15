import { Hashcode, Nullable } from "../../core";
import Enumerable             from "../../enumerable";
import { Factory }            from "./types";
import { isIt }               from './common';

export type Args = Array<unknown>;

export default class Setup<TResult>
{
    private readonly callbacks: Map<Args, Function> = new Map();
    private readonly factories: Map<Args, Factory<Args, TResult>> = new Map();
    private readonly results:   Map<Args, TResult> = new Map();
    private readonly throws:    Map<Args, Error | string> = new Map();

    private all(source: Args, args: Args): boolean
    {
        if (source.length != args.length)
        {
            return false;
        }

        for (let index = 0; index < source.length; index++)
        {
            const sourceElement = source[index];
            const argsElement   = args[index];

            if (!(this.checkIt(sourceElement, argsElement) || Object.is(sourceElement, argsElement) || (typeof sourceElement == typeof argsElement && Hashcode.encode(sourceElement) == Hashcode.encode(argsElement)))) {
                return false;
            }
        }

        return true;
    }

    private checkIt(it: unknown, value: unknown): boolean
    {
        if (isIt(it))
        {
            return it(value);
        }

        return false;
    }

    private getFrom<T>(source: Map<Args, T>, args: Args): T | null
    {
        for (const [keys, value] of source)
        {
            if (this.all(keys, args))
            {
                return value;
            }
        }

        return null;
    }
    private getKey<T>(source: Map<Args, T>, args: Args): Args
    {
        const sequence = Enumerable.from(args);

        return Enumerable.from(source.keys()).firstOrDefault(x => sequence.sequenceEqual(Enumerable.from(x))) ?? args;
    }

    public get(args: Args = []): Nullable<TResult>
    {
        const error = this.getFrom(this.throws, args);

        if (error)
        {
            throw error;
        }

        const callback = this.getFrom(this.callbacks, args);

        if (callback)
        {
            callback(args);
        }

        const factory = this.getFrom(this.factories, args);

        if (factory)
        {
            return factory(args);
        }

        return this.getFrom(this.results, args);
    }

    public setCallbacks(args: Args, action: Function): void
    {
        this.callbacks.set(this.getKey(this.callbacks, args), action);
    }

    public setReturns(args: Args, value: TResult): void
    {
        this.results.set(this.getKey(this.results, args), value);
    }


    public setReturnsFactory(args: Args, factory: Factory<Args, TResult>): void
    {
        this.factories.set(this.getKey(this.factories, args), factory);
    }

    public setThrows(args: Args, error: Error | string): void
    {
        this.throws.set(this.getKey(this.throws, args), error);
    }
}
