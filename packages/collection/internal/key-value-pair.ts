export default class KeyValuePair<TKey, TValue>
{
    private readonly _key: TKey;
    private readonly _value: TValue;

    public get key(): TKey
    {
        return this._key;
    }

    public get value(): TValue
    {
        return this._value;
    }

    public constructor(key: TKey, value: TValue)
    {
        this._key   = key;
        this._value = value;
    }
}