import type { IExpression, IPattern } from "@surface/expression";
import type IDescribeable             from "../interfaces/describeable";
import type IObservable               from "../interfaces/observable";
import type ITraceable                from "../interfaces/traceable";

type LoopDirectiveDescriptor =
{
    left:     IPattern,
    operator: "in" | "of",
    right:    IExpression,
} & IDescribeable & IObservable & ITraceable;

export default LoopDirectiveDescriptor;