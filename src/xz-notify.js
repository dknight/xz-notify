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
 * @property {string} [heading] Heading of the notification. Creates h3 element
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
  static TAG_NAME = 'xz-notify';

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
    INFO:    'info',
    WARNING: 'warning',
    SUCCESS: 'success',
    ERROR:   'error',
  };

  /**
   * Events for the component.
   * @type {{OPEN: CustomEvent, CLOSE: CustomEvent}}
   */
  static events = {
    OPEN:  new CustomEvent('xz-notify:open', {bubbles: true}),
    CLOSE: new CustomEvent('xz-notify:close', {bubbles: true}),
  };

  /**
   * Positioning constants.
   * @enum {Object<string, string>}
   */
  static position = {
    N:  'n',
    NE: 'ne',
    E:  'e',
    SE: 'se',
    S:  's',
    SW: 'sw',
    W:  'w',
    NW: 'nw',
  };

  /**
   * Contains currently opened notifications.
   * @type {Object<string, Array<XZNotify>>}
   */
  static collection = {
    [this.position.N]:  [],
    [this.position.NE]: [],
    [this.position.E]:  [],
    [this.position.SE]: [],
    [this.position.S]:  [],
    [this.position.SW]: [],
    [this.position.W]:  [],
    [this.position.NW]: [],
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
    EXPIRE:    10000,
    TYPE:      this.types.INFO,
    POSITION:  this.position.NE,
    CLOSEABLE: false,
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
  #styleElem = document.createElement('style');
  #forcedClose = false;
  // injected in build stage;
  #css = `{{CSS}}`;

  /**
   * Constructor is always called before instance of notification is connected
   * to DOM.
   * @constructor
   */
  constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'});
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
    const [x, y] = this.#calcBasePosition();
    const [dx, dy] = this.#calcOffsetPosition();
    this.style.setProperty('--xz-notify-left', `calc(${x} - ${dx}px)`);
    this.style.setProperty('--xz-notify-top', `calc(${y} + ${dy}px)`);
  }

  /**
   * Calculates base position.
   * @return {Array<number>}
   */
  #calcBasePosition() {
    switch (this.position) {
      case XZNotify.position.N:
        return ['50%', '0%'];
      case XZNotify.position.NE:
        return ['100%', '0%'];
      case XZNotify.position.E:
        return ['100%', '50%'];
      case XZNotify.position.SE:
        return ['100%', '100%'];
      case XZNotify.position.S:
        return ['50%', '100%'];
      case XZNotify.position.SW:
        return ['0%', '100%'];
      case XZNotify.position.W:
        return ['0%', '50%'];
      case XZNotify.position.NW:
        return ['0%', '0%'];
    };
  }

  /**
   * Calculates offset position.
   * @return {Array<number>}
   */
  #calcOffsetPosition() {
    const i = this.constructor.collection[this.position]
        .findIndex((x) => x === this);
    const rect = this.getBoundingClientRect();
    const styles = getComputedStyle(this);
    const mt = parseInt(styles.getPropertyValue('margin-top'));
    const mr = parseInt(styles.getPropertyValue('margin-right'));
    const mb = parseInt(styles.getPropertyValue('margin-bottom'));
    const ml = parseInt(styles.getPropertyValue('margin-left'));
    switch (this.position) {
      case XZNotify.position.N:
        return [rect.width/2, i*(rect.height + mt)];
      case XZNotify.position.NE:
        return [rect.width + ml + mr, i*(rect.height + mt)];
      case XZNotify.position.E:
        return [(i+1)*(rect.width + ml + mr), -(rect.height/2 + mt + mb)];
      case XZNotify.position.SE:
        return [rect.width + ml + mr, -(i+1)*(rect.height + mt + mb)];
      case XZNotify.position.S:
        return [rect.width/2, -(i+1)*(rect.height + mt + mb)];
      case XZNotify.position.SW:
        return [0, -(i+1)*(rect.height + mt + mb)];
      case XZNotify.position.W:
        return [i*-(rect.width + ml), -(rect.height/2 + mt + mb)];
      case XZNotify.position.NW:
        return [0, i*(rect.height + mt)];
    };
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
    this.type = (this.getAttribute('type')
        || this.constructor.defaults.TYPE).toLowerCase();
    this.position = (this.getAttribute('position')
        || this.constructor.position.NE).toLowerCase();
    this.expire = Number(this.getAttribute('expire'))
        || this.constructor.defaults.EXPIRE;
    this.closeable = this.hasAttribute('closeable');
    this.heading = this.getAttribute('heading');
  }

  /**
   * Renders element.
   * @private
   */
  #render() {
    this.root.append(this.#styleElem);
    this.heading && this.root.appendChild(this.#buildHeading());
    // TODO try to think out better solution, maybe slots?
    this.root.append(...this.childNodes);
  }

  /**
   * Builds heading <h3> element.
   * @return {HTMLHeadingElement}
   */
  #buildHeading() {
    const h = document.createElement('h3');
    h.innerText = this.heading;
    return h;
  }

  /**
   * Added all interactivity here for potential SSR.
   * But actually can be done in render() or connectedCallback().
   * @private
   */
  #hydrate() {
    const hasAnimation = parseFloat(
        window.getComputedStyle(this).getPropertyValue('animation-duration'),
    ) > 0;
    this.#setPosition();
    let start;
    const tick = (ts) => {
      if (start === undefined) {
        start = ts;
      }
      if (ts - start >= this.expire || this.#forcedClose) {
        this.dataset.closing = '';
        if (hasAnimation > 0) {
          this.style.animationPlayState = 'running';
        } else {
          this.#close();
        }
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    this.addEventListener('animationend', this.#close);
    if (this.closeable) {
      this.addEventListener('click', this.closeHandler.bind(this));
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
    this.constructor.collection[this.position]
        = this.constructor.collection[this.position].filter((x) => x !== this);
    this.#setPositionAll();
  }
}

window.customElements.define(XZNotify.TAG_NAME, XZNotify);

export default XZNotify;
