import type { Delegate }     from "@surface/core";
import { setValue }          from "@surface/core";
import type { Subscription } from "@surface/observer";
import { scheduler }         from "../singletons.js";
import AsyncObserver         from "./async-observer.js";

export default class DataBind
{
    public static observe(target: object, observables: string[][], listener: Delegate<[unknown]>, lazy: boolean = false): Subscription
    {
        const subscriptions = observables.map(path => DataBind.oneWay(target, path, listener, lazy));

        return { unsubscribe: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
    }

    public static oneWay(root: object, path: string[], listener: Delegate<[unknown]>, lazy: boolean = false): Subscription
    {
        const observer = AsyncObserver.observe(root, path, scheduler);

        const subscription = observer.subscribe(listener);

        if (!lazy)
        {
            observer.notify();
        }

        return subscription;
    }

    public static twoWay(left: object, leftPath: string[], right: object, rightPath: string[]): [Subscription, Subscription]
    {
        const leftListener = (value: unknown): void => setValue(value, right, ...rightPath);
        const rightListener = (value: unknown): void => setValue(value, left, ...leftPath);

        const leftSubscription  = DataBind.oneWay(left, leftPath, leftListener, true);
        const rightSubscription = DataBind.oneWay(right, rightPath, rightListener);

        return [leftSubscription, rightSubscription];
    }
}