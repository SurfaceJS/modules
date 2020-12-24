import type { Indexer } from "@surface/core";
import type RouteMatch  from "../internal/types/route-match";

export type RouteValidExpectation =
    {
        expected: RouteMatch,
        pattern:  string,
        value:    string | Indexer,
    };

export type RouteInvalidExpectation =
    {
        error:   Error,
        pattern: string,
        value:   string | Indexer,
    };

export const routeValidExpectations: RouteValidExpectation[] =
    [
        {
            expected: { matched: false, reason: "Pattern don't match" },
            pattern:  "/path",
            value:    "",
        },
        // {
        //     expected:
        //     {
        //         matched:   true,
        //         routeData:
        //         {
        //             parameters: { },
        //             path:       "/",
        //         },
        //     },
        //     pattern: "",
        //     value:   "?",
        // },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { },
                    path:       "/path",
                },
            },
            pattern: "/path",
            value:   "/path",
        },
        // {
        //     expected:
        //     {
        //         matched:   true,
        //         routeData:
        //         {
        //             parameters: { },
        //             path:       "/path",
        //         },
        //     },
        //     pattern: "/path",
        //     value:   "/path#example",
        // },
        // {
        //     expected:
        //     {
        //         matched:   true,
        //         routeData:
        //         {
        //             parameters: { },
        //             path:       "/path",
        //         },
        //     },
        //     pattern: "/path",
        //     value:   "/path?value1=1&value2=2",
        // },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { },
                    path:       "/path-path",
                },
            },
            pattern: "/path*",
            value:   "/path-path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { },
                    path:       "/pathpathpath/path",
                },
            },
            pattern: "/path*path/path",
            value:   "/pathpathpath/path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: "path" },
                    path:       "/path",
                },
            },
            pattern: "/{value}",
            value:   "/path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: "path" },
                    path:       "/path-path",
                },
            },
            pattern: "/{value}-path",
            value:   "/path-path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: "path" },
                    path:       "/pathpathpath/path",
                },
            },
            pattern: "/path{value}path/path",
            value:   "/pathpathpath/path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "path", value2: "path", value3: "path" },
                    path:       "/pathpathpathpathpathpathpathpath/path",
                },
            },
            pattern: "/path{value1}pathpath{value2}pathpath{value3}/path",
            value:   "/pathpathpathpathpathpathpathpath/path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "home", value2: "index" },
                    path:       "/path/home/index",
                },
            },
            pattern: "path/{value1}/{value2}",
            value:   "path/home/index",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "home" },
                    path:       "/path/home",
                },
            },
            pattern: "path/{value1}/{value2?}",
            value:   "path/home",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { },
                    path:       "/path",
                },
            },
            pattern: "path/{value1?}/{value2?}",
            value:   "path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "home", value2: "index" },
                    path:       "/path/home",
                },
            },
            pattern: "path/{value1}/{value2=index}",
            value:   "path/home",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "home", value2: "index" },
                    path:       "/path",
                },
            },
            pattern: "path/{value1=home}/{value2=index}",
            value:   "path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "home", value2: "index" },
                    path:       "/path/index",
                },
            },
            pattern: "path/{value1=home}/{value2}",
            value:   "path/index",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "home", value2: "index" },
                    path:       "/path/path",
                },
            },
            pattern: "path/path{value1=home}/{value2=index}",
            value:   "path/path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "home", value2: "index" },
                    path:       "/path/pathpath",
                },
            },
            pattern: "path/path{value1=home}path/{value2=index}",
            value:   "path/pathpath",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "home", value2: "index" },
                    path:       "/path/pathpath",
                },
            },
            pattern: "path/path{value1=home}path/{value2=index}",
            value:   "path/pathpath",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: ["path", "path"] },
                    path:       "/path/path.path",
                },
            },
            pattern: "path/{value:transformer}",
            value:   "path/path.path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: ["path", "path", "path"] },
                    path:       "/path/path.path.path",
                },
            },
            pattern: "path/{value:transformer=path.path}",
            value:   "path/path.path.path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: ["path", "path"] },
                    path:       "/path",
                },
            },
            pattern: "path/{value:transformer=path.path}",
            value:   "path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { },
                    path:       "/path",
                },
            },
            pattern: "path/{value:transformer?}",
            value:   "path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: "" },
                    path:       "/path",
                },
            },
            pattern:  "path/{*value}",
            value:    "path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: "path/path/path/path" },
                    path:       "/path/path/path/path/path",
                },
            },
            pattern:  "path/{*value}",
            value:    "path/path/path/path/path",
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: "path/path/path" },
                    path:       "/path/path/path/path/path",
                },
            },
            pattern:  "path/{*value}/path",
            value:    "path/path/path/path/path",
        },
        {
            expected: { matched: false, reason: "Missing required parameters: value1, value2" },
            pattern:  "/path/{value1}/{value2:transformer}",
            value:        { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: "path" },
                    path:       "/path/path",
                },
            },
            pattern: "path/{value}",
            value:    { value: "path" },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "path", value2: "path", value3: "path" },
                    path:       "/path/path-path/path",
                },
            },
            pattern: "path/{value1}-{value2}/{value3}",
            value:    { value1: "path", value2: "path", value3: "path" },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { },
                    path:       "/path",
                },
            },
            pattern: "path/{value?}",
            value:    { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { },
                    path:       "/path/-",
                },
            },
            pattern: "path/{value1?}-{value2?}/{value?}",
            value:    { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "value1" },
                    path:       "/path",
                },
            },
            pattern: "path/{value1=value1}",
            value:   { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "value2" },
                    path:       "/path/value2",
                },
            },
            pattern: "path/{value1=value1}",
            value:   { value1: "value2" },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "value1", value2: "value2", value3: "value3" },
                    path:       "/path/-",
                },
            },
            pattern: "path/{value1=value1}-{value2=value2}/{value3=value3}",
            value:   { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: ["path", "path"] },
                    path:       "/path/path.path",
                },
            },
            pattern: "path/{value:transformer}",
            value:   { value: ["path", "path"] },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: ["path", "path"], value2: ["path", "path"], value3: ["path", "path"] },
                    path:       "/path/path.path-path.path/path.path",
                },
            },
            pattern: "path/{value1:transformer}-{value2:transformer}/{value3:transformer}",
            value:   { value1: ["path", "path"], value2: ["path", "path"], value3: ["path", "path"] },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { },
                    path:       "/path",
                },
            },
            pattern: "path/{value:transformer?}",
            value:   { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { },
                    path:       "/path/-",
                },
            },
            pattern: "path/{value1:transformer?}-{value2:transformer?}/{value3:transformer?}",
            value:   { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: ["path", "path"] },
                    path:       "/path",
                },
            },
            pattern: "path/{value:transformer=path.path}",
            value:   { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: ["path"] },
                    path:       "/path",
                },
            },
            pattern: "path/{value:transformer=path}",
            value:   { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: ["path", "path"], value2: ["path", "path"], value3: ["path", "path"] },
                    path:       "/path/-",
                },
            },
            pattern: "path/{value1:transformer=path.path}-{value2:transformer=path.path}/{value3:transformer=path.path}",
            value:   { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value: "" },
                    path:       "/path",
                },
            },
            pattern: "path/{*value}",
            value:   { },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "path", value2: "path", value3: "path" },
                    path:       "/path/path-path/path",
                },
            },
            pattern: "path/{*value1}-{*value2}/{*value3}",
            value:   { value1: "path", value2: "path", value3: "path" },
        },
        {
            expected:
            {
                matched:   true,
                routeData:
                {
                    parameters: { value1: "", value2: "", value3: "" },
                    path:       "/path/-",
                },
            },
            pattern: "path/{*value1}-{*value2}/{*value3}",
            value:   { },
        },
    ];

export const routeInvalidExpectations: RouteInvalidExpectation[] =
    [
        {
            error:   new Error("Unregistred transformer Foo"),
            pattern: "/path/{value:Foo}",
            value:   "/path/path",
        },
        {
            error:   new Error("Unregistred transformer Foo"),
            pattern: "/path/{value:Foo}",
            value:   { },
        },
        {
            error:   new Error("Found duplicated key value"),
            pattern: "/path/{value}/{value}",
            value:   "/path/path",
        },
    ];