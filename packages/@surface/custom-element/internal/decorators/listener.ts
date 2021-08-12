import type { Constructor }                     from "@surface/core";
import { DisposableMetadata, HookableMetadata } from "@surface/core";
import AsyncObserver                            from "../reactivity/async-observer.js";

/**
 * Listen to property changes.
 * @param properties Properties to be observed.
 */
export default function listener(...properties: string[]): MethodDecorator;

/**
 * Listen to property changes.
 * @param paths Paths to be observed.
 */
export default function listener(...paths: string[][]): MethodDecorator;
export default function listener(...propertiesOrPaths: (string | string[])[]): MethodDecorator
{
    return (target, propertyKey) =>
    {
        const paths = propertiesOrPaths.map(x => Array.isArray(x) ? x : [x]) as string[][];

        const finisher = (instance: object): void =>
        {
            const disposableMetadata = DisposableMetadata.from(instance);
            const method             = Reflect.get(instance, propertyKey) as Function;

            for (const path of paths)
            {
                const observer     = AsyncObserver.observe(instance, path);
                const subscription = observer.subscribe(x => method(x));

                disposableMetadata.add({ dispose: () => subscription.unsubscribe() });
            }
        };

        HookableMetadata.from(target.constructor as Constructor).finishers.push(finisher);
    };
}