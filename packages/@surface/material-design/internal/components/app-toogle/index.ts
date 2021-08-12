/* eslint-disable import/no-unassigned-import */
import "../button/index.js";
import "../icon/index.js";

import { mix }                    from "@surface/core";
import CustomElement, { element } from "@surface/custom-element";
import colorable                  from "../../mixins/colorable/index.js";
import elevatable                 from "../../mixins/elevatable/index.js";
import themeable                  from "../../mixins/themeable/index.js";
import template                   from "./index.html";
import style                      from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-app-toogle": AppToogle;
    }
}

@element("smd-app-toogle", { style, template })
export default class AppToogle extends mix(CustomElement, [colorable, elevatable, themeable])
{
    public colorable?: HTMLElement;
}