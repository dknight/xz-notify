import XZNotify from './src/xz-notify';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['xz-notify']: XZNotify;
    }
  }
}
