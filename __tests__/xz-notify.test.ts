import {jest} from '@jest/globals';
import {SpiedFunction} from 'jest-mock';
import XZNotify from '../index';

describe('Should test', () => {
  let component: XZNotify;
  afterEach(() => {
    if (document.body.contains(component)) {
      document.body.removeChild(component);
    }
  });

  it('should instance of XZNotify', () => {
    component = XZNotify.create('Hello world');
    expect(component).toBeInstanceOf(XZNotify);
  });

  it('should have valid tag name', () => {
    component = XZNotify.create('Hello world');
    expect(component.nodeName.toLowerCase()).toBe(XZNotify.TAG_NAME);
  });

  it('should validate observedAttributes', () => {
    expect(XZNotify.observedAttributes).toEqual([]);
  });

  it('should render default notification', () => {
    component = XZNotify.create('Hello world');
    document.body.appendChild(component);
    expect(component.parentElement).toBe(document.body);
  });

  it('should render notification with heading', () => {
    component = XZNotify.create('Hello world', {heading: 'Xyzzy'});
    document.body.appendChild(component);
    expect(component.heading).toBe('Xyzzy');
    expect(component.getAttribute('heading')).toBe('Xyzzy');
  });

  it('should render notification with trusted content', () => {
    component = XZNotify.create('<p>Hello <b>world</b></p>', {}, true);
    document.body.appendChild(component);
    const p = component.shadowRoot!.querySelector('p');
    const b = component.shadowRoot!.querySelector('b');
    expect(p).not.toBeNull();
    expect(b).not.toBeNull();
  });

  it('should render notification without trusted content', () => {
    component = XZNotify.create('<p>Hello <b>world</b></p>', {}, false);
    document.body.appendChild(component);
    const p = component.shadowRoot!.querySelector('p');
    const b = component.shadowRoot!.querySelector('b');
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
    expect(component.grouped).toBe(XZNotify.defaults.GROUPED);
  });

  it('should create notification with attributes and reflect to props', () => {
    component = XZNotify.create('Hello world!', {
      position: XZNotify.positions.N,
      type: XZNotify.types.SUCCESS,
      expire: 2000,
      closeable: true,
      grouped: true,
    });
    document.body.appendChild(component);
    expect(component.position).toBe(XZNotify.positions.N);
    expect(component.getAttribute('position')).toBe(XZNotify.positions.N);
    expect(component.type).toBe(XZNotify.types.SUCCESS);
    expect(component.getAttribute('type')).toBe(XZNotify.types.SUCCESS);
    expect(component.expire).toBe(2000);
    expect(component.getAttribute('expire')).toBe('2000');
    expect(component.closeable).toBe(true);
    expect(component.hasAttribute('closeable')).toBe(true);
    expect(component.closeable).toBe(true);
    expect(component.hasAttribute('grouped')).toBe(true);
  });

  it('should fallback in case of wrong expire value', () => {
    ['abc', null, true].forEach((x) => {
      const component = XZNotify.create('Hello world!', {
        expire: x,
      });
      document.body.appendChild(component);
      expect(component.expire).toBe(XZNotify.defaults.EXPIRE);
      component.remove();
    });
  });

  it('should not reflect falsy properties', () => {
    component = XZNotify.create('Hello world!', {
      closeable: false,
      grouped: false,
    });
    document.body.appendChild(component);
    expect(component.hasAttribute('closeable')).toBe(false);
    expect(component.hasAttribute('grouped')).toBe(false);
  });

  it('should have default styles', () => {
    component = XZNotify.create('Hello world!');
    document.body.appendChild(component);
    const contents = component.shadowRoot!.querySelector('style');
    expect(contents!.textContent!.length).toBeGreaterThan(0);
  });

  describe('positions', () => {
    Object.entries(XZNotify.positions).forEach(([k, v]) => {
      it(`it should position ${k}`, () => {
        const component = XZNotify.create('Hi', {
          position: v,
        });
        document.body.appendChild(component);
        expect(component.position).toBe(XZNotify.positions[k]);
        component.remove();
      });
    });

    it('should position in different directions', () => {
      const comps = [
        XZNotify.create('foo', {position: XZNotify.positions.N}),
        XZNotify.create('bar', {position: XZNotify.positions.N}),
        XZNotify.create('bar', {position: XZNotify.positions.S}),
        XZNotify.create('var', {position: XZNotify.positions.S}),
        XZNotify.create('jar', {position: XZNotify.positions.S}),
        XZNotify.create('jar', {position: XZNotify.positions.NE}),
        XZNotify.create('xyzzy', {position: XZNotify.positions.NE}),
        XZNotify.create('cow', {position: XZNotify.positions.NE}),
        XZNotify.create('farm', {position: XZNotify.positions.NE}),
      ];

      comps.forEach((x) => document.body.appendChild(x));

      expect(XZNotify.collection[XZNotify.positions.N].length).toBe(2);
      expect(XZNotify.collection[XZNotify.positions.S].length).toBe(3);
      expect(XZNotify.collection[XZNotify.positions.NE].length).toBe(4);

      comps.forEach((x) => x.remove());
    });
  });

  describe('hydration', () => {
    let spy: SpiedFunction<
      ((callback: FrameRequestCallback) => number) &
        ((callback: FrameRequestCallback) => number)
    >;
    beforeEach(() => {
      let ts = 0;
      jest.useFakeTimers();
      spy = jest.spyOn(window, 'requestAnimationFrame');
      spy.mockImplementation(
        (cb: FrameRequestCallback) => cb(++ts) as unknown as number
      );
    });

    afterEach(() => {
      spy.mockRestore();
      jest.useRealTimers();
    });

    it('should be removed after animation', () => {
      const component = XZNotify.create('foobar', {
        expire: 1, // 1ms
      });
      document.body.appendChild(component);
      expect(component.dataset.closing).toBe('true');
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
      expect(component.dataset.closing).toBe('true');
      component.remove();
    });

    it('should be without animation', () => {
      const component = XZNotify.create('foobar', {
        expire: 1, // 1ms
        closeable: true,
      });
      component.style.animationDuration = '0s';
      document.body.appendChild(component);
      component.click();
    });
  });

  describe('A11y', () => {
    it('should have role=alert', () => {
      document.body.appendChild(component);
      expect(component.getAttribute('role')).toBe('alert');
    });
  });
});
