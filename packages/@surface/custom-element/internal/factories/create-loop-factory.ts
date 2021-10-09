import type { ObservablePath, StackTrace } from "@surface/custom-element-parser";
import Block                               from "../directives/block.js";
import LoopDirective                       from "../directives/loop-directive.js";
import type Activator                      from "../types/activator";
import type DestructuredEvaluator          from "../types/destructured-evaluator.js";
import type Evaluator                      from "../types/evaluator";
import type NodeFactory                    from "../types/node-factory";

export default function createLoopFactory(leftEvaluator: DestructuredEvaluator, operator: "in" | "of", rightEvaluator: Evaluator, observables: ObservablePath[], factory: NodeFactory, source?: string, stackTrace?: StackTrace): NodeFactory
{
    return () =>
    {
        const fragment = document.createDocumentFragment();

        const block = new Block();

        block.connect(fragment);

        const activator: Activator = (parent, host, scope, directives) =>
        {
            const context =
            {
                block,
                directives,
                factory,
                host,
                left:  leftEvaluator,
                observables,
                operator,
                parent,
                right: rightEvaluator,
                scope,
                source,
                stackTrace,
            };

            return new LoopDirective(context);
        };

        return [fragment, activator];
    };
}
