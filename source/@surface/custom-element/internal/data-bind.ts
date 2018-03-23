import { Action, Func } from "@surface/types";
import CustomElement    from "..";
import BindParser       from "./bind-parser";

export default class DataBind<T extends CustomElement>
{
    public constructor(context: T, content: Node)
    {
        this.traverseElement(context, content);
    }

    public static for<T extends CustomElement>(context: T, content: Node): DataBind<T>
    {
        return new DataBind(context, content);
    }

    private async bindAttribute(context: object, node: Node): Promise<void>
    {
        const binders: Array<Action> = [];
        const notify = async () => await Promise.resolve(binders.forEach(x => x()));

        for (const attribute of node.attributes.asEnumerable())
        {
            if (attribute.value.indexOf("{{") > -1)
            {
                const expression = BindParser.scan({ global: window, host: context, this: node }, attribute.value, notify);

                if (attribute.name.startsWith("on-"))
                {
                    node.addEventListener(attribute.name.replace(/^on-/, ""), () => expression.evaluate());
                    attribute.value = "[binding]";
                }
                else
                {
                    if (attribute.name in node)
                    {
                        binders.push(() => node[attribute.name] = expression.evaluate());
                    }

                    binders.push(() => attribute.value = `${expression.evaluate()}`);
                }
            }
        }

        notify();

        await Promise.resolve();
    }

    private async bindTextNode(context: object, node: Node): Promise<void>
    {
        const binders: Array<Func<string>> = [];
        const notify = async () => node.nodeValue = await Promise.resolve(binders.map(x => x()).join(""));

        if (node.nodeValue && node.nodeValue.indexOf("{{") > -1)
        {
            const expression = BindParser.scan({ global: window, host: context, this: node }, node.nodeValue, notify);

            binders.push(() => `${expression.evaluate()}`);
            notify();
        }

        await Promise.resolve();
    }

    private async traverseElement(context: object, node: Node): Promise<void>
    {
        for (const currentNode of Array.from(node.childNodes))
        {
            if (currentNode.attributes && currentNode.attributes.length > 0)
            {
                this.bindAttribute(context, currentNode);
            }

            if (currentNode.nodeType == Node.TEXT_NODE)
            {
                this.bindTextNode(context, currentNode);
            }

            this.traverseElement(context, currentNode);
        }

        await Promise.resolve();
    }
}