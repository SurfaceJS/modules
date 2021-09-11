/* eslint-disable max-len */
/* eslint-disable max-lines-per-function */
// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom.js";

import type { Delegate }                                                 from "@surface/core";
import { resolveError }                                                  from "@surface/core";
import type { IIdentifier, IMemberExpression }                           from "@surface/expression";
import { shouldFail, shouldPass, suite, test }                           from "@surface/test-suite";
import chai                                                              from "chai";
import TemplateParseError                                                from "../internal/errors/template-parse-error.js";
import { parseDestructuredPattern, parseExpression, parseInterpolation } from "../internal/parsers/expression-parsers.js";
import TemplateParser                                                    from "../internal/parsers/template-parser.js";
import type TemplateDescriptor                                           from "../internal/types/template-descriptor-legacy";

TemplateParser.testEnviroment = true;

type RawError = { message: string } | Pick<TemplateParseError, "message" | "stack">;

function tryAction(action: Delegate): RawError
{
    try
    {
        action();
    }
    catch (error)
    {
        return toRaw(resolveError(error));
    }

    return toRaw(new TemplateParseError("", ""));
}

function toRaw(error: Error): RawError
{
    if (error instanceof TemplateParseError)
    {
        return {
            message: error.message,
            stack:   error.stack,
        };
    }

    return { message: error.message };
}

@suite
export default class TemplateParserSpec
{
    @shouldPass @test
    public analyze(): void
    {
        const template = document.createElement("template");

        template.innerHTML =
        [
            "<span value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">Some {'interpolation'} here</span>",
            "<span #inject>Empty</span>",
            "<span #inject:title=\"{ title }\"><h1>{title}</h1></span>",
            "<span #inject=\"{ title }\" #inject-key=\"host.dynamicInjectKey\"><h1>{title}</h1></span>",
            "<hr>",
            "<span #if=\"host.status == 1\">Active</span>",
            "<span #else-if=\"host.status == 2\">Waiting</span>",
            "<span #else>Suspended</span>",
            "<span #placeholder>Default Empty</span>",
            "<span #placeholder:value=\"{ name: host.name }\">Default {name}</span>",
            "<span #placeholder=\"{ name: host.name }\" #placeholder-key=\"host.dynamicPlaceholderKey\">Default {name}</span>",
            "<table>",
            "<tr>",
            "<th>Id</th>",
            "<th>Name</th>",
            "<th>Status</th>",
            "</tr>",
            "<tr onclick=\"fn({ clicked }\" #for=\"const item of host.items\">",
            "<td>{item.id}</td>",
            "<td>{item.name}</td>",
            "<td>{item.status}</td>",
            "</tr>",
            "</table>",
            "<hr>",
            "<span>{host.footer}</span>",
            "<!---->",
        ].join("");

        const expected: TemplateDescriptor =
        {
            directives:
            {
                injections:
                [
                    {
                        descriptor:
                        {
                            directives:
                            {
                                injections:   [],
                                logicals:     [],
                                loops:        [],
                                placeholders: [],
                            },
                            elements: [],
                            lookup:   [],
                        },
                        keyExpression:    parseExpression("'default'"),
                        keyObservables:   [],
                        observables:      [],
                        path:             "1",
                        pattern:          parseDestructuredPattern("{ }"),
                        rawExpression:    "#inject",
                        rawKeyExpression: "",
                        stackTrace:
                        [
                            ["<x-component>"],
                            ["#shadow-root"],
                            ["...1 other(s) node(s)", "<span #inject>"],
                        ],
                    },
                    {
                        descriptor:
                        {
                            directives:
                            {
                                injections:   [],
                                logicals:     [],
                                loops:        [],
                                placeholders: [],
                            },
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    events:     [],
                                    path:       "0-0",
                                    textNodes:
                                    [
                                        {
                                            expression:    parseInterpolation("{title}"),
                                            observables:   [],
                                            path:          "0-0-0",
                                            rawExpression: "{title}",
                                            stackTrace:
                                            [
                                                ["<x-component>"],
                                                ["#shadow-root"],
                                                ["...2 other(s) node(s)", "<span #inject:title=\"{ title }\">"],
                                                ["<h1>"],
                                                ["{title}"],
                                            ],
                                        },
                                    ],
                                },
                            ],
                            lookup: [[0, 0], [0, 0, 0]],
                        },
                        keyExpression:    parseExpression("'title'"),
                        keyObservables:   [],
                        observables:      [],
                        path:             "2",
                        pattern:          parseDestructuredPattern("{ title }"),
                        rawExpression:    "#inject:title=\"{ title }\"",
                        rawKeyExpression: "",
                        stackTrace:
                        [
                            ["<x-component>"],
                            ["#shadow-root"],
                            ["...2 other(s) node(s)", "<span #inject:title=\"{ title }\">"],
                        ],
                    },
                    {
                        descriptor:
                        {
                            directives:
                            {
                                injections:   [],
                                logicals:     [],
                                loops:        [],
                                placeholders: [],
                            },
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    events:     [],
                                    path:       "0-0",
                                    textNodes:
                                    [
                                        {
                                            expression:    parseInterpolation("{title}"),
                                            observables:   [],
                                            path:          "0-0-0",
                                            rawExpression: "{title}",
                                            stackTrace:
                                            [
                                                ["<x-component>"],
                                                ["#shadow-root"],
                                                ["...3 other(s) node(s)", "<span #inject=\"{ title }\" #inject-key=\"host.dynamicInjectKey\">"],
                                                ["<h1>"],
                                                ["{title}"],
                                            ],
                                        },
                                    ],
                                },
                            ],
                            lookup: [[0, 0], [0, 0, 0]],
                        },
                        keyExpression:    parseExpression("host.dynamicInjectKey"),
                        keyObservables:   [["host", "dynamicInjectKey"]],
                        observables:      [],
                        path:             "3",
                        pattern:          parseDestructuredPattern("{ title }"),
                        rawExpression:    "#inject=\"{ title }\"",
                        rawKeyExpression: "#inject-key=\"host.dynamicInjectKey\"",
                        stackTrace:
                        [
                            ["<x-component>"],
                            ["#shadow-root"],
                            ["...3 other(s) node(s)", "<span #inject=\"{ title }\" #inject-key=\"host.dynamicInjectKey\">"],
                        ],
                    },
                ],
                logicals:
                [
                    {
                        branches:
                        [
                            {
                                descriptor:
                                {
                                    directives:
                                    {
                                        injections:   [],
                                        logicals:     [],
                                        loops:        [],
                                        placeholders: [],
                                    },
                                    elements: [],
                                    lookup:   [],
                                },
                                expression:    parseExpression("host.status == 1"),
                                observables:   [["host", "status"]],
                                path:          "5",
                                rawExpression: "#if=\"host.status == 1\"",
                                stackTrace:
                                [
                                    ["<x-component>"],
                                    ["#shadow-root"],
                                    ["...5 other(s) node(s)", "<span #if=\"host.status == 1\">"],
                                ],
                            },
                            {
                                descriptor:
                                {
                                    directives:
                                    {
                                        injections:   [],
                                        logicals:     [],
                                        loops:        [],
                                        placeholders: [],
                                    },
                                    elements: [],
                                    lookup:   [],
                                },
                                expression:    parseExpression("host.status == 2"),
                                observables:   [["host", "status"]],
                                path:          "6",
                                rawExpression: "#else-if=\"host.status == 2\"",
                                stackTrace:
                                [
                                    ["<x-component>"],
                                    ["#shadow-root"],
                                    ["...6 other(s) node(s)", "<span #else-if=\"host.status == 2\">"],
                                ],
                            },
                            {
                                descriptor:
                                {
                                    directives:
                                    {
                                        injections:   [],
                                        logicals:     [],
                                        loops:        [],
                                        placeholders: [],
                                    },
                                    elements: [],
                                    lookup:   [],
                                },
                                expression:    parseExpression("true"),
                                observables:   [],
                                path:          "7",
                                rawExpression: "#else",
                                stackTrace:
                                [
                                    ["<x-component>"],
                                    ["#shadow-root"],
                                    ["...7 other(s) node(s)", "<span #else>"],
                                ],
                            },
                        ],
                    },
                ],
                loops:
                [
                    {
                        descriptor:
                        {
                            directives:
                            {
                                injections:   [],
                                logicals:     [],
                                loops:        [],
                                placeholders: [],
                            },
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    events:     [],
                                    path:       "0-0",
                                    textNodes:
                                    [
                                        {
                                            expression:    parseInterpolation("{item.id}"),
                                            observables:   [["item", "id"]],
                                            path:          "0-0-0",
                                            rawExpression: "{item.id}",
                                            stackTrace:
                                            [
                                                ["<x-component>"],
                                                ["#shadow-root"],
                                                ["...11 other(s) node(s)", "<table>"],
                                                ["<tbody>"],
                                                ["...1 other(s) node(s)", "<tr onclick=\"fn({ clicked }\" #for=\"const item of host.items\">"],
                                                ["<td>"],
                                                ["{item.id}"],
                                            ],
                                        },
                                    ],
                                },
                                {
                                    attributes: [],
                                    directives: [],
                                    events:     [],
                                    path:       "0-1",
                                    textNodes:
                                    [
                                        {
                                            expression:    parseInterpolation("{item.name}"),
                                            observables:   [["item", "name"]],
                                            path:          "0-1-0",
                                            rawExpression: "{item.name}",
                                            stackTrace:
                                            [
                                                ["<x-component>"],
                                                ["#shadow-root"],
                                                ["...11 other(s) node(s)", "<table>"],
                                                ["<tbody>"],
                                                ["...1 other(s) node(s)", "<tr onclick=\"fn({ clicked }\" #for=\"const item of host.items\">"],
                                                ["...1 other(s) node(s)", "<td>"],
                                                ["{item.name}"],
                                            ],
                                        },
                                    ],
                                },
                                {
                                    attributes: [],
                                    directives: [],
                                    events:     [],
                                    path:       "0-2",
                                    textNodes:
                                    [
                                        {
                                            expression:    parseInterpolation("{item.status}"),
                                            observables:   [["item", "status"]],
                                            path:          "0-2-0",
                                            rawExpression: "{item.status}",
                                            stackTrace:
                                            [
                                                ["<x-component>"],
                                                ["#shadow-root"],
                                                ["...11 other(s) node(s)", "<table>"],
                                                ["<tbody>"],
                                                ["...1 other(s) node(s)", "<tr onclick=\"fn({ clicked }\" #for=\"const item of host.items\">"],
                                                ["...2 other(s) node(s)", "<td>"],
                                                ["{item.status}"],
                                            ],
                                        },
                                    ],
                                },
                            ],
                            lookup: [[0, 0], [0, 0, 0], [0, 1], [0, 1, 0], [0, 2], [0, 2, 0]],
                        },
                        left:          parseExpression("item") as IIdentifier,
                        observables:   [["host", "items"]],
                        operator:      "of",
                        path:          "11-0-1",
                        rawExpression: "#for=\"const item of host.items\"",
                        right:         parseExpression("host.items"),
                        stackTrace:
                        [
                            ["<x-component>"],
                            ["#shadow-root"],
                            ["...11 other(s) node(s)", "<table>"],
                            ["<tbody>"],
                            ["...1 other(s) node(s)", "<tr onclick=\"fn({ clicked }\" #for=\"const item of host.items\">"],
                        ],
                    },
                ],
                placeholders:
                [
                    {
                        descriptor:
                        {
                            directives:
                            {
                                injections:   [],
                                logicals:     [],
                                loops:        [],
                                placeholders: [],
                            },
                            elements: [],
                            lookup:   [],
                        },
                        expression:       parseExpression("undefined"),
                        keyExpression:    parseExpression("'default'"),
                        keyObservables:   [],
                        observables:      [],
                        path:             "8",
                        rawExpression:    "#placeholder",
                        rawKeyExpression: "",
                        stackTrace:
                        [
                            ["<x-component>"],
                            ["#shadow-root"],
                            ["...8 other(s) node(s)", "<span #placeholder>"],
                        ],
                    },
                    {
                        descriptor:
                        {
                            directives:
                            {
                                injections:   [],
                                logicals:     [],
                                loops:        [],
                                placeholders: [],
                            },
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    events:     [],
                                    path:       "0",
                                    textNodes:
                                    [
                                        {
                                            expression:    parseInterpolation("Default {name}"),
                                            observables:   [],
                                            path:          "0-0",
                                            rawExpression: "Default {name}",
                                            stackTrace:
                                            [
                                                ["<x-component>"],
                                                ["#shadow-root"],
                                                ["...9 other(s) node(s)", "<span #placeholder:value=\"{ name: host.name }\">"],
                                                ["Default {name}"],
                                            ],
                                        },
                                    ],
                                },
                            ],
                            lookup: [[0], [0, 0]],
                        },
                        expression:       parseExpression("{ name: host.name }"),
                        keyExpression:    parseExpression("'value'"),
                        keyObservables:   [],
                        observables:      [["host", "name"]],
                        path:             "9",
                        rawExpression:    "#placeholder:value=\"{ name: host.name }\"",
                        rawKeyExpression: "",
                        stackTrace:
                        [
                            ["<x-component>"],
                            ["#shadow-root"],
                            ["...9 other(s) node(s)", "<span #placeholder:value=\"{ name: host.name }\">"],
                        ],
                    },
                    {
                        descriptor:
                        {
                            directives:
                            {
                                injections:   [],
                                logicals:     [],
                                loops:        [],
                                placeholders: [],
                            },
                            elements:
                            [
                                {
                                    attributes: [],
                                    directives: [],
                                    events:     [],
                                    path:       "0",
                                    textNodes:
                                    [
                                        {
                                            expression:    parseInterpolation("Default {name}"),
                                            observables:   [],
                                            path:          "0-0",
                                            rawExpression: "Default {name}",
                                            stackTrace:
                                            [
                                                ["<x-component>"],
                                                ["#shadow-root"],
                                                ["...10 other(s) node(s)", "<span #placeholder=\"{ name: host.name }\" #placeholder-key=\"host.dynamicPlaceholderKey\">"],
                                                ["Default {name}"],
                                            ],
                                        },
                                    ],
                                },
                            ],
                            lookup: [[0], [0, 0]],
                        },
                        expression:       parseExpression("{ name: host.name }"),
                        keyExpression:    parseExpression("host.dynamicPlaceholderKey"),
                        keyObservables:   [["host", "dynamicPlaceholderKey"]],
                        observables:      [["host", "name"]],
                        path:             "10",
                        rawExpression:    "#placeholder=\"{ name: host.name }\"",
                        rawKeyExpression: "#placeholder-key=\"host.dynamicPlaceholderKey\"",
                        stackTrace:
                        [
                            ["<x-component>"],
                            ["#shadow-root"],
                            ["...10 other(s) node(s)", "<span #placeholder=\"{ name: host.name }\" #placeholder-key=\"host.dynamicPlaceholderKey\">"],
                        ],
                    },
                ],
            },
            elements:
            [
                {
                    attributes:
                    [
                        {
                            expression:    parseInterpolation("Hello {host.name}"),
                            key:           "value",
                            name:          "value",
                            observables:   [["host", "name"]],
                            rawExpression: "value=\"Hello {host.name}\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                            ],
                            type: "interpolation",
                        },
                        {
                            expression:    parseExpression("host.value"),
                            key:           "valueA",
                            name:          "value-a",
                            observables:   [["host", "value"]],
                            rawExpression: "::value-a=\"host.value\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                            ],
                            type: "twoway",
                        },
                        {
                            expression:    parseExpression("host.x + host.y"),
                            key:           "valueB",
                            name:          "value-b",
                            observables:   [["host", "x"], ["host", "y"]],
                            rawExpression: ":value-b=\"host.x + host.y\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                            ],
                            type: "oneway",
                        },
                    ],
                    directives:
                    [],
                    events:
                    [
                        {
                            expression:       parseExpression("host.handler") as IMemberExpression,
                            name:             "click",
                            observables:      [["host", "handler"]],
                            rawExpression:    "@click=\"host.handler\"",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                            ],
                        },
                    ],
                    path:      "0",
                    textNodes:
                    [
                        {
                            expression:    parseInterpolation("Some {'interpolation'} here"),
                            observables:   [],
                            path:          "0-0",
                            rawExpression: "Some {'interpolation'} here",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["<span value=\"Hello {host.name}\" @click=\"host.handler\" ::value-a=\"host.value\" :value-b=\"host.x + host.y\">"],
                                ["Some {'interpolation'} here"],
                            ],
                        },
                    ],
                },
                {
                    attributes: [],
                    directives: [],
                    events:     [],
                    path:       "13",
                    textNodes:
                    [
                        {
                            expression:    parseInterpolation("{host.footer}"),
                            observables:   [["host", "footer"]],
                            path:          "13-0",
                            rawExpression: "{host.footer}",
                            stackTrace:
                            [
                                ["<x-component>"],
                                ["#shadow-root"],
                                ["...13 other(s) node(s)", "<span>"],
                                ["{host.footer}"],
                            ],
                        },
                    ],
                },
            ],
            lookup: [[0], [0, 0], [1], [2], [3], [5], [6], [7], [8], [9], [10], [11, 0, 1], [13], [13, 0]],
        };

        const actual = TemplateParser.parseReference("x-component", template);

        chai.assert.deepEqual(actual.directives.injections,   expected.directives.injections,   "actual.directives deep Equal to expected.injections");
        chai.assert.deepEqual(actual.directives.logicals,     expected.directives.logicals,     "actual.logicals deep Equal to expected.logicals");
        chai.assert.deepEqual(actual.directives.loops,        expected.directives.loops,        "actual.loops deep Equal to expected.loops");
        chai.assert.deepEqual(actual.directives.placeholders, expected.directives.placeholders, "actual.directives deep Equal to expected.placeholders");
        chai.assert.deepEqual(actual.elements,                expected.elements,                "actual.elements deep Equal to expected.elements");
        chai.assert.deepEqual(actual.lookup,                  expected.lookup,                  "actual.lookup deep Equal to expected.lookup");
    }

    @shouldPass @test
    public escapeAttributes(): void
    {
        const template = "<span *style=\"display: {host.display}\"></span>";

        const expected = "<span style=\"\"></span>";

        const actual = TemplateParser.parse("x-component", template)[0].innerHTML;

        chai.assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeIfAndFor(): void
    {
        const template = "<span #if=\"true\" #for=\"const item of items\">{item.value}</span>";

        const expected = "<template #if=\"true\"><template #for=\"const item of items\"><span> </span></template></template>";

        const actual = TemplateParser.parse("x-component", template)[0].innerHTML;

        chai.assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeIfAndPlaceholder(): void
    {
        const template = "<span #if=\"true\" #placeholder:value=\"source\">Placeholder</span>";

        const expected = "<template #if=\"true\"><template #placeholder:value=\"source\"><span>Placeholder</span></template></template>";

        const actual = TemplateParser.parse("x-component", template)[0].innerHTML;

        chai.assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeForAndPlaceholder(): void
    {
        const template = "<span #for=\"const [key, value] of items\" #placeholder:[key]=\"source\">{source.value}</span>";

        const expected = "<template #for=\"const [key, value] of items\"><template #placeholder:[key]=\"source\"><span> </span></template></template>";

        const actual = TemplateParser.parse("x-component", template)[0].innerHTML;

        chai.assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeIfAndInject(): void
    {
        const template = "<span #if=\"true\" #inject:value=\"source\">{source.value}</span>";

        const expected = "<template #if=\"true\"><template #inject:value=\"source\"><span> </span></template></template>";

        const actual = TemplateParser.parse("x-component", template)[0].innerHTML;

        chai.assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposeForAndInject(): void
    {
        const template = "<span #for=\"const item of items\" #inject:value=\"source\">{source.value}</span>";

        const expected = "<template #for=\"const item of items\"><template #inject:value=\"source\"><span> </span></template></template>";

        const actual = TemplateParser.parse("x-component", template)[0].innerHTML;

        chai.assert.equal(actual, expected);
    }

    @shouldPass @test
    public decompose(): void
    {
        const template = "<span class=\"foo\" #inject:value=\"source\" #if=\"true\" #placeholder:value=\"source\" #for=\"const item of items\">{source.value}</span>";

        const expected = "<template #inject:value=\"source\"><template #if=\"true\"><template #placeholder:value=\"source\"><template #for=\"const item of items\"><span class=\"foo\"> </span></template></template></template></template>";

        const actual = TemplateParser.parse("x-component", template)[0].innerHTML;

        chai.assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposePlaceholderWithPlaceholderKey(): void
    {
        const template = "<span #placeholder=\"source\" #placeholder-key=\"key\">{source.value}</span>";

        const expected = "<template #placeholder=\"source\" #placeholder-key=\"key\"><span> </span></template>";

        const actual = TemplateParser.parse("x-component", template)[0].innerHTML;

        chai.assert.equal(actual, expected);
    }

    @shouldPass @test
    public decomposePlaceholderAndInject(): void
    {
        const template = "<span #placeholder:value=\"source\" #inject:value=\"source\">{source.value}</span>";

        const expected = "<template #placeholder:value=\"source\"><template #inject:value=\"source\"><span> </span></template></template>";

        const actual = TemplateParser.parse("x-component", template)[0].innerHTML;

        chai.assert.equal(actual, expected);
    }

    @shouldFail @test
    public ErrorParsingTextNode(): void
    {
        const template = "<div>This is a invalid expression: {++true}</div>";

        const message = "Parsing error in \"This is a invalid expression: {++true}\": Invalid left-hand side expression in prefix operation at position 33";
        const stack   = "<x-component>\n   #shadow-root\n      <div>\n         This is a invalid expression: {++true}";

        const actual   = tryAction(() => TemplateParser.parse("x-component", template));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public invalidTwoWayDataBind(): void
    {
        const template = "<x-foo ::value='host.value1 || host.value2'></x-foo>";

        const message = "Two way data bind cannot be applied to dynamic properties: \"host.value1 || host.value2\"";
        const stack   = "<x-component>\n   #shadow-root\n      <x-foo ::value=\"host.value1 || host.value2\">";

        const actual   = tryAction(() => TemplateParser.parse("x-component", template));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public invalidTwoWayDataBindWithDinamicProperty(): void
    {
        const template = "<x-foo ::value=\"host[a + b]\"></x-foo>";

        const message = "Two way data bind cannot be applied to dynamic properties: \"host[a + b]\"";
        const stack   = "<x-component>\n   #shadow-root\n      <x-foo ::value=\"host[a + b]\">";

        const actual   = tryAction(() => TemplateParser.parse("x-component", template));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public invalidTwoWayDataBindWithOptionalProperty(): void
    {
        const template = "<x-foo ::value=\"host?.value\"></x-foo>";

        const message = "Two way data bind cannot be applied to dynamic properties: \"host?.value\"";
        const stack   = "<x-component>\n   #shadow-root\n      <x-foo ::value=\"host?.value\">";

        const actual   = tryAction(() => TemplateParser.parse("x-component", template));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public errorParsingForDirective(): void
    {
        const template = "<div #inject:items='items' #if='false'><span #placeholder:items='items' #if='true' #for='x item of items'></span></div>";

        const message = "Parsing error in #for=\"x item of items\": Unexpected token item at position 2";
        const stack   = "<x-component>\n   #shadow-root\n      <div #inject:items=\"items\" #if=\"false\">\n         <span #placeholder:items=\"items\" #if=\"true\" #for=\"x item of items\">";

        const actual   = tryAction(() => TemplateParser.parse("x-component", template));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public errorParsingIfDirective(): void
    {
        const template = "<span #if='class'></span>";

        const message = "Parsing error in #if=\"class\": Unexpected token class at position 0";
        const stack   = "<x-component>\n   #shadow-root\n      <span #if=\"class\">";

        const actual   = tryAction(() => TemplateParser.parse("x-component", template));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public errorParsingElseIfDirective(): void
    {
        const template = "<span #if='true'></span><span #else-if='class'></span>";

        const message = "Parsing error in #else-if=\"class\": Unexpected token class at position 0";
        const stack   = "<x-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <span #else-if=\"class\">";

        const actual   = tryAction(() => TemplateParser.parse("x-component", template));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unexpectedElseIf(): void
    {
        const template = "<span #if='true'></span><span #for='const item of items'></span><span #else-if></span>";

        const message = "Unexpected #else-if directive. #else-if must be used in an element next to an element that uses the #else-if directive.";
        const stack   = "<x-component>\n   #shadow-root\n      ...2 other(s) node(s)\n      <span #else-if>";

        const actual   = tryAction(() => TemplateParser.parse("x-component", template));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unexpectedElse(): void
    {
        const template = "<span #if='true'></span><span #for='const item of items'></span><span #else></span>";

        const message = "Unexpected #else directive. #else must be used in an element next to an element that uses the #if or #else-if directive.";
        const stack   = "<x-component>\n   #shadow-root\n      ...2 other(s) node(s)\n      <span #else>";

        const actual   = tryAction(() => TemplateParser.parse("x-component", template));
        const expected = toRaw(new TemplateParseError(message, stack));

        chai.assert.deepEqual(actual, expected);
    }
}