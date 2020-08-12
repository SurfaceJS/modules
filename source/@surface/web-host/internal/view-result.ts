import fs           from "fs";
import path         from "path";
import ActionResult from "./action-result";
import HttpContext  from "./http-context";
import mymeType     from "./myme-types";
import StatusCode   from "./status-code";

export default class ViewResult extends ActionResult
{
    private readonly controllerName: string;
    private readonly model:          unknown;
    private readonly statusCode:     StatusCode;
    private readonly viewName:       string;

    public constructor(httpContext: HttpContext, controllerName: string,  viewName: string, model: unknown, statusCode: StatusCode)
    {
        super(httpContext);

        this.controllerName = controllerName;
        this.model          = model;
        this.statusCode     = statusCode;
        this.viewName       = viewName;

        // Todo: Used to prevent unused error. Remove later.
        console.log(this.model);
    }

    public executeResult(): void
    {
        const viewpath = path.join(this.httpContext.host.root, "views", this.controllerName, `${this.viewName}.html`);

        if (!fs.existsSync(viewpath))
        {
            throw new Error(`View ${this.viewName} cannot be founded.`);
        }

        const data = fs.readFileSync(viewpath);

        this.httpContext.response.writeHead(this.statusCode, { "Content-Type": mymeType[".html"] });
        this.httpContext.response.write(data);
        this.httpContext.response.end();
    }
}