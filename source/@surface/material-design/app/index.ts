import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("smd-app", template, style)
export default class App extends CustomElement
{ }