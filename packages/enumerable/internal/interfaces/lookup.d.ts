import type Group from "../group.js";

export default interface ILookup<TKey, TElement> extends Iterable<Group<TKey, TElement>>
{
    count:               number;
    contains(key: TKey): boolean;
    get(key: TKey):      TElement[];
}