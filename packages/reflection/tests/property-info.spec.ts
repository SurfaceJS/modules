import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import PropertyInfo                from "../internal/property-info.js";
import Type                        from "../internal/type.js";
import Mock                        from "./fixtures/mock.js";

const propertyInfo = new PropertyInfo("instanceProperty", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceProperty")!, Type.of(Mock), false, false);

@suite
export default class FieldInfoSpec
{
    @test @shouldPass
    public declaringType(): void
    {
        chai.assert.deepEqual(propertyInfo.declaringType, Type.of(Mock));
    }

    @test @shouldPass
    public isStatic(): void
    {
        chai.assert.equal(propertyInfo.isStatic, false);
    }

    @test @shouldPass
    public isOwn(): void
    {
        chai.assert.equal(propertyInfo.isOwn, false);
    }

    @test @shouldPass
    public key(): void
    {
        chai.assert.equal(propertyInfo.key, "instanceProperty");
    }

    @test @shouldPass
    public readonly(): void
    {
        chai.assert.equal(propertyInfo.readonly, false);
    }
}