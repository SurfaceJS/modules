import { Hashcode }   from "@surface/core";
import type IComparer from "./interfaces/comparer";

type Slot<TElement> =
{
    hash:  number,
    value: TElement | null,
    next:  number,
};

const INITIAL_SIZE = 7;
export default class HashSet<TElement> implements Iterable<TElement>
{
    private readonly comparer: IComparer<TElement | null>;

    private buckets:  number[] = new Array(INITIAL_SIZE).fill(0);
    private count:    number   = 0;
    private freeList: number   = -1;
    private slots: Slot<TElement>[] = new Array(INITIAL_SIZE);

    public constructor(comparer: IComparer<TElement>)
    {
        this.comparer = comparer;
    }

    public static from<T>(source: Iterable<T>, comparer: IComparer<T>): HashSet<T>
    {
        const set = new HashSet(comparer);

        for (const element of source)
        {
            set.add(element);
        }

        return set;
    }

    private find(element: TElement, hash: number): boolean
    {
        for (let index = this.buckets[hash % this.buckets.length]! - 1; index >= 0; index = this.slots[index]!.next)
        {
            if (this.slots[index]!.hash == hash && this.comparer.equals(element, this.slots[index]!.value))
            {
                return true;
            }
        }

        return false;
    }

    private resize(): void
    {
        const multiple = 2;
        const newSize  = this.count * multiple + 1;
        const buckets  = new Array<number>(newSize).fill(0);

        for (let i = 0; i < this.count; i++)
        {
            const index = this.slots[i]!.hash % newSize;

            this.slots[i]!.next = buckets[index]! - 1;

            buckets[index] = i + 1;
        }

        this.buckets = buckets;
    }

    public *[Symbol.iterator](): Iterator<TElement>
    {
        for (const element of this.slots)
        {
            if (element && element.hash != -1)
            {
                yield element.value as Object as TElement;
            }
        }
    }

    public add(element: TElement): boolean
    {
        const hash = Hashcode.encode(element);

        if (!this.find(element, hash))
        {
            let index: number;

            if (this.freeList >= 0)
            {
                index = this.freeList;
                this.freeList = this.slots[index]!.next;
            }
            else
            {
                if (this.count == this.slots.length)
                {
                    this.resize();
                }

                index = this.count;
                this.count++;
            }

            this.slots[index] = { hash, next: this.buckets[hash % this.buckets.length]! - 1, value: element };

            this.buckets[hash % this.buckets.length] = index + 1;

            return true;
        }

        return false;
    }

    public contains(element: TElement): boolean
    {
        return this.find(element, Hashcode.encode(element));
    }

    public remove(element: TElement): boolean
    {
        const hash = Hashcode.encode(element);
        let lastIndex = -1;

        for (let index = this.buckets[hash % this.buckets.length]! - 1; index >= 0; index = this.slots[index]!.next)
        {
            if (this.slots[index]!.hash == hash && this.comparer.equals(element, this.slots[index]!.value))
            {
                if (lastIndex < 0)
                {
                    this.buckets[hash % this.buckets.length] = this.slots[index]!.next + 1;
                } /* c8 ignore next 4 */
                else
                {
                    this.slots[lastIndex]!.next = this.slots[index]!.next;
                }

                this.slots[index] = { hash: -1, next: this.freeList, value: null };

                this.freeList = index;

                return true;
            } /* c8 ignore next 3 */

            lastIndex = index;
        }

        return false;
    }
}
