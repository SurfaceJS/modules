import { Indexer } from "@surface/core";
import Component   from "./component";

type RouteDefinition =
{
    meta:      Indexer,
    path:      string,
    stack:     Map<string, Component | (() => Component)>[],
    name?:     string,
    selector?: string,
};

export default RouteDefinition;