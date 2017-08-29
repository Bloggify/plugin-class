"use strict";

const BloggifyPluginClass = require("../lib");

// Create a new plugin
let myPlugin = new BloggifyPlugin(
    "foo"
  , "path/to/foo"
);

// And initialize it
myPlugin.init((err, data) => {
    // Do something after initialization
    // ...
});
