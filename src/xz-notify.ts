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

type Position = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
type Type = 'default' | 'info' | 'warning' | 'success' | 'error';

interface XZNotifyProps {
  grouped: boolean;
  position: Position;
  expire: number;
  type: Type;
  closeable: boolean;
  heading: string | null;
  connectedCallback(): void;
  disconnectedCallback(): void;
  close(): void;
  closeHandler(e: MouseEvent | PointerEvent): void;
}

class XZNotify extends HTMLElement implements XZNotifyProps {
  /**
   * XZNotify HTML tag name.
   */
  static TAG_NAME: string = 'xz-notify';

  /**
   * Observed attributes if required. Usually, a notification's life is very
   * short, and there is no point in observing attributes.
   */
  static observedAttributes: string[] = [];

  /**
   * Notification's possible types.
   */
  static types: Record<string, Type> = {
    DEFAULT: 'default',
    INFO: 'info',
    WARNING: 'warning',
    SUCCESS: 'success',
    ERROR: 'error',
  };

  /**
   * Events for the component.
   */
  static events = {
    OPEN: new CustomEvent('xz-notify:open', {bubbles: true}),
    CLOSE: new CustomEvent('xz-notify:close', {bubbles: true}),
  };

  /**
   * Positioning constants.
   */
  static positions: Record<string, Position> = {
    N: 'n',
    NE: 'ne',
    E: 'e',
    SE: 'se',
    S: 's',
    SW: 'sw',
    W: 'w',
    NW: 'nw',
  };

  /**
   * Contains currently opened notifications.
   */
  static collection: Record<keyof typeof XZNotify.positions, XZNotify[]> = {
    [XZNotify.positions.N]: [],
    [XZNotify.positions.NE]: [],
    [XZNotify.positions.E]: [],
    [XZNotify.positions.SE]: [],
    [XZNotify.positions.S]: [],
    [XZNotify.positions.SW]: [],
    [XZNotify.positions.W]: [],
    [XZNotify.positions.NW]: [],
  };

  static defaults = {
    EXPIRE: 10000,
    TYPE: XZNotify.types.INFO,
    POSITION: XZNotify.positions.NE,
    CLOSEABLE: false,
    GROUPED: false,
    HEADING: null,
  };

  /**
   * Creates a new XZNotify element. Recommended to use when creating
   * notifications.
   */
  static create = (
    content: string,
    props: Record<string, string | number | boolean | null> = {},
    trusted: boolean = false
  ): XZNotify => {
    const elem = document.createElement(this.TAG_NAME) as XZNotify;
    Object.entries(props).forEach(
      ([k, v]: [string, string | boolean | number | null]) => {
        if (v === false || v === null) {
          return;
        }
        elem.setAttribute(k, String(v));
      }
    );
    elem[trusted ? 'innerHTML' : 'textContent'] = content;
    return elem;
  };

  /**
   * Constructor is always called before an instance of notification is
   * connected to the DOM.
   */
  constructor(
    private root: ShadowRoot,
    private styleElem: HTMLStyleElement,
    private forcedClose: boolean = false,
    public grouped: boolean = XZNotify.defaults.GROUPED,
    public position: Position = XZNotify.positions.NE,
    public expire: number = XZNotify.defaults.EXPIRE,
    public type: Type = XZNotify.defaults.TYPE,
    public closeable: boolean = true,
    public heading: string | null
  ) {
    super();
    this.root = this.attachShadow({mode: 'open'});
    this.styleElem = document.createElement('style');
    this.styleElem.textContent = `{{CSS}}`;
  }

  /**
   * Calculates and sets the position of the notification.
   */
  private setPosition(): void {
    const i = this.grouped ? 0 : this.findIndex();
    const [x, y]: [string, string] = this.calcBasePosition();
    const [dx, dy] = this.calcOffsetPosition(i);
    this.style.setProperty('--xz-notify-left', `calc(${x} - ${dx}px)`);
    this.style.setProperty('--xz-notify-top', `calc(${y} + ${dy}px)`);
    if (this.grouped) {
      const c = XZNotify.collection[this.position].length;
      this.style.setProperty('--xz-notify-zIndex', String(1e4 - c));
    }
  }

  /**
   * Gets the index of the current notification in collection.
   */
  private findIndex() {
    return XZNotify.collection[this.position].findIndex((x) => x === this);
  }

  /**
   * Calculates base position.
   */
  private calcBasePosition(): [string, string] {
    switch (this.position) {
      case XZNotify.positions.N:
        return ['50%', '0%'];
      default:
      case XZNotify.positions.NE:
        return ['100%', '0%'];
      case XZNotify.positions.E:
        return ['100%', '50%'];
      case XZNotify.positions.SE:
        return ['100%', '100%'];
      case XZNotify.positions.S:
        return ['50%', '100%'];
      case XZNotify.positions.SW:
        return ['0%', '100%'];
      case XZNotify.positions.W:
        return ['0%', '50%'];
      case XZNotify.positions.NW:
        return ['0%', '0%'];
    }
  }

  /**
   * Calculates offset position.
   */
  calcOffsetPosition(i: number): [number, number] {
    const rect = this.getBoundingClientRect();
    const styles = getComputedStyle(this);
    const mt = Number.parseInt(styles.getPropertyValue('margin-top'));
    const mr = Number.parseInt(styles.getPropertyValue('margin-right'));
    const mb = Number.parseInt(styles.getPropertyValue('margin-bottom'));
    const ml = Number.parseInt(styles.getPropertyValue('margin-left'));
    switch (this.position) {
      case XZNotify.positions.N:
        return [rect.width / 2, i * (rect.height + mt)];
      default:
      case XZNotify.positions.NE:
        return [rect.width + ml + mr, i * (rect.height + mt)];
      case XZNotify.positions.E:
        return [(i + 1) * (rect.width + ml + mr), -(rect.height / 2 + mt + mb)];
      case XZNotify.positions.SE:
        return [rect.width + ml + mr, -(i + 1) * (rect.height + mt + mb)];
      case XZNotify.positions.S:
        return [rect.width / 2, -(i + 1) * (rect.height + mt + mb)];
      case XZNotify.positions.SW:
        return [0, -(i + 1) * (rect.height + mt + mb)];
      case XZNotify.positions.W:
        return [i * -(rect.width + ml), -(rect.height / 2 + mt + mb)];
      case XZNotify.positions.NW:
        return [0, i * (rect.height + mt)];
    }
  }

  /**
   * Re-position all elements.
   */
  private setPositionAll(): void {
    Object.values(XZNotify.collection).forEach((coll) => {
      coll.forEach((x) => this.setPosition.call(x));
    });
  }

  connectedCallback() {
    this.reflectToProperties();
    XZNotify.collection[this.position].push(this);
    this.dispatchEvent(XZNotify.events.OPEN);
    this.render();
    this.hydrate();
  }

  /**
   * Reflect attributes to properties for convenience.
   * Use default if no attribute set.
   */
  private reflectToProperties(): void {
    const tmpType = this.getAttribute('type') || XZNotify.defaults.TYPE;
    this.type = tmpType.toLowerCase() as Type;
    this.position = (
      this.getAttribute('position') || XZNotify.positions.NE
    ).toLowerCase() as Position;
    const expireTmp = this.getAttribute('expire');
    if (expireTmp === null || Number.isNaN(Number(expireTmp))) {
      this.expire = XZNotify.defaults.EXPIRE;
    } else {
      this.expire = Number(expireTmp);
    }
    this.closeable = this.hasAttribute('closeable');
    this.heading = this.getAttribute('heading');
    this.grouped = this.hasAttribute('grouped');
  }

  /**
   * Renders element.
   */
  private render() {
    this.root.append(this.styleElem);
    this.heading && this.root.appendChild(this.buildHeading());
    this.root.append(...this.childNodes);
    this.setAttribute('role', 'alert');
  }

  /**
   * Builds heading <h3> element.
   */
  private buildHeading(): HTMLHeadingElement {
    const h = document.createElement('h3') as HTMLHeadingElement;
    if (this.heading) {
      h.innerText = this.heading;
    }
    h.classList.add('heading');
    return h;
  }

  /**
   * Added all interactivity here for potential SSR. But it can actually be
   * done in render() or connectedCallback().
   */
  private hydrate() {
    const hasAnimation =
      Number.parseFloat(
        window.getComputedStyle(this).getPropertyValue('animation-duration')
      ) > 0;
    this.setPosition();
    let start: number;
    const tick = (ts: number) => {
      if (start === undefined) {
        start = ts;
      }
      if (ts - start >= this.expire || this.forcedClose) {
        this.dataset.closing = 'true';
        if (hasAnimation) {
          this.style.animationPlayState = 'running';
        } else {
          this.close();
        }
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    this.addEventListener('animationend', this.close);
    if (this.closeable) {
      this.addEventListener('click', this.closeHandler.bind(this));
    }
  }

  /**
   * Closes the notification.
   */
  close(): void {
    if (!this.dataset.closing) {
      this.style.animationPlayState = 'paused';
      return;
    }
    this.dispatchEvent(XZNotify.events.CLOSE);
    this.remove();
  }

  /**
   * Handler when closeable is true and clicked on the notification.
   */
  closeHandler(e: MouseEvent | PointerEvent) {
    this.forcedClose = true;
  }

  disconnectedCallback() {
    XZNotify.collection[this.position] = XZNotify.collection[
      this.position
    ].filter((x) => x !== this);
    this.setPositionAll();
  }
}

window.customElements.define(XZNotify.TAG_NAME, XZNotify);

export default XZNotify;
