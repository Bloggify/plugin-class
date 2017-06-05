"use strict";

const BloggifyPluginClass = require("../lib")
    , Bloggify = require("bloggify")
    ;

// Create a new plugin
let myPlugin = return new BloggifyPlugin(
    "foo"
  , "path/to/foo"
  , Bloggify
);

// And initialize it
myPlugin.init((err, data) => {
    // Do something after initialization
    // ...
});
