import XZNotify from './index';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['xz-notify']: XZNotify;
    }
  }
}
