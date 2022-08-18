import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import Dictionary                  from "../internal/dictionary.js";
import KeyValuePair                from "../internal/key-value-pair.js";

@suite
export default class ListSpec
{
    @test @shouldPass
    public createEmpty(): void
    {
        chai.assert.doesNotThrow(() => new Dictionary<string, object>());
    }

    @test @shouldPass
    public createFromObject(): void
    {
        chai.assert.doesNotThrow(() => Dictionary.of({ a: 1, b: 2 }));
    }

    @test @shouldPass
    public setEntry(): void
    {
        const dictionary = new Dictionary<string, number>();

        dictionary.set("one", 1);

        chai.assert.equal(dictionary.size, 1);
    }

    @test @shouldPass
    public getEntry(): void
    {
        const dictionary = Dictionary.of({ one: 1 });
        chai.assert.equal(dictionary.get("one"), 1);
    }

    @test @shouldPass
    public hasEntry(): void
    {
        const dictionary = Dictionary.of({ one: 1 });
        chai.assert.equal(dictionary.has("one"), true);
    }

    @test @shouldPass
    public deleteEntry(): void
    {
        const dictionary = Dictionary.of({ one: 1 });

        chai.assert.equal(dictionary.size,       1, "step 1 - dictionary.size");
        chai.assert.equal(dictionary.has("one"), true, "step 1 - dictionary.has('one')");

        dictionary.delete("one");

        chai.assert.equal(dictionary.size,       0, "step 1 - dictionary.size");
        chai.assert.equal(dictionary.has("one"), false, "step 2 - dictionary.has('one')");
    }

    @test @shouldPass
    public iterateEntries(): void
    {
        chai.assert.deepEqual(Dictionary.of({ one: 1 }).toArray(), [new KeyValuePair("one", 1)]);
    }
}