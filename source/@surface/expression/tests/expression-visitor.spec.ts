import { batchTest, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                                         from "chai";
import Expression                                         from "..";
import FixtureVisitor                                     from "./fixtures/fixture-visitor";
import { validVisitors }                                  from "./fixtures/visitors";

@suite
export default class ExpressionVisitorSpec
{
    @shouldPass
    @batchTest(validVisitors, x => `visit ${x.value}`)
    public visitsShouldWork(spec: { raw: string, value: string, context?: Object }): void
    {
        const expression = Expression.from(spec.raw, spec.context);
        const visitor  = new FixtureVisitor();

        visitor.visit(expression);

        expect(visitor.toString()).to.equal(spec.value);
    }

    @test @shouldFail
    public invalidExpression(): void
    {
        const visitor  = new FixtureVisitor();
        let expression = { cache: null, type: -1, evaluate: () => null };

        expect(() => visitor.visit(expression).evaluate()).to.throw(Error, "Invalid expression");
    }
}