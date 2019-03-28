import { Indexer, Nullable } from "@surface/core";
import { typeGuard }         from "@surface/core/common/generic";
import ExpressionVisitor     from "@surface/expression/expression-visitor";
import IIdentifierExpression from "@surface/expression/interfaces/identifier-expression";
import ExpressionType        from "../../expression/expression-type";
import IExpression           from "../../expression/interfaces/expression";
import IMemberExpression     from "../../expression/interfaces/member-expression";
import IListener             from "../interfaces/listener";
import IObserver             from "../interfaces/observer";
import ISubscription         from "../interfaces/subscription";
import Observer              from "./observer";
import Reactor               from "./reactor";
import { REACTOR, WRAPPED }  from "./symbols";

type Reactivable = Indexer & { [REACTOR]?: Reactor, [WRAPPED]?: boolean };

export default class ReactiveVisitor extends ExpressionVisitor
{
    private dependency:    Nullable<Reactor>   = null;
    private subscriptions: Array<ISubscription> = [];
    private observers:     Array<IObserver>     = [];

    public constructor(private readonly listener: IListener)
    {
        super();
    }

    protected reactivate(target: Reactivable, key: string): Reactor
    {
        const reactor = Reactor.makeReactive(target, key);

        if (!this.dependency)
        {
            const observer = reactor.getObserver(key) || new Observer();

            this.observers.push(observer);

            this.subscriptions.push(observer.subscribe(this.listener));

            reactor.setObserver(key, observer);
        }
        else
        {
            reactor.setDependency(key, this.dependency);
        }

        return reactor;
    }

    protected visitIdentifierExpression(expression: IIdentifierExpression): IExpression
    {
        this.reactivate(expression.context, expression.name);

        this.dependency = null;

        return super.visitIdentifierExpression(expression);
    }

    protected visitMemberExpression(expression: IMemberExpression): IExpression
    {
        if (expression.key.type == ExpressionType.Constant)
        {
            const target = expression.target.cache;
            const key    = expression.key.cache;

            if (typeGuard<Reactivable>(target, x => x instanceof Object))
            {
                this.dependency = this.reactivate(target, `${key}`);
            }
            else
            {
                throw new Error("Target can't be null or undefined");
            }
        }

        return super.visitMemberExpression(expression);
    }

    protected visit(expression: IExpression): IExpression
    {
        if (expression.type != ExpressionType.Identifier && expression.type != ExpressionType.Member)
        {
            this.dependency = null;
        }

        return super.visit(expression);
    }

    public observe(expression: IExpression): [Array<IObserver>, Array<ISubscription>]
    {
        this.observers     = [];
        this.subscriptions = [];

        this.visit(expression);

        return [this.observers, this.subscriptions];
    }
}