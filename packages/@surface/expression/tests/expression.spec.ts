import { assert } from "@surface/core";
import { batchTest, shouldFail, shouldPass, suite, test }          from "@surface/test-suite";
import chai                                                        from "chai";
import Expression                                                  from "../internal/expression.js";
import Messages                                                    from "../internal/messages.js";
import NodeType                                                    from "../internal/node-type.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { EvaluationErrorExpected, ExpressionFactoryExpected } from "./expression-expectations.js";
import { evaluationsExpected, expressionFactoriesExpected }        from "./expression-expectations.js";

@suite
export default class ExpressionSpec
{
    @shouldPass
    @batchTest(expressionFactoriesExpected, x => `method Expression.${x.method} should return ${NodeType[x.type]} Expression`)
    public expressionFactory(expressionFactoryExpected: ExpressionFactoryExpected): void
    {
        const expression = expressionFactoryExpected.factory();

        chai.assert.equal(expression.type, expressionFactoryExpected.type);
        chai.assert.equal(expression.toString(), expressionFactoryExpected.toString);

        const clone = expression.clone();

        if (expression.hasOwnProperty("toString"))
        {
            clone.clone    = expression.clone;
            clone.toString = expression.toString;
        }

        chai.assert.deepEqual(expression, clone);
    }

    @test @shouldPass
    public parse(): void
    {
        const expression = Expression.parse("this");

        chai.assert.equal(expression.type, NodeType.ThisExpression);
    }

    @test @shouldPass
    public regExpLiteral(): void
    {
        const expression = Expression.regex("foo", "gi");

        chai.assert.equal(expression.pattern, "foo", "pattern");
        chai.assert.equal(expression.flags, "gi", "flags");
        chai.assert.equal(expression.value, null, "value");
        chai.assert.deepEqual(expression.evaluate(), /foo/gi, "evaluate");
        chai.assert.deepEqual(expression.evaluate(), /foo/gi, "evaluate with cache");
        chai.assert.deepEqual(expression.toString(), "/foo/gi", "toString");
    }

    @shouldFail
    @batchTest(evaluationsExpected, x => `evaluate: ${x.raw}; should throw ${x.error.message}`)
    public evaluationsShouldThrow(evaluationErrorExpected: EvaluationErrorExpected): void
    {
        try
        {
            Expression.parse(evaluationErrorExpected.raw).evaluate(evaluationErrorExpected.scope);

            throw new Error(`Evaluate: ${evaluationErrorExpected.raw}; not throw`);
        }
        catch (error)
        {
            assert(error instanceof Error);

            chai.assert.equal(error.message, evaluationErrorExpected.error.message);
        }
    }

    @test @shouldFail
    public arrowFunctionWithDuplicatedParameters(): void
    {
        const parameters = [Expression.identifier("a"), Expression.identifier("a")];
        const body       = Expression.identifier("x");

        chai.assert.throws(() => Expression.arrowFunction(parameters, body), Messages.duplicateParameterNameNotAllowedInThisContext);
    }

    @test @shouldFail
    public arrowFunctionWithInvalidAssignmentPattern(): void
    {
        const parameters    = [Expression.assignmentPattern(Expression.arrayPattern([]), Expression.literal(1))];
        const body          = Expression.identifier("x");
        const arrowFunction = Expression.arrowFunction(parameters, body);

        chai.assert.throws(arrowFunction.evaluate({ }) as () => void, Messages.illegalPropertyInDeclarationContext);
    }
}