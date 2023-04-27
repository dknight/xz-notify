var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var xz_notify_exports = {};
__export(xz_notify_exports, {
  default: () => xz_notify_default
});
module.exports = __toCommonJS(xz_notify_exports);
/**
 * XZNotify is a framework agnostic web component to show floating
 * notifications. Check details on https://www.github.com/dknight/xz-notify
 *
 * @author Dmitri Smirnov <https://www.whoop.ee/>
 * @license MIT 2023
 *
 * @property {string} [type="info"] Type of the notification, like info,
 * error, warning, success. See `XZNotify.types` for possible values.
 * @property {number} [expire=10000] How long notification will be displayed.
 * @property {boolean} [closeable=false] If is set on the click on the
 * notification will close the notification.
 * @property {string} [position="ne"] Position of the notification. See
 * `XZNotify.position` for possible values.
 * @property {string} [title] Title of the notification. Creates h3 element
 * inside the notification.
 *
 * @fires XZNotify#open
 * @fires XZNotify#close
 *
 * @example
 * <xz-notify expire="8000" closeable>Message here</xz-notify>
 */
class XZNotify extends HTMLElement {
  /**
   * XZNotify HTML tag name.
   * @type {string}
   */
  static TAG_NAME = "xz-notify";
  /**
   * Observed attributes if required. usually notification's life is very short
   * and no point to observe attributes.
   * @type {Array<string>}
   */
  static observedAttributes = [];
  /**
   * Notification's possible types.
   * @type {{
   *  DEFAULT: string,
   *  INFO: string,
   *  WARNING: string,
   *  SUCCESS: string,
   *  ERROR: string
   * }}
   */
  static types = {
    INFO: "info",
    WARNING: "warning",
    SUCCESS: "success",
    ERROR: "error"
  };
  /**
   * Events for the component.
   * @type {{OPEN: CustomEvent, CLOSE: CustomEvent}}
   */
  static events = {
    OPEN: new CustomEvent("xz-notify:open", { bubbles: true }),
    CLOSE: new CustomEvent("xz-notify:close", { bubbles: true })
  };
  /**
   * Positioning constants.
   * @enum {Object<string, string>}
   */
  static position = {
    N: "n",
    NE: "ne",
    E: "e",
    SE: "se",
    S: "s",
    SW: "sw",
    W: "w",
    NW: "nw"
  };
  /**
   * Contains currently opened notifications.
   * @type {Object<string, Array<XZNotify>>}
   */
  static collection = {
    [this.position.N]: [],
    [this.position.NE]: [],
    [this.position.E]: [],
    [this.position.SE]: [],
    [this.position.S]: [],
    [this.position.SW]: [],
    [this.position.W]: [],
    [this.position.NW]: []
  };
  /**
   * Defaults for the component.
   * @type {{
   *   EXPIRE: number,
   *   TYPE: string,
   *   POSITION: string,
   *   CLOSEABLE: boolean
   * }}
   */
  static defaults = {
    EXPIRE: 1e4,
    TYPE: this.types.INFO,
    POSITION: this.position.NE,
    CLOSEABLE: false
  };
  /**
   * Creates a new XZNotify element. Recommended to use when creating
   * notifications.
   * @param {string} content
   * @param {Object<string, string>} attrs
   * @param {boolean} trusted
   * @return {XZNotify}
   */
  static create = (content, attrs = {}, trusted = false) => {
    const elem = document.createElement(this.TAG_NAME);
    Object.entries(attrs).forEach(([k, v]) => elem.setAttribute(k, v));
    if (!trusted) {
      elem.innerText = content;
    } else {
      elem.innerHTML = content;
    }
    return elem;
  };
  // Private vars here please...
  #styleElem = document.createElement("style");
  #forcedClose = false;
  // injected in build stage;
  #css = `:host{--xz-notify-background-color: #f7f7f7;--xz-notify-title-color: currentColor;display:block;position:fixed;left:var(--xz-notify-left);top:var(--xz-notify-top);border-radius:0;border-width:0;border-style:solid;font-family:system-ui,-apple-system,Arial,sans-serif;font-size:16px;font-weight:400;line-height:normal;margin:.5em;padding:1.5em;width:fit-content;max-width:28em;min-width:18em;height:auto;z-index:auto;animation:xz-notify-close .4s ease-in 1;animation-play-state:paused;background:var(--xz-notify-background-color) linear-gradient(to right,var(--xz-notify-title-color) .25em,transparent 0);border-color:transparent;color:#666}@keyframes xz-notify-close{to{opacity:0}}:host([closeable]){cursor:pointer}:host([closeable]:hover):after{content:"";display:block;width:100%;height:100%;background:rgba(0,0,0,.05);position:absolute;top:0;left:0;pointer-events:none}:host p{margin-top:0}:host a{color:currentColor}:host h3{color:var(--xz-notify-title-color, currentColor);font-size:125%;margin:0 0 .5em}:host([type="info"]){--xz-notify-title-color: #4d4dff;--xz-notify-background-color: #f6f6ff}:host([type="success"]){--xz-notify-title-color: #2ec946;--xz-notify-background-color: #f4fcf6}:host([type="warning"]){--xz-notify-title-color: #ffba00;--xz-notify-background-color: #fffbf2}:host([type="error"]){--xz-notify-title-color: #ff3838;--xz-notify-background-color: #fff5f5}`;
  /**
   * Constructor is always called before instance of notification is connected
   * to DOM.
   * @constructor
   */
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "closed" });
    this.css = this.#css;
  }
  /**
   * @type {string}
   */
  get css() {
    return this.#css;
  }
  /**
   * @param {string} v
   */
  set css(v) {
    this.#css = v;
    this.#styleElem.textContent = this.#css;
  }
  /**
   * Calculates and sets the position of the notification.
   */
  #setPosition() {
    const i = this.constructor.collection[this.position].findIndex((x2) => x2 === this);
    const rect = this.getBoundingClientRect();
    const styles = getComputedStyle(this);
    const mt = parseInt(styles.getPropertyValue("margin-top"));
    const mr = parseInt(styles.getPropertyValue("margin-right"));
    const mb = parseInt(styles.getPropertyValue("margin-bottom"));
    const ml = parseInt(styles.getPropertyValue("margin-left"));
    let x, y, dx, dy;
    switch (this.position) {
      case XZNotify.position.N:
        [x, y] = ["50%", "0%"];
        [dx, dy] = [rect.width / 2, i * (rect.height + mt)];
        break;
      case XZNotify.position.NE:
        [x, y] = ["100%", "0%"];
        [dx, dy] = [rect.width + ml + mr, i * (rect.height + mt)];
        break;
      case XZNotify.position.E:
        [x, y] = ["100%", "50%"];
        [dx, dy] = [(i + 1) * (rect.width + ml + mr), -(rect.height / 2 + mt + mb)];
        break;
      case XZNotify.position.SE:
        [x, y] = ["100%", "100%"];
        [dx, dy] = [rect.width + ml + mr, -(i + 1) * (rect.height + mt + mb)];
        break;
      case XZNotify.position.S:
        [x, y] = ["50%", "100%"];
        [dx, dy] = [rect.width / 2, -(i + 1) * (rect.height + mt + mb)];
        break;
      case XZNotify.position.SW:
        [x, y] = ["0%", "100%"];
        [dx, dy] = [0, -(i + 1) * (rect.height + mt + mb)];
        break;
      case XZNotify.position.W:
        [x, y] = ["0%", "50%"];
        [dx, dy] = [i * -(rect.width + ml), -(rect.height / 2 + mt + mb)];
        break;
      case XZNotify.position.NW:
        [x, y] = ["0%", "0%"];
        [dx, dy] = [0, i * (rect.height + mt)];
        break;
    }
    ;
    this.style.setProperty("--xz-notify-left", `calc(${x} - ${dx}px)`);
    this.style.setProperty("--xz-notify-top", `calc(${y} + ${dy}px)`);
  }
  /**
   * Re-position all elements.
   */
  #setPositionAll() {
    Object.values(this.constructor.collection).forEach((coll) => {
      coll.forEach((x) => this.#setPosition.call(x));
    });
  }
  /**
   * @inheritdoc
   */
  connectedCallback() {
    this.#reflectToProperties();
    this.constructor.collection[this.position].push(this);
    this.dispatchEvent(this.constructor.events.OPEN, this);
    this.#render();
    this.#hydrate();
  }
  /**
   * Reflect attributes to properties for convineicen.
   * Use default if no attribute set.
   */
  #reflectToProperties() {
    this.type = (this.getAttribute("type") || this.constructor.defaults.TYPE).toLowerCase();
    this.position = (this.getAttribute("position") || this.constructor.position.NE).toLowerCase();
    this.expire = Number(this.getAttribute("expire")) || this.constructor.defaults.EXPIRE;
    this.closeable = this.hasAttribute("closeable");
    this.title = this.getAttribute("title");
  }
  /**
   * Renders element.
   * @private
   */
  #render() {
    this.root.appendChild(this.#styleElem);
    this.title && this.root.appendChild(this.#buildTitle());
    this.root.append(...this.childNodes);
  }
  /**
   * Builds title heading element.
   * @return {HTMLHeadingElement}
   */
  #buildTitle() {
    const title = document.createElement("h3");
    title.innerText = this.title;
    return title;
  }
  /**
   * Added all interactivity here for potential SSR.
   * But actually can be done in render() or connectedCallback().
   * @private
   */
  #hydrate() {
    const hasAnimation = parseFloat(
      window.getComputedStyle(this).getPropertyValue("animation-duration")
    ) > 0;
    this.#setPosition();
    let start;
    const tick = (ts) => {
      if (start === void 0) {
        start = ts;
      }
      if (ts - start >= this.expire || this.#forcedClose) {
        this.dataset.closing = "";
        if (hasAnimation > 0) {
          this.style.animationPlayState = "running";
        } else {
          this.#close();
        }
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    this.addEventListener("animationend", this.#close);
    if (this.closeable) {
      this.addEventListener("click", this.closeHandler.bind(this));
    }
  }
  /**
   * Closes the notification.
   */
  #close() {
    this.dispatchEvent(this.constructor.events.CLOSE, this);
    this.remove();
  }
  /**
   * Handler when closeable is true and clicked on the notification.
   * @param {MouseEvent|PointerEvent} e
   */
  closeHandler(e) {
    this.#forcedClose = true;
  }
  /**
   * @inheritdoc
   */
  disconnectedCallback() {
    this.constructor.collection[this.position] = this.constructor.collection[this.position].filter((x) => x !== this);
    this.#setPositionAll();
  }
}
window.customElements.define(XZNotify.TAG_NAME, XZNotify);
var xz_notify_default = XZNotify;
