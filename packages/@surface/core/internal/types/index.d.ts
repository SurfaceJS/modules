/* eslint-disable @typescript-eslint/no-explicit-any */

type CalleableOverloads<T> = T extends
{
    (...args: infer A1): infer R1,
    (...args: infer A2): infer R2,
    (...args: infer A3): infer R3,
    (...args: infer A4): infer R4,
}
    ? [A1, (...args: A1) => R1] | [A2, (...args: A2) => R2] | [A3, (...args: A3) => R3] | [A4, (...args: A4) => R4]
    : T extends
    {
        (...args: infer A1): infer R1,
        (...args: infer A2): infer R2,
        (...args: infer A3): infer R3,
    }
        ? [A1, (...args: A1) => R1] | [A2, (...args: A2) => R2] | [A3, (...args: A3) => R3]
        : T extends
        {
            (...args: infer A1): infer R1,
            (...args: infer A2): infer R2,
        }
            ? [A1, (...args: A1) => R1] | [A2, (...args: A2) => R2]
            : T extends (...args: infer A1) => infer R1
                ? [A1, (...args: A1) => R1]
                : never;

type NewableOverloads<T> = T extends
{
    new (...args: infer A1): infer R1,
    new (...args: infer A2): infer R2,
    new (...args: infer A3): infer R3,
    new (...args: infer A4): infer R4,
}
    ? [A1, new (...args: A1) => R1] | [A2, new (...args: A2) => R2] | [A3, new (...args: A3) => R3] | [A4, new (...args: A4) => R4]
    : T extends
    {
        new (...args: infer A1): infer R1,
        new (...args: infer A2): infer R2,
        new (...args: infer A3): infer R3,
    }
        ? [A1, new (...args: A1) => R1] | [A2, new (...args: A2) => R2] | [A3, new (...args: A3) => R3]
        : T extends
        {
            new (...args: infer A1): infer R1,
            new (...args: infer A2): infer R2,
        }
            ? [A1, new (...args: A1) => R1] | [A2, new (...args: A2) => R2]
            : T extends new (...args: infer A1) => infer R1
                ? [A1, new (...args: A1) => R1]
                : never;
export type ArrayPathOf<T, P> =
[
    ...
    (
        P extends [infer K0, infer K1, infer K2, infer K3, infer K4]
            ? K0 extends keyof T
                ? K1 extends keyof T[K0]
                    ? K2 extends keyof T[K0][K1]
                        ? K3 extends keyof T[K0][K1][K2]
                            ? K4 extends keyof T[K0][K1][K2][K3]
                                ? [K0, K1, K2, K3, K4]
                                : never
                            : never
                        : never
                    : never
                : never
            : P extends [infer K0, infer K1, infer K2, infer K3]
                ? K0 extends keyof T
                    ? K1 extends keyof T[K0]
                        ? K2 extends keyof T[K0][K1]
                            ? K3 extends keyof T[K0][K1][K2]
                                ? [K0, K1, K2, K3]
                                : never
                            : never
                        : never
                    : never
                : P extends [infer K0, infer K1, infer K2]
                    ? K0 extends keyof T
                        ? K1 extends keyof T[K0]
                            ? K2 extends keyof T[K0][K1]
                                ? [K0, K1, K2]
                                : never
                            : never
                        : never
                    : P extends [infer K0, infer K1]
                        ? K0 extends keyof T
                            ? K1 extends keyof T[K0]
                                ? [K0, K1]
                                : never
                            : never
                        : P extends [infer K0]
                            ? K0 extends keyof T
                                ? [K0]
                                : never
                            : string[]
    )
];
export type ArrayPathOfValue<T, P> =
    P extends [infer K0, infer K1, infer K2, infer K3, infer K4]
        ? K0 extends keyof T
            ? K1 extends keyof T[K0]
                ? K2 extends keyof T[K0][K1]
                    ? K3 extends keyof T[K0][K1][K2]
                        ? K4 extends keyof T[K0][K1][K2][K3]
                            ? T[K0][K1][K2][K3][K4]
                            : never
                        : never
                    : never
                : never
            : never
        : P extends [infer K0, infer K1, infer K2, infer K3]
            ? K0 extends keyof T
                ? K1 extends keyof T[K0]
                    ? K2 extends keyof T[K0][K1]
                        ? K3 extends keyof T[K0][K1][K2]
                            ? T[K0][K1][K2][K3]
                            : never
                        : never
                    : never
                : never
            : P extends [infer K0, infer K1, infer K2]
                ? K0 extends keyof T
                    ? K1 extends keyof T[K0]
                        ? K2 extends keyof T[K0][K1]
                            ? T[K0][K1][K2]
                            : never
                        : never
                    : never
                : P extends [infer K0, infer K1]
                    ? K0 extends keyof T
                        ? K1 extends keyof T[K0]
                            ? T[K0][K1]
                            : never
                        : never
                    : P extends [infer K0]
                        ? K0 extends keyof T
                            ? T[K0]
                            : never
                        : unknown;

export type AsyncCallable                                                    = (...args: any[]) => Promise<any>;
export type AsyncDelegate<TArgs extends unknown[] = [], TResult = void>      = (...args: TArgs) => Promise<TResult>;
export type Callable                                                         = (...args: any[]) => any;
export type Cast<T, U>                                                       = T extends U ? T : never;
export type ClassDecoratorOf<T>                                              = (target: Constructor<T>) => Constructor<T> | void;
export type Constructor<T = object>                                          = Newable<T>;
export type ConstructorOverload<T extends Newable, TArgs>                    = Extract<NewableOverloads<T>, [TArgs, any]>[1];
export type ConstructorParameterOverloads<T extends Newable>                 = NewableOverloads<T>[0];
export type DeepPartial<T>                                                   = { [K in keyof T]?: T[K] extends T[K] | undefined ? DeepPartial<T[K]> : Partial<T[K]> };
export type DeepRequired<T>                                                  = { [K in keyof T]-?: T[K] extends T[K] | undefined ? DeepRequired<T[K]> : Required<T[K]> };
export type Delegate<TArgs extends unknown[] = [], TResult = void>           = (...args: TArgs) => TResult;
export type ExtractFromUnion<T, U>                                           = { [K in T as string]: K extends U ? K : never } extends infer O ? O[keyof O] : never;
export type FieldsOf<T>                                                      = { [K in keyof T]: T[K] };
export type IgnoreKeysOfType<T extends object, U>                            = { [K in keyof T]: T[K] extends U ? never : K }[keyof T];
export type IgnoreOfType<T extends object, U>                                = { [K in IgnoreKeysOfType<T, U>]: T[K] };
export type Indexer<T = unknown>                                             = object & Record<string | number | symbol, T | undefined>;
export type IndexesOf<T extends any[]>                                       = ValuesOf<{ [K in keyof T]: K }>;
export type Intersect<T extends any[]>                                       = UnionToIntersection<T[number]>;
export type KeysOfType<T extends object, U>                                  = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
export type KeyValue<T, K extends keyof T = keyof T>                         = [K, T[K]];
export type Merge<T extends object, U extends object>                        = { [K in keyof (T & U)]: (K extends keyof T ? T[K] : never) | (K extends keyof U ? U[K] : never) };
export type MethodsOf<T extends object>                                      = KeysOfType<T, Function>;
export type Mix<A extends ((superClass: Constructor<any>) => Constructor)[]> = Constructor<UnionToIntersection<InstanceType<ReturnType<A[number]>>>>;
export type Newable<T = object>                                              = new (...args: any[]) => T;
export type OnlyOfType<T extends object, U>                                  = Pick<T, KeysOfType<T, U>>;
export type Overload<T extends Callable, TArgs>                              = Extract<CalleableOverloads<T>, [TArgs, any]>[1];
export type Overwrite<T, U>                                                  = { [K in Exclude<keyof T, U>]: K extends keyof U ? U[K] : T[K] };
export type ParameterOverloads<T extends Callable>                           = CalleableOverloads<T>[0];
export type PropertyType<T extends object, K>                                = K extends keyof T ? T[K] : unknown;
export type Required<T>                                                      = { [K in keyof T]-?: NonNullable<T[K]> };
export type RequiredProperties<T>                                            = { [K in keyof Required<T>]: (T[K] | undefined) };
export type TypesOf<T>                                                       = T[keyof T];
export type UnionToIntersection<U>                                           = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;