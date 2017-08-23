"use strict"

const packageJsonPath = require("package-json-path")
    , readJson = require("r-json")
    , sameTime = require("same-time")
    , ul = require("ul")
    , EventEmitter = require("events").EventEmitter
    , path = require("path")
    , assured = require("assured")


const DEFAULT_BLOGGIFY_FIELD = {
    config: {}
}

module.exports = class BloggifyPlugin extends EventEmitter {

    /**
     * BloggifyPlugin
     * Creates a new Bloggify plugin instance.
     *
     * @name BloggifyPlugin
     * @param {String} name The plugin name.
     * @param {String} pluginPath The plugin path.
     * @param {Bloggify} bloggifyInstance The Bloggify instance.
     * @returns {BloggifyPlugin} The `BloggifyPlugin` instance containing:
     *
     *  - `name` (String): The plugin's name.
     *  - `path` (String): The path to the plugin's directory.
     *  - `packagePath` (String): The path to the plugin's `package.json` file.
     *  - `bloggify` (Bloggify): The `Bloggify` instance.
     *  - `config` (Object): The plugin's configuration.
     *
     */
    constructor (name, pluginPath, bloggifyInstance) {
        super()
        this.name = name
        this.path = pluginPath
        this.packagePath = packageJsonPath(this.path)
        this.bloggify = bloggifyInstance
        this.config = bloggifyInstance.options.pluginConfigs[this.name]
    }

    /*!
     * _prepare
     * Prepares the plugin initialization.
     *
     * @name _prepare
     * @param {Function} cb The callback function.
     * @return {Promise} A promise.
     */
    _prepare (cb) {
        cb = assured(cb)
        this.getPackage((err, data) => {
            if (err && err.code === "ENOENT") {
                this.bloggify.log(`The package.json file was not found in '${this.packagePath}'. Please check if the '${this.name}' module is installed.`, "error")
            }
            if (err) { return cb(err); }
            data = {
                config: this.config
              , package: data
              , main: data.main
              , bloggify: ul.deepMerge(data.bloggify, DEFAULT_BLOGGIFY_FIELD)
            }
            this.config = ul.deepMerge(this.config, data.config, data.bloggify.config)
            this.package = data.package
            this.mainScript = data.main
            if (this.bloggify.handleBundleConfig) {
                this.bloggify.handleBundleConfig(this.package.bloggify, this.path)
            }
            cb(null, data)
        })
        return cb._
    }

    /*!
     * _load
     * Loads the plugin content. This function does the actual `require`.
     *
     * @name _load
     * @param {Function} cb The callback function.
     */
    _load (cb) {
        cb = assured(cb)
        process.nextTick(() => {
            let fullPath = this.getFilePath(this.mainScript)
            try {
                this._module = require(fullPath)
            } catch (e) {
                e.stack = "Error when requiring: " + fullPath + "\n" + e.stack
                return cb(e, this._module)
            }
            cb(null, this._module)
        })
        return cb._
    }

    /**
     * getFilePath
     * Returns the path of the searched file.
     *
     * @param  {String} fileName The name of the file who's path is being searched.
     * @return {String} The file's path.
     */
    getFilePath (fileName) {
        return path.join(this.path, fileName)
    }

    /*!
     * _init
     * Calls the init function exported by the plugin.
     *
     * @name _init
     * @param {Function} cb The callback function.
     */
    _init (cb) {
        this.bloggify.server.addStaticPath(`/!/bloggify/plugin/${this.name}`, `${this.path}/public`)
        this._load((err, main) => {
            if (err) { return cb(err); }
            let init = main && typeof main.init === "function" ? main.init : main
            if (typeof init === "function") {
                const done = err => {
                    if (err) {
                        if (typeof err === "string") {
                            err = new Error(err)
                        }
                        err.stack = `Error when initializing plugin '${this.name}'\n` + err.stack
                    }
                    cb(err)
                }

                const maybePromise = init.call(this, this.config, this.bloggify, done)
                if (typeof maybePromise.then === "function") {
                    maybePromise.then(data => {
                        done()
                    }).catch(err => {
                        done(err)
                    })
                } else if (init.length <= 2) {
                    cb(null)
                }
            } else {
                cb(null)
            }
        })
    }

    /**
     * init
     * Initializes the plugin.
     *
     * @param {Function} cb The callback function.
     */
    init () {
        this.bloggify.log(`Preparing to initialize plugin: ${this.name}`, "info")
        const prom = this._prepare().then(data => {
            this.bloggify.log(`Initializing plugin: ${this.name}`, "info")
            return this._init()
        }).then(() => {
            this.bloggify.log(`Successfully initialized plugin: ${this.name}`, "log")
            this.bloggify.emit("plugin-loaded:" + this.name, this, this._module, null)
        })

        prom.catch(err => {
            this.bloggify.log(`Failed to initialize plugin: ${this.name}`, "error")
            this.bloggify.log(err, "error")
            this.bloggify.emit("plugin-loaded:" + this.name, this, this._module, err)
        })
        return prom
    }

    /**
     * getConfig
     * Returns plugin's configuration.
     *
     * @return {Object} The configuration content.
     */
    getConfig () {
        return this.config
    }

    /**
     * getPackage
     * Returns the plugin's package file.
     *
     * @param  {Function} cb The callback function.
     * @return {Object} The package contents.
     */
    getPackage (cb) {
        return readJson(this.packagePath, cb)
    }
}
