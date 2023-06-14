"use strict";
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
 * XZNotify is a framework-agnostic web component to show floating
 * notifications. The component uses a first-in, first-out queue.data structure,
 * new notifications are automatically appended to the end of the queue.
 * Also, each appended component automatically computes its own position.
 * More details on https://www.github.com/dknight/xz-notify
 *
 * @author Dmitri Smirnov <https://www.whoop.ee/>
 * @license MIT 2023
 * @version 1.1.1
 * @extends HTMLElement
 *
 * @property {number} [expire=10000] Time in milliseconds. How long the
 * notification will be displayed. If expire is zero or less, the notification
 * will be closed immediately. If the expiration value cannot be parsed into a
 * number then the default fallback is used.
 * @property {boolean} [closeable=false] If it is set, clicking on the
 * notification will close it.
 * @property {Positions} [position="ne"] Position of the notification on the
 * screen. Position corresponds to a point of compass: n (north),
 * ne (north-east), s (south), etc.
 * @property {string} [heading] The heading of the notification. Creates h3
 * element inside the notification.
 * @property {boolean} [grouped=false] If grouped is set, then the offset
 * position is not recalculated and notifications are stacked.
 *
 * @fires XZNotify#open
 * @fires XZNotify#close
 *
 * @example
 * <!-- Declarative way -->
 * <xz-notify expire="8000" closeable>Hello world!</xz-notify>
 * @example
 * // Programmatic way
 * document.body.append(XZNotify.create('Hello world!', {
 *   expire: 8000,
 *   closeable: true,
 * }));
 */
const _XZNotify = class extends HTMLElement {
  /**
   * Constructor is always called before an instance of notification is
   * connected to the DOM.
   */
  constructor(root, styleElem, forcedClose = false, grouped = _XZNotify.defaults.GROUPED, position = _XZNotify.positions.NE, expire = _XZNotify.defaults.EXPIRE, type = _XZNotify.defaults.TYPE, closeable = true, heading) {
    super();
    this.root = root;
    this.styleElem = styleElem;
    this.forcedClose = forcedClose;
    this.grouped = grouped;
    this.position = position;
    this.expire = expire;
    this.type = type;
    this.closeable = closeable;
    this.heading = heading;
    this.root = this.attachShadow({ mode: "open" });
    this.styleElem = document.createElement("style");
    this.styleElem.textContent = `:host{--xz-notify-background-color: #f7f7f7;--xz-notify-heading-color: currentColor;--xz-notify-zIndex: auto;display:block;position:fixed;left:var(--xz-notify-left);top:var(--xz-notify-top);border-radius:0;border:0 solid;font-family:system-ui,-apple-system,Arial,sans-serif;font-size:16px;font-weight:400;line-height:normal;margin:.5em;padding:1.5em;width:fit-content;max-width:28em;min-width:18em;height:auto;z-index:var(--xz-notify-zIndex);animation:xz-notify-toggle .25s ease-in;background:var(--xz-notify-background-color) linear-gradient(to right,var(--xz-notify-heading-color) .25em,transparent 0);border-color:transparent;color:#666}:host([data-closing]){animation-direction:reverse;animation-iteration-count:2}@keyframes xz-notify-toggle{0%{opacity:0}to{opacity:1}}:host([closeable]){cursor:pointer}:host([closeable]:hover):after{content:"";display:block;width:100%;height:100%;background:rgba(0,0,0,.05);position:absolute;top:0;left:0;pointer-events:none}:host p{margin-top:0}:host a{color:currentColor}:host .heading{color:var(--xz-notify-heading-color, currentColor);font-size:125%;margin:0 0 .5em}:host([type="info"]){--xz-notify-heading-color: #4d4dff;--xz-notify-background-color: #f6f6ff}:host([type="success"]){--xz-notify-heading-color: #2ec946;--xz-notify-background-color: #f4fcf6}:host([type="warning"]){--xz-notify-heading-color: #ffba00;--xz-notify-background-color: #fffbf2}:host([type="error"]){--xz-notify-heading-color: #ff3838;--xz-notify-background-color: #fff5f5}`;
  }
  /**
   * Calculates and sets the position of the notification.
   */
  setPosition() {
    const i = this.grouped ? 0 : this.findIndex();
    const [x, y] = this.calcBasePosition();
    const [dx, dy] = this.calcOffsetPosition(i);
    this.style.setProperty("--xz-notify-left", `calc(${x} - ${dx}px)`);
    this.style.setProperty("--xz-notify-top", `calc(${y} + ${dy}px)`);
    if (this.grouped) {
      const c = _XZNotify.collection[this.position].length;
      this.style.setProperty("--xz-notify-zIndex", String(1e4 - c));
    }
  }
  /**
   * Gets the index of the current notification in collection.
   */
  findIndex() {
    return _XZNotify.collection[this.position].findIndex((x) => x === this);
  }
  /**
   * Calculates base position.
   */
  calcBasePosition() {
    switch (this.position) {
      case _XZNotify.positions.N:
        return ["50%", "0%"];
      default:
      case _XZNotify.positions.NE:
        return ["100%", "0%"];
      case _XZNotify.positions.E:
        return ["100%", "50%"];
      case _XZNotify.positions.SE:
        return ["100%", "100%"];
      case _XZNotify.positions.S:
        return ["50%", "100%"];
      case _XZNotify.positions.SW:
        return ["0%", "100%"];
      case _XZNotify.positions.W:
        return ["0%", "50%"];
      case _XZNotify.positions.NW:
        return ["0%", "0%"];
    }
  }
  /**
   * Calculates offset position.
   */
  calcOffsetPosition(i) {
    const rect = this.getBoundingClientRect();
    const styles = getComputedStyle(this);
    const mt = Number.parseInt(styles.getPropertyValue("margin-top"));
    const mr = Number.parseInt(styles.getPropertyValue("margin-right"));
    const mb = Number.parseInt(styles.getPropertyValue("margin-bottom"));
    const ml = Number.parseInt(styles.getPropertyValue("margin-left"));
    switch (this.position) {
      case _XZNotify.positions.N:
        return [rect.width / 2, i * (rect.height + mt)];
      default:
      case _XZNotify.positions.NE:
        return [rect.width + ml + mr, i * (rect.height + mt)];
      case _XZNotify.positions.E:
        return [(i + 1) * (rect.width + ml + mr), -(rect.height / 2 + mt + mb)];
      case _XZNotify.positions.SE:
        return [rect.width + ml + mr, -(i + 1) * (rect.height + mt + mb)];
      case _XZNotify.positions.S:
        return [rect.width / 2, -(i + 1) * (rect.height + mt + mb)];
      case _XZNotify.positions.SW:
        return [0, -(i + 1) * (rect.height + mt + mb)];
      case _XZNotify.positions.W:
        return [i * -(rect.width + ml), -(rect.height / 2 + mt + mb)];
      case _XZNotify.positions.NW:
        return [0, i * (rect.height + mt)];
    }
  }
  /**
   * Re-position all elements.
   */
  setPositionAll() {
    Object.values(_XZNotify.collection).forEach((coll) => {
      coll.forEach((x) => this.setPosition.call(x));
    });
  }
  /**
   * @inheritdoc
   */
  connectedCallback() {
    this.reflectToProperties();
    _XZNotify.collection[this.position].push(this);
    this.dispatchEvent(_XZNotify.events.OPEN);
    this.render();
    this.hydrate();
  }
  /**
   * Reflect attributes to properties for convenience.
   * Use default if no attribute set.
   */
  reflectToProperties() {
    const tmpType = this.getAttribute("type") || _XZNotify.defaults.TYPE;
    this.type = tmpType.toLowerCase();
    this.position = (this.getAttribute("position") || _XZNotify.positions.NE).toLowerCase();
    const expireTmp = this.getAttribute("expire");
    if (expireTmp === null || Number.isNaN(Number(expireTmp))) {
      this.expire = _XZNotify.defaults.EXPIRE;
    } else {
      this.expire = Number(expireTmp);
    }
    this.closeable = this.hasAttribute("closeable");
    this.heading = this.getAttribute("heading");
    this.grouped = this.hasAttribute("grouped");
  }
  /**
   * Renders element.
   */
  render() {
    this.root.append(this.styleElem);
    this.heading && this.root.appendChild(this.buildHeading());
    this.root.append(...this.childNodes);
    this.setAttribute("role", "alert");
  }
  /**
   * Builds heading <h3> element.
   */
  buildHeading() {
    const h = document.createElement("h3");
    if (this.heading) {
      h.innerText = this.heading;
    }
    h.classList.add("heading");
    return h;
  }
  /**
   * Added all interactivity here for potential SSR. But it can actually be
   * done in render() or connectedCallback().
   */
  hydrate() {
    const hasAnimation = Number.parseFloat(
      window.getComputedStyle(this).getPropertyValue("animation-duration")
    ) > 0;
    this.setPosition();
    let start;
    const tick = (ts) => {
      if (start === void 0) {
        start = ts;
      }
      if (ts - start >= this.expire || this.forcedClose) {
        this.dataset.closing = "true";
        if (hasAnimation) {
          this.style.animationPlayState = "running";
        } else {
          this.close();
        }
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    this.addEventListener("animationend", this.close);
    if (this.closeable) {
      this.addEventListener("click", this.closeHandler.bind(this));
    }
  }
  /**
   * Closes the notification.
   */
  close() {
    if (!this.dataset.closing) {
      this.style.animationPlayState = "paused";
      return;
    }
    this.dispatchEvent(_XZNotify.events.CLOSE);
    this.remove();
  }
  /**
   * Handler when closeable is true and clicked on the notification.
   */
  closeHandler(e) {
    this.forcedClose = true;
  }
  disconnectedCallback() {
    _XZNotify.collection[this.position] = _XZNotify.collection[this.position].filter((x) => x !== this);
    this.setPositionAll();
  }
};
let XZNotify = _XZNotify;
XZNotify.TAG_NAME = "xz-notify";
XZNotify.observedAttributes = [];
XZNotify.types = {
  DEFAULT: "default",
  INFO: "info",
  WARNING: "warning",
  SUCCESS: "success",
  ERROR: "error"
};
XZNotify.events = {
  OPEN: new CustomEvent("xz-notify:open", { bubbles: true }),
  CLOSE: new CustomEvent("xz-notify:close", { bubbles: true })
};
XZNotify.positions = {
  N: "n",
  NE: "ne",
  E: "e",
  SE: "se",
  S: "s",
  SW: "sw",
  W: "w",
  NW: "nw"
};
XZNotify.collection = {
  [_XZNotify.positions.N]: [],
  [_XZNotify.positions.NE]: [],
  [_XZNotify.positions.E]: [],
  [_XZNotify.positions.SE]: [],
  [_XZNotify.positions.S]: [],
  [_XZNotify.positions.SW]: [],
  [_XZNotify.positions.W]: [],
  [_XZNotify.positions.NW]: []
};
XZNotify.defaults = {
  EXPIRE: 1e4,
  TYPE: _XZNotify.types.INFO,
  POSITION: _XZNotify.positions.NE,
  CLOSEABLE: false,
  GROUPED: false,
  HEADING: null
};
XZNotify.create = (content, props = {}, trusted = false) => {
  const elem = document.createElement(_XZNotify.TAG_NAME);
  Object.entries(props).forEach(
    ([k, v]) => {
      if (v === false || v === null) {
        return;
      }
      elem.setAttribute(k, String(v));
    }
  );
  elem[trusted ? "innerHTML" : "textContent"] = content;
  return elem;
};
window.customElements.define(XZNotify.TAG_NAME, XZNotify);
var xz_notify_default = XZNotify;
