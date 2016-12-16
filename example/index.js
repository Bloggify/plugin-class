"use strict";

const BloggifyPluginClass = require("../lib");

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
