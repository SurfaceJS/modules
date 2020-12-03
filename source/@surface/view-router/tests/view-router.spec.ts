
// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import CustomElement, { define, element }      from "@surface/custom-element";
import { inject }                              from "@surface/dependency-injection";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import IMiddleware                             from "../internal/interfaces/middleware";
import IRouteableElement                       from "../internal/interfaces/routeable-element";
import Route                                   from "../internal/types/route";
import RouteConfiguration                      from "../internal/types/route-configuration";
import ViewRouter                              from "../internal/view-router";

@element("home-view", "<router-outlet></router-outlet><router-outlet name='non-default'></router-outlet>")
class HomeView extends CustomElement
{
    public onEnter(): void
    {
        // Coverage
    }

    public onLeave(): void
    {
        // Coverage
    }

    public onUpdate(): void
    {
        // Coverage
    }
}

@define("home-detail-view")
class HomeDetailView extends HTMLElement
{ }

@define("home-other-detail-view")
class HomeOtherDetailView extends HTMLElement
{ }

@element("home-index-view", "<div id='router-outlet' name='non-default'></div>")
class HomeIndexView extends CustomElement implements IRouteableElement
{ }

@define("home-index-detail-view")
class HomeIndexDetailView extends HTMLElement implements IRouteableElement
{ }

@define("data-view")
class DataView extends HTMLElement
{
    @inject(ViewRouter.ROUTE_KEY)
    public route!: Route;
}

@define("about-view")
class AboutView extends HTMLElement
{ }

const template =
    `
        <a #to="'/home'"></a>
        <a #to="'/about'"></a>
        <router-outlet></router-outlet>
    `;

@element("app-root", template)
class AppRoot extends CustomElement
{ }

@suite
export default class ViewRouterSpec
{
    private readonly router!: ViewRouter;

    public constructor()
    {
        const configurations: RouteConfiguration[] =
        [
            {
                children:
                [
                    {
                        components:
                        {
                            "default":     HomeDetailView,
                            "non-default": () => HomeOtherDetailView,
                        },
                        name:       "home-detail",
                        path:       "detail",
                    },
                    {
                        children:
                        [
                            {
                                components: { "non-default": HomeIndexDetailView },
                                path:       "detail",
                                selector:   "#router-outlet",
                            },
                        ],
                        components: { "non-default": { default: HomeIndexView } },
                        name:       "home-index",
                        path:       "index",
                    },
                ],
                component: async () => Promise.resolve({ default: HomeView }),
                name:      "home",
                path:      "/home",
            },
            {
                component: async () => Promise.resolve(DataView),
                name:      "data",
                path:      "/data/{action}/{id:Number}",
            },
            {
                children:
                [
                    {
                        component: HTMLElement,
                        path:      "invalid",
                    },
                ],
                component: AboutView,
                path:      "/about",
            },
            {
                component: AboutView,
                meta:      { requireAuth: true },
                path:      "/forbidden",
            },
        ];

        const middleware: IMiddleware =
        {
            onEnter: (to, _, next) =>
            {
                if (to.meta.requireAuth)
                {
                    next("/home");
                }
            },
        };

        this.router = new ViewRouter("app-root", configurations, { baseUrl: "/base/path", middlewares: [middleware] });

        CustomElement.registerDirective(ViewRouter.createDirectiveRegistry(this.router));

        document.body.appendChild(new AppRoot());
    }

    @test @shouldPass
    public async push(): Promise<void>
    {
        await this.router.pushCurrentLocation();

        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        assert.instanceOf(slot, HTMLElement);

        await this.router.push("/home");

        assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "routerView.firstElementChild instanceOf HomeView");

        await this.router.push("/path1");

        assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test @shouldPass
    public async pushChildrenRoute(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        assert.instanceOf(slot, HTMLElement);

        await this.router.push("/home");

        const homeSlot      = slot.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;
        const homeOtherSlot = slot.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet[name=non-default]")!;

        assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "routerSlot.firstElementChild instanceOf HomeView");
        assert.equal(homeSlot.firstElementChild, null, "homeSlot.firstElementChild equal null");
        assert.equal(homeOtherSlot.firstElementChild, null, "homeOtherSlot.firstElementChild equal null");

        await this.router.push("/home/detail");

        assert.equal(window.location.href, "http://localhost.com/base/path/home/detail", "window.location.href equal 'http://localhost.com/base/path/home/detail'");
        assert.instanceOf(homeSlot.firstElementChild, HomeDetailView, "homeSlot.firstElementChild instanceOf HomeDetailView");
        assert.instanceOf(homeOtherSlot.firstElementChild, HomeOtherDetailView, "homeOtherSlot.firstElementChild instanceOf HomeOtherDetailView");

        await this.router.push("/home/index");

        assert.equal(window.location.href, "http://localhost.com/base/path/home/index", "window.location.href equal 'http://localhost.com/base/path/home/index'");
        assert.equal(homeSlot.firstElementChild, null, "homeSlot.firstElementChild equal null");
        assert.instanceOf(homeOtherSlot.firstElementChild, HomeIndexView, "homeOtherSlot.firstElementChild instanceOf HomeIndexView");

        const nonDefaultSlot = homeOtherSlot.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("#router-outlet[name=non-default]")!;

        await this.router.push("/home/index/detail");

        assert.equal(window.location.href, "http://localhost.com/base/path/home/index/detail", "window.location.href equal 'http://localhost.com/base/path/home/index/detail'");
        assert.instanceOf(nonDefaultSlot.firstElementChild, HomeIndexDetailView, "homeSlot.firstElementChild instanceOf HomeIndexDetailView");
    }

    @test @shouldPass
    public async pushToNamedRoute(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        assert.instanceOf(slot, HTMLElement);

        await this.router.push({ name: "home" });

        assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "route to HomeView");

        await this.router.push({ name: "not-found" });

        assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test @shouldPass
    public async pushToNamedRouteWithParams(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        assert.instanceOf(slot, HTMLElement);

        await this.router.push({ name: "data", parameters: { action: "index", id: 1 } });

        assert.equal(window.location.href, "http://localhost.com/base/path/data/index/1", "window.location.href equal 'http://localhost.com/base/path/data/index/1'");
        assert.instanceOf(slot.firstElementChild, DataView, "slot.firstElementChild to DataView");

        await this.router.push({ name: "data" });

        assert.equal(window.location.href, "http://localhost.com/base/path/data/index/1", "window.location.href equal 'http://localhost.com/base/path/data/index/1'");
        assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test @shouldPass
    public async pushHandledByMiddleware(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        assert.instanceOf(slot, HTMLElement);

        await this.router.push("/forbidden");

        await new Promise(x => window.setTimeout(x));

        assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "slot.firstElementChild to HomeView");
    }

    @test @shouldPass
    public async pushWithInjection(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        assert.instanceOf(slot, HTMLElement);

        await this.router.push("/data/post/1?query=1#hash");

        const dataView = slot.firstElementChild as DataView;

        const expected: Route =
            {
                fullPath:   "/data/post/1?query=1#hash",
                hash:       "hash",
                meta:       { },
                name:       "data",
                parameters: { action: "post", id: 1 },
                path:       "/data/post/1",
                query:      { query: "1" },
            };

        const actual = dataView.route;

        assert.deepEqual(actual, expected);

        await this.router.push("/data/post/2?query=1#hash");

        assert.equal(dataView, slot.firstElementChild, "dataView equal slot.firstElementChild");
        assert.equal(dataView.route, actual, "dataView.routeData equal routeData");
        assert.equal(actual.parameters.id, 2, "routeData.parameters.id equal 2");
    }

    @test @shouldPass
    public async backAndForward(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        assert.instanceOf(slot, HTMLElement);

        // @ts-expect-error
        this.router.history = [];

        await this.router.push("/home");

        assert.instanceOf(slot.firstElementChild, HomeView, "push('/home'): slot.firstElementChild instanceOf HomeView");

        await this.router.push("/about");

        assert.instanceOf(slot.firstElementChild, AboutView, "push('/about'): slot.firstElementChild instanceOf AboutView");

        await this.router.back();

        assert.instanceOf(slot.firstElementChild, HomeView, "back: slot.firstElementChild instanceOf HomeView");

        await this.router.back();

        assert.instanceOf(slot.firstElementChild, HomeView, "back: slot.firstElementChild instanceOf HomeView");

        await this.router.forward();

        assert.instanceOf(slot.firstElementChild, AboutView, "forward: slot.firstElementChild instanceOf AboutView");

        await this.router.forward();

        assert.instanceOf(slot.firstElementChild, AboutView, "forward: slot.firstElementChild instanceOf AboutView");
    }

    @test @shouldPass
    public async routeClick(): Promise<void>
    {
        const anchor = document.body.firstElementChild!.shadowRoot!.querySelectorAll("a");
        const slot   = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        anchor[0].click();

        await new Promise(x => window.setTimeout(x));

        assert.instanceOf(slot.firstElementChild, HomeView, "click #to='/home': slot.firstElementChild instanceOf HomeView");

        anchor[1].click();

        await new Promise(x => window.setTimeout(x));

        assert.instanceOf(slot.firstElementChild, AboutView, "click #to='/about': slot.firstElementChild instanceOf AboutView");
    }

    @test @shouldPass
    public async routeClickNewWindow(): Promise<void>
    {
        const anchor = document.body.firstElementChild!.shadowRoot!.querySelectorAll("a");
        const slot   = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        assert.equal(windows.length, 1);

        anchor[0].click();

        await new Promise(x => window.setTimeout(x));

        assert.instanceOf(slot.firstElementChild, HomeView, "click #to='/home': slot.firstElementChild instanceOf HomeView");

        anchor[0].dispatchEvent(new MouseEvent("click", { ctrlKey: true }));

        await new Promise(x => window.setTimeout(x));

        assert.equal(windows.length, 2);

        assert.instanceOf(slot.firstElementChild, HomeView, "click #to='/home': slot.firstElementChild instanceOf HomeView");
    }

    @test @shouldFail
    public async invalidElement(): Promise<void>
    {
        try
        {
            await this.router.push("/about/invalid");
        }
        catch (error)
        {
            assert.equal((error as Error).message, "Routeable component requires an open shadowRoot");
        }
    }
}