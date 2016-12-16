
# bloggify-plugin-class

 [![Patreon](https://img.shields.io/badge/Support%20me%20on-Patreon-%23e6461a.svg)][patreon] [![PayPal](https://img.shields.io/badge/%24-paypal-f39c12.svg)][paypal-donations] [![AMA](https://img.shields.io/badge/ask%20me-anything-1abc9c.svg)](https://github.com/IonicaBizau/ama) [![Version](https://img.shields.io/npm/v/bloggify-plugin-class.svg)](https://www.npmjs.com/package/bloggify-plugin-class) [![Downloads](https://img.shields.io/npm/dt/bloggify-plugin-class.svg)](https://www.npmjs.com/package/bloggify-plugin-class) [![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/johnnyb?utm_source=github&utm_medium=button&utm_term=johnnyb&utm_campaign=github)

> A library for managing plugin objects.

## :cloud: Installation

```sh
$ npm i --save bloggify-plugin-class
```


## :clipboard: Example



```js
const BloggifyPluginClass = require("bloggify-plugin-class");

// Create a new plugin
let myPlugin = return new BloggifyPlugin(
    "foo"
  , "path/to/foo"
    // This should be the Bloggify instance
  , bloggify
);

// And initialize it
myPlugin.init((err, data) => {
    // Do something after initialization
    ...
});
```

## :memo: Documentation

### BloggifyPlugin

Creates a new Bloggify plugin instance.

#### Params
- **String** `name`: The plugin name.
- **String** `pluginPath`: The plugin path.
- **Bloggify** `bloggifyInstance`: The Bloggify instance.

#### Return
- **BloggifyPlugin** The `BloggifyPlugin` instance containing:
 - `name` (String): The plugin's name.
 - `path` (String): The path to the plugin's directory.
 - `packagePath` (String): The path to the plugin's `package.json` file.
 - `bloggify` (Bloggify): The `Bloggify` instance.
 - `config` (Object): The plugin's configuration.

### `getFilePath(fileName)`
Returns the path of the searched file.

#### Params
- **String** `fileName`: The name of the file who's path is being searched.

#### Return
- **String** The file's path.

### `init(cb)`
Initializes the plugin.

#### Params
- **Function** `cb`: The callback function.

### `getConfig()`
Returns plugin's configuration.

#### Return
- **Object** The configuration content.

### `getPackage(cb)`
Returns the plugin's package file.

#### Params
- **Function** `cb`: The callback function.

#### Return
- **Object** The package contents.



## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].


## :moneybag: Donations

Another way to support the development of my open-source modules is
to [set up a recurring donation, via Patreon][patreon]. :rocket:

[PayPal donations][paypal-donations] are appreciated too! Each dollar helps.

Thanks! :heart:


## :scroll: License

[MIT][license] © [Ionică Bizău][website]

[patreon]: https://www.patreon.com/ionicabizau
[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2016#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md
