# XZ notify

XZNotify is a framework-agnostic web component to show floating notifications on the web-page.

Check out the [demo page](https://www.whoop.ee/xz-notify/demo) for more examples.

## Install

[NPM Package](https://www.whoop.ee/package/xz-notify)

```sh
npm install --save zx-notify
```

Or just download the source and include it in your HTML.

## Usage

You can create as many notifications as you want. These will be automatically positioned and removed from the DOM after they expire or are closed.

XZNotify is a module. First of all, you need to include it in your project. At the moment, there are two ways to do it:

#### script tag way

```html
<script type="module" src="./xz-notify.js"></script>
```

#### import way

```js
import XZNotify from 'xz-notify';
```

After being added, there will be a custom HTML element `<xz-notify>` defined in your document.

### Basic usage

The notification can be inserted directly into your HTML, and it will be destroyed as soon as it expires.

```html
<xz-notify type="info" expire="10000" position="ne">
  Hello world!
</xz-notify>
```

Another way is to make it programmatically and append it to any element, but `<body>` or something like `<main>` is recommended.

```js
const notification = XZNotify.create('Hello world', {
  type: 'info',
  expire: 10000,
  position: 'ne',
});
document.body.appendChild(notification);
```

## API

##### XZNotify

Class has some properties that are reflected in HTML attributes.

| name      | type     | default   | description.
|-----------|----------|-----------|-----|
| expire    | number   | 10000     | Time in milliseconds. How long the notification will be displayed. If expire is zero or less, the notification will be closed immediately. If the expiration value cannot be parsed into a number, then the default fallback is used. |
| type      | string   | "default" | Type of the notification. There are built-in types: default, info, success, warning, and error. |
| position  | string   | "ne"      | Position of the notification o the screen. Position corresponds to point of compass: n (north), ne (north-east), s (south), etc. |
| closeable | boolean  | false     | If it is set, clicking on the notification will close it. |
| grouped   | boolean  | false     | If grouped is set, then the offset position is not recalculated and notifications are stacked. |
| heading   | string   | null      | The heading of the notification. |

##### create(content, attributes?, trusted?)

Method to create XZNotify instance.

| name       | type     | default | description |
|------------|----------|---------|-------------|
| content    | string   |         | Content of the notification. |
| attributes | Object   | {}      | Attributes of the `<xz-notify>` element. |
| trusted    | boolean  | false   | If `true` then HTML is allowed in content. Might not be safe for XSS. |

##### Events

Notification dispatches custom events on the open state and when expired.

| event name      | detail   |
|-----------------|----------|
| xz-notify:open  | XZNotify |
| xz-notify:close | XZNotify |

```js
document.body.addEventListener('xz-notify:open', (e) => console.log(e));
document.body.addEventListener('xz-notify:close', (e) => console.log(e));
```


## Styling

Use the full power of CSS to style notifications. Just declare style wherever you want and overwrite defaults in the manner of:

```css
xz-notify {
  border: 2px solid #000;
  color: #000;
  background: none;
  /* etc... */
}
```
### Custom properties

XZNotify exposes some useful CSS custom properties. Most likely, you won't change them manually. 

* `--xz-notify-heading-color`
* `--xz-notify-zIndex` 
* `--xz-notify-background-color`


### Themes

Include the theme in the HTML file:

```html
<link rel="stylesheet" href="bootstrap.css">
```

At the moment, there are some built-in themes.

* default
* bootstrap
* simple

## Contribution

Any help is appreciated. Found a bug, typo, inaccuracy, etc.?
Please do not hesitate to make a pull request or file an issue.

## License

MIT 2023