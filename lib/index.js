"use strict"

const packageJsonPath = require("package-json-path")
    , readJson = require("r-json")
    , sameTime = require("same-time")
    , ul = require("ul")
    , EventEmitter = require("events").EventEmitter
    , path = require("path")
    , assured = require("assured")
    , maybeRequire = require("maybe-require")


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
    constructor (name, pluginPath, config) {
        super()
        this.name = name
        this.path = pluginPath
        this.packagePath = packageJsonPath(this.path)
        this.configFile = path.resolve(this.path, "bloggify")
        this.pluginConfig = maybeRequire(this.configFile, true)
        this.configDefaults = this.pluginConfig.config
        this.config = config
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
                Bloggify.log(`The package.json file was not found in '${this.packagePath}'. Please check if the '${this.name}' module is installed.`, "error")
            }
            if (err) { return cb(err); }
            data = {
                config: this.config
              , package: data
              , main: data.main
            }
            this.config = ul.deepMerge(this.config, this.configDefaults)
            this.package = data.package
            this.mainScript = data.main
            Bloggify.handleBundleConfig(this.pluginConfig, this.path)
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
            if (!this.mainScript) {
                return cb(null, {})
            }
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
        cb = assured(cb)

        Bloggify.server.addStaticPath(`${Bloggify.paths._paths.plugin}${this.name}`, `${this.path}/public`)

        this._load((err, main) => {
            if (err) { return cb(err); }
            let init = main && typeof main.init === "function" ? main.init : main

            // Init the theme templates and error pages
            if (this.config.init_theme !== false && Array.isArray(this.config.templates)) {
                this.config.templates.forEach(c => {
                    const tmpl = Bloggify.renderer.registerTemplate(path.resolve(__dirname, "..", c))
                    tmpl.data = { theme: this.config.options }
                })
                Bloggify.server.errorPages({
                    notFound (ctx) {
                        ctx.render("404");
                    },
                    serverError (ctx) {
                        ctx.render("500");
                    }
                })
            }

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
                const maybePromise = init.call(this, this.config, done)
                if (maybePromise && typeof maybePromise.then === "function") {
                    maybePromise.then(data => {
                        done()
                    }).catch(err => {
                        done(err)
                    })
                } else if (init.length <= 1) {
                    cb(null)
                }
            } else {
                cb(null)
            }
        })
        return cb._
    }

    /**
     * init
     * Initializes the plugin.
     *
     * @param {Function} cb The callback function.
     */
    init () {
        Bloggify.log(`Preparing to initialize plugin: ${this.name}`, "info")

        const prom = this._prepare().then(data => {
            Bloggify.log(`Initializing plugin: ${this.name}`, "info")
            return this._init()
        }).then(() => {
            Bloggify.log(`Successfully initialized plugin: ${this.name}`, "log")
            Bloggify.emit("plugin-loaded:" + this.name, this, this._module, null)
        })

        prom.catch(err => {
            Bloggify.log(`Failed to initialize plugin: ${this.name}`, "error")
            Bloggify.log(err, "error")
            Bloggify.emit("plugin-loaded:" + this.name, this, this._module, err)
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
