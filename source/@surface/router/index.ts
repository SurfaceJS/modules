import '@surface/collection/extensions';
import { Route }             from './route';
import { List }              from '@surface/collection/list';
import { Enumerable }        from '@surface/enumerable/index';
import { Action1, Nullable, ObjectLiteral } from '@surface/types';

export enum RoutingType
{
    Abstract,
    Hash,
    History
}

export abstract class Router
{
    protected _routeAction: ObjectLiteral<Action1<Nullable<Route.IData>>>;
    protected _routes:      List<Route>;
    
    public constructor(routes: List<Route>)
    {
        this._routeAction = { };
        this._routes      = routes;
    }

    public static create(): Router;
    public static create(routingType:  RoutingType): Router;
    public static create(routingType:  RoutingType, routes:  List<Route>): Router;
    public static create(routingType?: RoutingType, routes?: List<Route>): Router
    {
        routes = routes || new List();

        routingType = routingType || RoutingType.Abstract;

        switch (routingType)
        {
            case RoutingType.Abstract:
            default:
                return new AbstractRouter(routes);
            case RoutingType.Hash:
                return new HashRouter(routes);
            case RoutingType.History:
                return new HistoryRouter(routes);
        }
    }

    public mapRoute(name: string, pattern: string, isDefault?: boolean): Router
    {
        this._routes.add(new Route(name, pattern, !!isDefault));
        return this;
    }

    public match(path: string): Nullable<Route.IData>
    {
        let routes = this._routes as Enumerable<Route>;

        if (path == '/')
        {
            routes = routes.where(x => x.isDefault);
        }

        let routeData = this._routes.select(x => x.match(path)).firstOrDefault(x => !!x);

        let action = this._routeAction[path] || this._routeAction['*'];
        
        if (action)
        {
            action(routeData);
        }

        return routeData;
    }

    public when(route: string, action: Action1<Nullable<Route.IData>>): Router
    {
        this._routeAction[route] = action;
        return this;
    }
}

class AbstractRouter extends Router
{ }

class HashRouter extends Router
{ }

class HistoryRouter extends Router
{
    public constructor(routes: List<Route>)
    {
        super(routes);
        window.onpopstate = () => window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
}