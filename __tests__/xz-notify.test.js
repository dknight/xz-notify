import XZNotify from '../index.js';

describe('Should test', () => {
  let component;
  afterEach(() => {
    if (document.body.contains(component)) {
      document.body.removeChild(component);
    }
  });

  it('should instance of XZNotify', () => {
    component = XZNotify.create('Hello world');
    expect(component).toBeInstanceOf(XZNotify);
  });

  it('should render default notification', () => {
    component = XZNotify.create('Hello world');
    document.body.appendChild(component);
    expect(component.parentElement).toBe(document.body);
  });

  it('should render notification with title', () => {
    component = XZNotify.create('Hello world', {title: 'Xyzzy'});
    document.body.appendChild(component);
    expect(component.title).toBe('Xyzzy');
    expect(component.getAttribute('title')).toBe('Xyzzy');
  });

  it('should render notification with trusted content', () => {
    component = XZNotify.create('<p>Hello <b>world</b></p>', {}, true);
    document.body.appendChild(component);
    const p = component.shadowRoot.querySelector('p');
    const b = component.shadowRoot.querySelector('b');
    expect(p).not.toBeNull();
    expect(b).not.toBeNull();
  });

  it('should render notification without trusted content', () => {
    component = XZNotify.create('<p>Hello <b>world</b></p>', {}, false);
    document.body.appendChild(component);
    const p = component.shadowRoot.querySelector('p');
    const b = component.shadowRoot.querySelector('b');
    expect(p).toBeNull();
    expect(b).toBeNull();
  });

  it('should create notification with defaults and reflect to props', () => {
    component = XZNotify.create('Hello world!');
    document.body.appendChild(component);
    expect(component.position).toBe(XZNotify.defaults.POSITION);
    expect(component.type).toBe(XZNotify.defaults.TYPE);
    expect(component.expire).toBe(XZNotify.defaults.EXPIRE);
    expect(component.closeable).toBe(XZNotify.defaults.CLOSEABLE);
  });

  it('should create notification with attributes and reflect to props', () => {
    component = XZNotify.create('Hello world!', {
      position:  XZNotify.position.N,
      type:      XZNotify.types.SUCCESS,
      expire:    2000,
      closeable: true,
    });
    document.body.appendChild(component);
    expect(component.position).toBe(XZNotify.position.N);
    expect(component.getAttribute('position')).toBe(XZNotify.position.N);
    expect(component.type).toBe(XZNotify.types.SUCCESS);
    expect(component.getAttribute('type')).toBe(XZNotify.types.SUCCESS);
    expect(component.expire).toBe(2000);
    expect(component.getAttribute('expire')).toBe('2000');
    expect(component.closeable).toBe(true);
    expect(component.hasAttribute('closeable')).toBe(true);
  });

  it('should have css set', () => {
    component = XZNotify.create('Hello world!');
    expect(component.css.length).toBeGreaterThan(0);
  });

  describe('positions', () => {
    Object.entries(XZNotify.position).forEach(([k, v]) => {
      it(`it should position ${k}`, () => {
        const component = XZNotify.create('Hi', {
          position: v,
        });
        document.body.appendChild(component);
        expect(component.position).toBe(XZNotify.position[k]);
        component.remove();
      });
    });

    it('should position in different directions', () => {
      const comps = [
        XZNotify.create('foo', {position: XZNotify.position.N}),
        XZNotify.create('bar', {position: XZNotify.position.N}),
        XZNotify.create('bar', {position: XZNotify.position.S}),
        XZNotify.create('var', {position: XZNotify.position.S}),
        XZNotify.create('jar', {position: XZNotify.position.S}),
        XZNotify.create('jar', {position: XZNotify.position.NE}),
        XZNotify.create('xyzzy', {position: XZNotify.position.NE}),
        XZNotify.create('cow', {position: XZNotify.position.NE}),
        XZNotify.create('farm', {position: XZNotify.position.NE}),
      ];

      comps.forEach((x) => document.body.appendChild(x));

      expect(XZNotify.collection[XZNotify.position.N].length).toBe(2);
      expect(XZNotify.collection[XZNotify.position.S].length).toBe(3);
      expect(XZNotify.collection[XZNotify.position.NE].length).toBe(4);

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
      const component = XZNotify.create('foobar', {
        expire: 1, // 1ms
      });
      document.body.appendChild(component);
      expect(component.dataset.closing).toBe('');
      component.remove();
    });

    it('should be clicked and closed when closeable', () => {
      const component = XZNotify.create('foobar', {
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
