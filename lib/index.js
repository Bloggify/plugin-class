"use strict";

const packageJsonPath = require("package-json-path")
    , readJson = require("r-json")
    , sameTime = require("same-time")
    , ul = require("ul")
    , EventEmitter = require("events").EventEmitter
    , path = require("path")
    ;

const DEFAULT_BLOGGIFY_FIELD = {
    config: {}
};

module.exports = class BloggifyPlugin extends EventEmitter {
    /**
     * bloggifyPluginClass
     * A library for managing plugin objects.
     *
     * @name bloggifyPluginClass
     * @function
     * @param {Number} a Param descrpition.
     * @param {Number} b Param descrpition.
     * @return {Number} Return description.
     */
    constructor (name, pluginPath, configPath, bloggifyInstance) {
        super();
        this.name = name;
        this.path = pluginPath;
        this.configPath = configPath;
        this.packagePath = packageJsonPath(this.path);
        this.bloggify = bloggifyInstance;
    }

    getFilePath (fileName) {
        return path.join(this.path, fileName);
    }

    _load (cb) {
        let fullPath = this.getFilePath(this.mainScript);
        try {
            this._module = require(fullPath);
        } catch (e) {
            e.stack = "Error when requiring: " + fullPath + "\n" + e.stack;
            return cb(e, this._module);
        }
        cb(null, this._module);
    }

    _init (cb) {
        this._load((err, main) => {
            if (err) { return cb(err); }
            let init = main && typeof main.init === "function" ? main.init : main;
            if (typeof init === "function") {
                init.call(this, this.config, this.bloggify, err => {
                    cb(err);
                });

                if (init.length <= 2) {
                    cb(null);
                }
            } else {
                cb(null);
            }
        });
    }

    init (cb) {
        this.prepare((err, data) => {
            if (err) { return cb(err); }
            this._init(cb);
            this.bloggify.emit("plugin-loaded:" + this.name, this, this._module);
        });
    }

    prepare (cb) {
        sameTime([
            cb => this.getConfig(cb)
          , cb => this.getPackage(cb)
        ], (err, data) => {
            if (err) { return cb(err); }
            data = {
                config: data[0]
              , package: data[1]
              , main: data[1].main
              , bloggify: ul.deepMerge(data[1].bloggify, DEFAULT_BLOGGIFY_FIELD)
            };
            this.config = ul.deepMerge(data.config, data.bloggify.config);
            this.package = data.package;
            this.mainScript = data.main;
            cb(null, data);
        });
    }

    getConfig (cb) {
        let conf = {};
        try {
            conf = require(this.configPath);
        } catch (e) {
            if (e.code === "MODULE_NOT_FOUND") {
                return cb(null, conf, e);
            }
            return cb(e, conf);
        }
        cb(null, conf);
    }

    getPackage (cb) {
        return readJson(this.packagePath, cb);
    }
};
