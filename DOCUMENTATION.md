## Documentation

You can see below the API reference of this module.

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

