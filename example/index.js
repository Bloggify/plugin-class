"use strict";

var BloggifyPluginClass = require("../lib");

// Create a new plugin
var myPlugin = new BloggifyPlugin("foo", "path/to/foo");

// And initialize it
myPlugin.init(function (err, data) {
    // Do something after initialization
    // ...
});