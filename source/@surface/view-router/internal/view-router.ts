import { Stack }                                   from "@surface/collection";
import { Constructor, Lazy, assertGet, typeGuard } from "@surface/core";
import { DirectiveHandlerRegistry }                from "@surface/custom-element/internal/types";
import Container                                   from "@surface/dependency-injection";
import { RouteData }                               from "@surface/router";
import Router                                      from "@surface/router/internal/router";
import IMiddleware                                 from "./interfaces/middleware";
import IRouteableElement                           from "./interfaces/routeable-element";
import Metadata                                    from "./metadata";
import NavigationDirectiveHandler                  from "./navigation-directive-handler";
import RouteConfigurator                           from "./route-configurator";
import Component                                   from "./types/component";
import Module                                      from "./types/module";
import Location                                    from "./types/named-route";
import Route                                       from "./types/route";
import RouteConfiguration                          from "./types/route-configuration";
import RouteDefinition                             from "./types/route-definition";
import ViewRouterOptions                           from "./types/view-router-options";

export default class ViewRouter
{
    public static readonly ROUTE_KEY: symbol = Symbol("view-router:route-data-key");

    private readonly baseUrl:           string;
    private readonly baseUrlPattern:    RegExp;
    private readonly cache:             Record<string, IRouteableElement>[] = [];
    private readonly connectedElements: Stack<IRouteableElement> = new Stack();
    private readonly container:         Container;
    private readonly history:           [RouteDefinition, RouteData][] = [];
    private readonly middlewares:       IMiddleware[];
    private readonly root:              Lazy<HTMLElement>;
    private readonly router:            Router<[RouteDefinition, RouteData]> = new Router();

    private index: number  = 0;
    private current?: { definition: RouteDefinition, routeData: RouteData, route: Route };

    public constructor(root: string, routes: RouteConfiguration[], options: ViewRouterOptions = { })
    {
        this.root = new Lazy(() => assertGet(document.querySelector<HTMLElement>(root), `Cannot find root element using selector: ${root}`));

        this.baseUrl        = options.baseUrl ? (options.baseUrl.startsWith("/") ? "" : "/") + options.baseUrl.replace(/\/$/, "") : "";
        this.baseUrlPattern = new RegExp(`^${this.baseUrl.replace(/\//g, "\\/")}`);
        this.container      = options.container   ?? new Container();
        this.middlewares    = options.middlewares ?? [];

        for (const definition of RouteConfigurator.configure(routes))
        {
            if (definition.name)
            {
                this.router.map(definition.name, definition.path, routeData => [definition, routeData]);
            }
            else
            {
                this.router.map(definition.path, routeData => [definition, routeData]);
            }
        }
    }

    public static createDirectiveRegistry(router: ViewRouter): DirectiveHandlerRegistry
    {
        return { handler: (...args) => new NavigationDirectiveHandler(router, ...args), name: "to" };
    }

    private connectToOutlet(parent: HTMLElement, element: IRouteableElement, key: string, to: Route, from?: Route, outletTag = "router-outlet"): void
    {
        const outlets = Metadata.from(parent).outlets;

        let outlet = outlets.get(key) ?? null;

        if (!outlet)
        {
            if (!parent.shadowRoot)
            {
                throw new Error("Routeable component requires an open shadowRoot");
            }

            outlet = parent.shadowRoot.querySelector<HTMLElement>(key == "default" ? `${outletTag}:not([name])` : `${outletTag}[name=${key}]`);
        }

        // istanbul ignore else
        if (outlet)
        {
            outlets.set(key, outlet);

            element.onEnter?.(to, from);

            const oldElement = outlet.firstElementChild as IRouteableElement | null;

            if (oldElement)
            {
                oldElement.onLeave?.(to, from);

                oldElement.dispose?.();

                outlet.replaceChild(element, oldElement);
            }
            else
            {
                outlet.appendChild(element);
            }

            this.connectedElements.push(element);
        }
        else
        {
            throw new Error(`Cannot find outlet ${key == "default" ? `<${outletTag}>` : `<${outletTag} name="${key}">`}`);
        }
    }

    private async create(definition: RouteDefinition, routeData: RouteData, useHistory: boolean = false): Promise<void>
    {
        const to   = this.createRoute(definition, routeData);
        const from = this.current ? this.createRoute(this.current.definition, this.current.routeData) : undefined;

        if (!this.invokeMiddleware(to, from))
        {
            const hasUpdate = definition == this.current?.definition;

            let parent = this.root.value as IRouteableElement;

            for (let index = 0; index < definition.stack.length; index++)
            {
                const entry = definition.stack[index];

                const keys = new Set(entry.keys());

                this.disconnectFromOutlets(parent, keys, to, from);

                if (entry == this.current?.definition?.stack[index])
                {
                    const next = this.cache[index].default ?? this.cache[index][keys.values().next().value];

                    if (hasUpdate)
                    {
                        next.onUpdate?.(to, from);
                    }
                    else
                    {
                        next.onEnter?.(to, from);
                    }

                    parent = next!;
                }
                else
                {
                    let next: HTMLElement | undefined;

                    this.cache[index] = { };

                    for (const [key, component] of entry)
                    {
                        const constructor = await this.resolveComponent(component);

                        const element = Container.merge(this.container, new Container().registerSingleton(ViewRouter.ROUTE_KEY, to))
                            .inject(constructor) as IRouteableElement;

                        this.cache[index][key] = element;

                        this.connectToOutlet(parent, element, key, to, from, definition.selector);

                        if (!next || key == "default")
                        {
                            next = element;
                        }
                    }

                    parent = next!;
                }
            }

            if (this.current && this.current.route != to)
            {
                Object.assign(this.current.route, to);
            }

            if (!useHistory)
            {
                this.history.push([definition, routeData]);

                this.index = this.history.length - 1;
            }

            this.current = { definition, route: to, routeData };
        }
    }

    private createRoute(definition: RouteDefinition, routeData: RouteData): Route
    {
        return {
            fullPath: routeData.toString(),
            meta:     definition.meta,
            name:     definition.name,
            ...routeData,
        };
    }

    private disconnectElements(): void
    {
        this.connectedElements.forEach(x => (x.dispose?.(), x.remove()));

        this.current = undefined;
    }

    private disconnectFromOutlets(parent: HTMLElement, exclude: Set<string>, to: Route, from?: Route): void
    {
        const outlets = Metadata.from(parent).outlets;

        for (const outlet of outlets.values())
        {
            if (!exclude.has(outlet.getAttribute("name") ?? "default"))
            {
                const instance = outlet.firstElementChild;

                if (typeGuard<IRouteableElement>(instance, !!instance))
                {
                    instance.onLeave?.(to, from);

                    instance.dispose?.();

                    instance.remove();
                }
            }
        }
    }

    private resolveModule(module: Constructor<HTMLElement> | Module<Constructor<HTMLElement>>): Constructor<HTMLElement>
    {
        return "default" in module ? module.default : module;
    }

    private async resolveComponent(component: Component | (() => Component)): Promise<Constructor<HTMLElement>>
    {
        if (typeof component == "function")
        {
            if (typeGuard<() => Component>(component, !component.prototype))
            {
                return this.resolveComponent(component());
            }
        }
        else if (component instanceof Promise)
        {
            return this.resolveModule(await component);
        }

        return this.resolveModule(component);
    }

    private invokeMiddleware(to: Route, from?: Route): boolean
    {
        let handled = false;

        const next = (location: string | Location): boolean =>
            (this.push(location), handled = true);

        for (const middleware of this.middlewares)
        {
            middleware.onEnter?.(to, from, next);

            if (handled)
            {
                break;
            }
        }

        return handled;
    }

    public async back(): Promise<void>
    {
        await this.go(-1);
    }

    public async forward(): Promise<void>
    {
        await this.go(1);
    }

    public async go(value: number): Promise<void>
    {
        const index = Math.min(Math.max(this.index + value, 0), this.history.length - 1);

        if (index != this.index)
        {
            const [routeItem, routeData] = this.history[index];

            await this.create(routeItem, routeData, true);

            this.index = index;
        }
    }

    public async push(route: string | Location): Promise<void>
    {
        if (typeof route == "string")
        {
            const match = this.router.match(route);

            if (match.matched)
            {
                await this.create(...match.value);

                window.history.pushState(null, "", this.baseUrl + route);
            }
            else
            {
                this.disconnectElements();
            }
        }
        else
        {
            const match = this.router.match(route.name, route.parameters ?? { });

            if (match.matched)
            {
                const [routeConfig, _routeData] = match.value;

                const routeData = new RouteData(_routeData.path, _routeData.parameters, route.query, route.hash);

                await this.create(routeConfig, routeData);

                window.history.pushState(null, "", this.baseUrl + routeData.toString());
            }
            else
            {
                this.disconnectElements();
            }
        }
    }

    public async pushCurrentLocation(): Promise<void>
    {
        const path = this.baseUrl ? window.location.pathname.replace(this.baseUrlPattern, "") : window.location.pathname;

        await this.push(path + window.location.search + window.location.hash);
    }
}