import type { Constructor }    from "@surface/core";
import type Container          from "@surface/dependency-injection";
import type IRouterInterceptor from "../interfaces/router-interceptor";
import type RouteConfiguration from "./route-configuration";

type WebRouterOptions =
{
    root:          string,
    routes:        RouteConfiguration[],
    interceptors?: (Constructor<IRouterInterceptor> | IRouterInterceptor)[],
    container?:    Container,
    baseUrl?:      string,
};

export default WebRouterOptions;
