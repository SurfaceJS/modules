import { List }       from "@surface/collection/list";
import { Enumerable } from "@surface/enumerable";

declare global
{
    // tslint:disable-next-line:interface-name
    interface NodeList
    {
        /** Casts NodeList into Array<Node> */
        toArray(): Array<Node>;
        /** Cast NodeList into Enumerable<Node> */
        asEnumerable(): Enumerable<Node>;
        /** Cast NodeList into List<Node> */
        toList(): List<Node>;
    }

    // tslint:disable-next-line:interface-name
    interface NamedNodeMap
    {
        asEnumerable(): Enumerable<Attr>;
    }
}

NodeList.prototype.toArray = NodeList.prototype.toArray || function toArray<T extends Node>(this: NodeListOf<T>)
{
    return Array.from(this);
};

NodeList.prototype.asEnumerable = NodeList.prototype.asEnumerable || function asEnumerable<T extends Node>(this: NodeListOf<T>)
{
    return Array.from(this).asEnumerable();
};

NodeList.prototype.toList = NodeList.prototype.toList || function toList<T extends Node>(this: NodeListOf<T>)
{
    return Array.from(this).toList();
};

NamedNodeMap.prototype.asEnumerable = NamedNodeMap.prototype.asEnumerable || function asEnumerable(this: NamedNodeMap)
{
    return Array.from(this).asEnumerable();
};