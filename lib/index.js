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
    constructor (name, pluginPath, bloggifyInstance) {
        super();
        this.name = name;
        this.path = pluginPath;
        this.packagePath = packageJsonPath(this.path);
        this.bloggify = bloggifyInstance;
        this.config = bloggifyInstance.options.pluginConfigs[this.name];
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
        this.bloggify.server.addStaticPath(`/!/bloggify/plugin/${this.name}`, `${this.path}/public`);
        this._load((err, main) => {
            if (err) { return cb(err); }
            let init = main && typeof main.init === "function" ? main.init : main;
            if (typeof init === "function") {
                init.call(this, this.config, this.bloggify, err => {
                    if (err) {
                        if (typeof err === "string") {
                            err = new Error(err);
                        }
                        err.stack = `Error when initializing plugin '${this.name}'\n` + err.stack;
                    }
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
        this.bloggify.log(`Preparing to initialize plugin: ${this.name}`, "info");
        this.prepare((err, data) => {
            if (err) { return cb(err); }
            this.bloggify.log(`Initializing plugin: ${this.name}`, "info");
            this._init(err => {
                if (err) {
                    this.bloggify.log(`Failed to initialize plugin: ${this.name}`, "error");
                    this.bloggify.log(err, "error");
                } else {
                    this.bloggify.log(`Successfully initialized plugin: ${this.name}`, "log");
                }
                this.bloggify.emit("plugin-loaded:" + this.name, this, this._module, err);
                cb(err);
            });
        });
    }

    prepare (cb) {
        this.getPackage((err, data) => {
            if (err && err.code === "ENOENT") {
                this.bloggify.log(`The package.json file was not found in '${this.packagePath}'. Please check if the '${this.name}' module is installed.`, "error");
            }
            if (err) { return cb(err); }
            data = {
                config: this.config
              , package: data
              , main: data.main
              , bloggify: ul.deepMerge(data.bloggify, DEFAULT_BLOGGIFY_FIELD)
            };
            this.config = ul.deepMerge(this.config, data.config, data.bloggify.config);
            if (this.bloggify.assets) {
                this.bloggify.assets.add(this.config.bloggify);
            }
            this.package = data.package;
            this.mainScript = data.main;
            cb(null, data);
        });
    }

    getConfig () {
        return this.config;
    }

    getPackage (cb) {
        return readJson(this.packagePath, cb);
    }
};
