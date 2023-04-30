/**
 * XZNotify is a framework-agnostic web component to show floating
 * notifications. The component uses a first-in, first-out queue.data structure,
 * new notifications are automatically appended to the end of the queue.
 * Also, each appended component automatically computes its own position.
 * More details on https://www.github.com/dknight/xz-notify
 *
 * @author Dmitri Smirnov <https://www.whoop.ee/>
 * @license MIT 2023
 * @version {{VERSION}}
 * @extends HTMLElement
 *
 * @property {string} [type="info"] Type of the notification. There are built-in
 * types: default, info, success, warning and error.
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
class XZNotify extends HTMLElement {
  /**
   * XZNotify HTML tag name.
   * @type {string}
   */
  static TAG_NAME = 'xz-notify';

  /**
   * Observed attributes if required. Usually, a notification's life is very
   * short, and there is no point in observing attributes.
   * @type {string[]}
   */
  static observedAttributes = [];

  /**
   * Notification's possible types.
   * @type {Types}
   */
  static types = {
    INFO:    'info',
    WARNING: 'warning',
    SUCCESS: 'success',
    ERROR:   'error',
  };

  /**
   * Events for the component.
   * @type {Events}
   */
  static events = {
    OPEN:  new CustomEvent('xz-notify:open', {bubbles: true}),
    CLOSE: new CustomEvent('xz-notify:close', {bubbles: true}),
  };

  /**
   * Positioning constants.
   * @type {Positions}
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
   * @type {Object<Position, XZNotify[]>}
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
   * @type {Defaults}
   */
  static defaults = {
    EXPIRE:    10000,
    TYPE:      this.types.INFO,
    POSITION:  this.position.NE,
    CLOSEABLE: false,
    GROUPED:   false,
  };

  /**
   * Creates a new XZNotify element. Recommended to use when creating
   * notifications.
   * @param {string} content - Content of the notification.
   * @param {Object<string, string>} [attrs={}] - Attributes of the
   * `<xz-notify>` element.
   * @param {boolean} [trusted=false] - If `true` then HTML is allowed in
   * content. Might not be safe for XSS.
   * @return {XZNotify}
   */
  static create = (content, attrs = {}, trusted = false) => {
    const elem = document.createElement(this.TAG_NAME);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v === false || v === null) {
        return;
      }
      elem.setAttribute(k, v);
    });
    elem[trusted ? 'innerHTML' : 'textContent'] = content;
    return elem;
  };

  // Private vars here please...
  #styleElem = document.createElement('style');
  #forcedClose = false;

  /**
   * Constructor is always called before an instance of notification is
   * connected to the DOM.
   */
  constructor() {
    super();
    this.root = this.attachShadow({mode: 'open'});
    this.#styleElem.textContent = '{{CSS}}';
  }

  /**
   * Calculates and sets the position of the notification.
   */
  #setPosition() {
    const i = this.grouped ? 0 : this.#findIndex();
    const [x, y] = this.#calcBasePosition();
    const [dx, dy] = this.#calcOffsetPosition(i);
    this.style.setProperty('--xz-notify-left', `calc(${x} - ${dx}px)`);
    this.style.setProperty('--xz-notify-top', `calc(${y} + ${dy}px)`);
    if (this.grouped) {
      const c = this.constructor.collection[this.position].length;
      this.style.setProperty('--xz-notify-zIndex', 1e4 - c);
    }
  }

  /**
   * Gets the index of the current notification in collection.
   * @return {number}
   */
  #findIndex() {
    return this.constructor.collection[this.position]
        .findIndex((x) => x === this);
  }

  /**
   * Calculates base position.
   * @return {number[]}
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
   * @param {number} i
   * @return {number[]}
   */
  #calcOffsetPosition(i) {
    const rect = this.getBoundingClientRect();
    const styles = getComputedStyle(this);
    const mt = Number.parseInt(styles.getPropertyValue('margin-top'));
    const mr = Number.parseInt(styles.getPropertyValue('margin-right'));
    const mb = Number.parseInt(styles.getPropertyValue('margin-bottom'));
    const ml = Number.parseInt(styles.getPropertyValue('margin-left'));
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
   * Reflect attributes to properties for convenience.
   * Use default if no attribute set.
   */
  #reflectToProperties() {
    this.type = (this.getAttribute('type')
        || this.constructor.defaults.TYPE).toLowerCase();
    this.position = (this.getAttribute('position')
        || this.constructor.position.NE).toLowerCase();
    this.expire = this.getAttribute('expire');
    if (this.expire === null) {
      this.expire = this.constructor.defaults.EXPIRE;
    } else if (this.expire === '0') {
      this.expire = 0;
    } else {
      this.expire = Number(this.expire);
      if (Number.isNaN(this.expire)) {
        this.expire = this.constructor.defaults.EXPIRE;
      }
    }
    this.closeable = this.hasAttribute('closeable');
    this.heading = this.getAttribute('heading');
    this.grouped = this.hasAttribute('grouped');
  }

  /**
   * Renders element.
   */
  #render() {
    this.root.append(this.#styleElem);
    this.heading && this.root.appendChild(this.#buildHeading());
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
   * Added all interactivity here for potential SSR. But it can actually be
   * done in render() or connectedCallback().
   */
  #hydrate() {
    const hasAnimation = Number.parseFloat(
        window.getComputedStyle(this).getPropertyValue('animation-duration'),
    ) > 0;
    this.#setPosition();
    let start;
    const tick = (ts) => {
      if (start === undefined) {
        start = ts;
      }
      if (ts - start >= this.expire || this.#forcedClose) {
        this.dataset.closing = true;
        if (hasAnimation) {
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
    if (!this.dataset.closing) {
      this.style.animationPlayState = 'paused';
      return;
    }
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

/**
 * @typedef Positions
 * @property {Position} [N="n"]
 * @property {Position} [NE="ne"]
 * @property {Position} [E="e"]
 * @property {Position} [SE="se"]
 * @property {Position} [S="s"]
 * @property {Position} [SW="sw"]
 * @property {Position} [W="w"]
 * @property {Position} [NW="nw"]
 */

/**
 * @typedef Position
 * @property {("n"|"ne"|"e"|"se"|"s"|"sw"|"w"|"nw")}
 */

/**
 * @typedef Types
 * @property {string} [DEFAULT="default"]
 * @property {string} [INFO="info"]
 * @property {string} [WARNING="string"]
 * @property {string} [SUCCESS="string"]
 * @property {string} [ERROR="string"]
 */

/**
 * @typedef Events
 * @property {CustomEvent} OPEN
 * @property {CustomEvent} CLOSE
 */

/**
 * @typedef Defaults
 * @property {number} EXPIRE
 * @property {string} TYPE
 * @property {string} POSITION
 * @property {boolean} CLOSEABLE
 * @property {boolean} GROUPED
 */
