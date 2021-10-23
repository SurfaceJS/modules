import fs                 from "fs";
import { pathToFileURL }  from "url";
import util               from "util";

const readFileAsync = util.promisify(fs.readFile);

const booleanPattern = /^true|false$/;

export function normalizeUrlPath(path: string): string
{
    return path ? (path.startsWith("/") ? "" : "/") + path.replace(/\/$/, "") : "";
}

export async function loadModule(path: string): Promise<unknown>
{
    if (path.endsWith(".json"))
    {
        if (fs.existsSync(path))
        {
            return JSON.parse((await readFileAsync(path)).toString());
        }

        throw new Error(`Cannot find the file ${path}`);
    }

    return import(pathToFileURL(path).href);
}

export const parsePattern = (pattern: RegExp) =>
    (value: string = ""): string =>
    {
        if (pattern.test(value))
        {
            return value.toLowerCase();
        }

        throw new Error(`'${value}' dont match the pattern ${pattern}`);
    };

export const toBooleanOrParsePattern = (pattern: RegExp) =>
    (value: string = ""): string | boolean =>
    {
        if (value)
        {
            if (booleanPattern.test(value))
            {
                return value == value.toLowerCase();
            }

            return parsePattern(pattern)(value);
        }

        return true;
    };

export function toArray(value: string = ""): string[]
{
    return value.split(",");
}

export function toBoolean(value: string = ""): boolean
{
    return booleanPattern.test(value) ? value.toLowerCase() == "true" : false;
}

export function toBooleanOrEnum(...values: string[]): (value: string) => boolean | string
{
    return (value = "") =>
    {
        if (booleanPattern.test(value))
        {
            return value.toLowerCase() == "true";
        }
        else if (values.some(x => x == value))
        {
            return value;
        }

        throw new Error(`Expected a boolean or ${values.join(", ")}.`);
    };
}

export function toNumberOrEnum(...values: string[]): (value: string) => number | string
{
    return (value = "") =>
    {
        const numberValue = Number(value);

        if (!Number.isNaN(numberValue))
        {
            return numberValue;
        }
        else if (values.some(x => x == value))
        {
            return value;
        }

        throw new Error(`Expected a number or ${values.join(", ")}.`);
    };
}

export function toEnum(...values: string[]): (value: string) => string
{
    return (value = "") =>
    {
        if (values.some(x => x == value))
        {
            return value;
        }

        throw new Error(`Expected a boolean or ${values.join(", ")}.`);
    };
}

export function toNumberOrBooleanOrStringArray(value: string = ""): boolean | string[] | number
{
    if (!Number.isNaN(Number(value)))
    {
        return Number(value);
    }

    return toBooleanOrStringArray(value);
}

export function toBooleanOrStringArray(value: string): boolean | string[]
{
    return !value
        ? false
        : booleanPattern.test(value)
            ? value.toLowerCase() == "true"
            : value.split(",");
}

export function log(message?: unknown, ...params: unknown[]): void
{
    console.log(message, ...params);
}