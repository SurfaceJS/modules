import { ObjectLiteral, Nullable } from "@surface/types";

export class Route
{
    private _expression: RegExp;
    public get expression(): RegExp
    {
        return this._expression;
    }

    private _isDefault: boolean;
    public get isDefault(): boolean
    {
        return this._isDefault;
    }

    private _name: string;
    public get name(): string
    {
        return this._name;
    }

    private _pattern: string;
    public get pattern(): string
    {
        return this._pattern;
    }

    public constructor(name: string, pattern: string);
    public constructor(name: string, pattern: string, isDefault: boolean);
    public constructor(name: string, pattern: string, isDefault?: boolean)
    {
        this._expression = this.toExpression(pattern);
        this._isDefault  = !!isDefault;
        this._name       = name;
        this._pattern    = pattern;
    }

    private toExpression(pattern: string): RegExp
    {
        let expression = pattern.replace(/^\/|\/$/g, "").split("/").asEnumerable()
            .select(x => x.replace(/{\s*([^}\s\?=]+)\s*}/g, "([^\\\/]+)").replace(/{\s*([^}=?\s]+)\s*=\s*([^}=?\s]+)\s*}|{\s*([^} ?]+\?)?\s*}|(\s*\*\s*)/, "([^\\\/]*)"))
            .toArray()
            .join("\\\/");

        expression = expression
            .replace(/(\\\/(?!\?))(\(\[\^\\\/\]\*\))/g, "$1?$2")
            .replace(/(\(\[\^\\\/\]\*\))(\\\/(?!\?))/g, "$1$2?");

        return new RegExp(`^\/?${expression}\/?$`, "i");
    }

    public match(route: string): Nullable<Route.IData>
    {
        let [path, queryString] = route.split("?");

        let params: ObjectLiteral<string>           = { };
        let search: Nullable<ObjectLiteral<string>> = null;

        let root = "/";

        if (queryString)
        {
            search = { };

            decodeURI(queryString).split("&")
                .asEnumerable()
                .select(x => x.split("="))
                .forEach(x => search && (search[x[0]] = x[1]));
        }

        if (this._expression.test(route))
        {
            let keys = this._expression.exec(this._pattern);

            this._expression.lastIndex = 0;

            let values = this._expression.exec(path);

            if (keys && values)
            {
                Array.from(keys).asEnumerable()
                    .zip(Array.from(values), (key, value) => ({ key, value }))
                    .skip(1)
                    .forEach
                    (
                        x =>
                        {
                            let match = /{\s*([^=?]+)\??(?:=([^}]*))?\s*}/.exec(x.key);
                            if (match)
                            {
                                const groups = { key: 1, value: 2 };
                                params[match[groups.key]] = x.value || match[groups.value];
                            }
                        }
                    );

                let match = /^(\/?(?:[\w-_]+\/?)+)(?:$|\/[^\w-_]*)/.exec(this._pattern);

                if (match)
                {
                    root = match[1];
                }
            }

            return { match: this.pattern, root, route, params, search };
        }

        return null;
    }
}

export namespace Route
{
    export interface IData
    {
        match:  string;
        params: ObjectLiteral<string>;
        root:   string;
        route:  string;
        search: Nullable<ObjectLiteral<string>>;
    }
}