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
  default: () => XZNotify
});
module.exports = __toCommonJS(xz_notify_exports);
class XZNotify extends HTMLElement {
  /**
   * XZNofity HTML tag name.
   * @type {string}
   */
  static TAG_NAME = "xz-notify";
  /**
   * Observed attributes if required. usually notication's life is very short
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
   *  ERROR: string,
   * }}
   */
  static types = {
    DEFAULT: "default",
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
   * @type {Object<string, string>}
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
   * @type {Object<string, Array<XZNotify>}
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
   * @type {Object<string, string>}
   */
  static defaults = {
    EXPIRE: 5e3,
    TYPE: this.types.DEFAULT,
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
  #css = `
    :host {
      display:        var(--xz-notify-display, block);
      border-radius:  var(--xz-notify-border-radius, .375em);
      border-width:   var(--xz-notify-border-width, .0625em);
      border-style:   var(--xz-notify-border-style, solid);
      font-family:    var(--xz-notify-font-family,        system-ui, -apple-system, Arial, sans-serif);
      font-size:      var(--xz-notify-font-size, 16px);
      font-weight:    var(--xz-notify-font-weight, normal);
      line-height:    var(--xz-notify-line-height, normal);
      margin:         var(--xz-notify-margin, .5em);
      padding:        var(--xz-notify-padding, 1em);
      width:          var(--xz-notify-width, fit-content);
      max-width:      var(--xz-notify-max-width, 28em);
      min-width:      var(--xz-notify-min-width, 18em);
      height:         var(--xz-notify-height, auto);
      opacity:        var(--xz-notify-opacity, 1);
      position:       var(--zx-notify-position, fixed);
      left:           var(--xz-notify-left);
      top:            var(--xz-notify-top);
      z-index:        var(--xz-notify-z-index, auto);
      animation:      var(--xz-notify-animation, xz-close .25s ease-in 1);
      animation-play-state: paused;

      background:    var(--xz-notify-default-background, #fcfcfd);
      border-color:  var(--xz-notify-default-border-color, #e9ecef);
      color:         var(--xz-notify-default-color, #495057);
    }

    :host([type="${this.constructor.types.SUCCESS}"]) {
      background:    var(--xz-notify-default-background, #d1e7dd);
      border-color:  var(--xz-notify-default-border-color, #a3cfbb);
      color:         var(--xz-notify-default-color, #0a3922);
    }
    :host([type="${this.constructor.types.INFO}"]) {
      background:    var(--xz-notify-default-background, #cfe2ff);
      border-color:  var(--xz-notify-default-border-color, #9ec5fe);
      color:         var(--xz-notify-default-color, #052c65);
    }
    :host([type="${this.constructor.types.WARNING}"]) {
      background:    var(--xz-notify-default-background, #fff3cd);
      border-color:  var(--xz-notify-default-border-color, #ffe69c);
      color:         var(--xz-notify-default-color, #664d03);
    }
    :host([type="${this.constructor.types.ERROR}"]) {
      background:    var(--xz-notify-default-background, #f8d7da);
      border-color:  var(--xz-notify-default-border-color, #f1aeb5);
      color:         var(--xz-notify-default-color, #58151c);
    }

    :host([closeable]) {
      cursor: pointer;
    }
    :host([closeable]:hover) {
      filter: brightness(.975);
    }
    :host p {margin-top: 0}
    :host a {color: currentColor}

    @keyframes xz-close {to {opacity: 0}}
    @media (prefers-reduced-motion) {
      :host {
        animation-duration: 1ms;
      }
    }`;
  // #slot = document.createElement('slot'); // TODO remove?
  /**
   * Construction function is called before instance of notification is created.
   * @constructor
   */
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
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
    this.#reflectToProperites();
    this.constructor.collection[this.position].push(this);
    this.dispatchEvent(this.constructor.events.OPEN, this);
    this.#render();
    this.#hydrate();
  }
  /**
   * Reflect attributes to properties for convineicen.
   * Use default if no attribute set.
   */
  #reflectToProperites() {
    this.type = (this.getAttribute("type") || this.constructor.defaults.TYPE).toLowerCase();
    this.position = (this.getAttribute("position") || this.constructor.position.NE).toLowerCase();
    this.expire = Number(this.getAttribute("expire")) || this.constructor.defaults.EXPIRE;
    this.closeable = this.hasAttribute("closeable");
  }
  /**
   * Renders element.
   * @private
   */
  #render() {
    this.root.append(this.#styleElem, ...this.childNodes);
  }
  /**
   * Added all interactivity here for potential SSR.
   * But actually can be done in render() or connectedCallback().
   * @private
   */
  #hydrate() {
    this.#setPosition();
    let start;
    const tick = (ts) => {
      if (start === void 0) {
        start = ts;
      }
      if (ts - start >= this.expire || this.#forcedClose) {
        this.dataset.closing = "";
        this.style.animationPlayState = "running";
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    this.addEventListener("animationend", this.remove);
    if (this.closeable) {
      this.addEventListener("click", this.closeHandler.bind(this));
    }
  }
  /**
   * Handler when closeable is true and clicked on the nofication.
   * @param {MouseEvent|PointerEvent} e
   */
  closeHandler(e) {
    this.#forcedClose = true;
  }
  /**
   * @inheritdoc
   */
  disconnectedCallback() {
    this.dispatchEvent(this.constructor.events.CLOSE, this);
    this.constructor.collection[this.position] = this.constructor.collection[this.position].filter((x) => x !== this);
    this.#setPositionAll();
  }
}
