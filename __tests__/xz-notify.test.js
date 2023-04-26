import XZNofity from '../index.js';

describe('Should test', () => {
  let component;
  beforeAll(() => {
    window.customElements.define(XZNofity.TAG_NAME, XZNofity);
  });

  afterEach(() => {
    if (document.body.contains(component)) {
      document.body.removeChild(component);
    }
  });

  it('should instance of XZNotify', () => {
    component = XZNofity.create('Hello world');
    expect(component).toBeInstanceOf(XZNofity);
  });

  it('should render default notification', () => {
    component = XZNofity.create('Hello world');
    document.body.appendChild(component);
    expect(component.parentElement).toBe(document.body);
  });

  it('should render notification with trusted content', () => {
    component = XZNofity.create('<p>Hello <b>world</b></p>', {}, true);
    document.body.appendChild(component);
    const p = component.shadowRoot.querySelector('p');
    const b = component.shadowRoot.querySelector('b');
    expect(p).not.toBeNull();
    expect(b).not.toBeNull();
  });

  it('should render notification without trusted content', () => {
    component = XZNofity.create('<p>Hello <b>world</b></p>', {}, false);
    document.body.appendChild(component);
    const p = component.shadowRoot.querySelector('p');
    const b = component.shadowRoot.querySelector('b');
    expect(p).toBeNull();
    expect(b).toBeNull();
  });

  it('should create notification with defaults and reflect to props', () => {
    component = XZNofity.create('Hello world!');
    document.body.appendChild(component);
    expect(component.position).toBe(XZNofity.defaults.POSITION);
    expect(component.type).toBe(XZNofity.defaults.TYPE);
    expect(component.expire).toBe(XZNofity.defaults.EXPIRE);
    expect(component.closeable).toBe(XZNofity.defaults.CLOSEABLE);
  });

  it('should create notification with attributes and reflect to props', () => {
    component = XZNofity.create('Hello world!', {
      position:  XZNofity.position.N,
      type:      XZNofity.types.SUCCESS,
      expire:    2000,
      closeable: true,
    });
    document.body.appendChild(component);
    expect(component.position).toBe(XZNofity.position.N);
    expect(component.getAttribute('position')).toBe(XZNofity.position.N);
    expect(component.type).toBe(XZNofity.types.SUCCESS);
    expect(component.getAttribute('type')).toBe(XZNofity.types.SUCCESS);
    expect(component.expire).toBe(2000);
    expect(component.getAttribute('expire')).toBe('2000');
    expect(component.closeable).toBe(true);
    expect(component.hasAttribute('closeable')).toBe(true);
  });

  it('should have css set', () => {
    component = XZNofity.create('Hello world!');
    expect(component.css.length).toBeGreaterThan(0);
  });

  describe('positions', () => {
    Object.entries(XZNofity.position).forEach(([k, v]) => {
      it(`it should position ${k}`, () => {
        const component = XZNofity.create('Hi', {
          position: v,
        });
        document.body.appendChild(component);
        expect(component.position).toBe(XZNofity.position[k]);
        component.remove();
      });
    });

    it('should position in different directions', () => {
      const comps = [
        XZNofity.create('foo', {position: XZNofity.position.N}),
        XZNofity.create('bar', {position: XZNofity.position.N}),
        XZNofity.create('bar', {position: XZNofity.position.S}),
        XZNofity.create('var', {position: XZNofity.position.S}),
        XZNofity.create('jar', {position: XZNofity.position.S}),
        XZNofity.create('jar', {position: XZNofity.position.NE}),
        XZNofity.create('xyzzy', {position: XZNofity.position.NE}),
        XZNofity.create('cow', {position: XZNofity.position.NE}),
        XZNofity.create('farm', {position: XZNofity.position.NE}),
      ];

      comps.forEach((x) => document.body.appendChild(x));

      expect(XZNofity.collection[XZNofity.position.N].length).toBe(2);
      expect(XZNofity.collection[XZNofity.position.S].length).toBe(3);
      expect(XZNofity.collection[XZNofity.position.NE].length).toBe(4);

      comps.forEach((x) => x.remove());
    });
  });

  describe('hydration', () => {
    beforeEach(() => {
      let ts = 0;
      jest.useFakeTimers();
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(++ts);
      });
    });

    afterEach(() => {
      window.requestAnimationFrame.mockRestore();
      jest.useRealTimers();
    });

    it('should be removed after animation', () => {
      const component = XZNofity.create('foobar', {
        expire: 1, // 1ms
      });
      document.body.appendChild(component);
      expect(component.dataset.closing).toBe('');
      component.remove();
    });

    it('should be clicked and closed when closeable', () => {
      const component = XZNofity.create('foobar', {
        expire: 1, // 1ms
        closeable: true,
      });
      document.body.appendChild(component);
      component.dispatchEvent(new MouseEvent('click'));
      component.click();
      expect(component.dataset.closing).toBe('');
      component.remove();
    });
  });
});
