// ===============================================================================
// CommonJS module system for Hoyeah Portal
// Version: v2.1.1
//
// API:
//      type ModuleConfig = {root: string}
//      type IncludeFunction = (path: string) => any;
//      type RequireFunction = (path: string) => any;
//      type DefinitionEntry = (require: RequireFunction, include: IncludeFunction) => any;
//
//      Module.define(definition: number | array | object | DefinitionEntry) : any
//      Module.main(config: ModuleConfig, entry: DefinitionEntry) : void
//
// ===============================================================================

"use strict";

/**
 * @typedef {{root: string}} ModuleConfig
 * @typedef {(path: string) => any} IncludeFunction
 * @typedef {(path: string) => any} RequireFunction
 * @typedef {(require: RequireFunction, include: IncludeFunction) => any} DefinitionEntry
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var ModuleError = function (Error, Object) {
    /**
     * @constructor
     * @param {string} message 
     */
    function ModuleError(message) {
        // Super constructor
        Error.call(this);

        // Fields override
        this.name = "ModuleError";
        this.message = message;
    };

    ModuleError.prototype = Object.create(Error.prototype);
    ModuleError.prototype.constructor = ModuleError;

    return ModuleError;
}(Error, Object);

/**
 * The module manager
 */
var Module = function (ModuleError, SyntaxError, portalHelper, portalManager, cc) {
    var PATH_REGEXP = /^(\.|\.\.|[a-zA-Z0-9\_\-]+)?(\/(\.|\.\.|[a-zA-Z0-9\_\-\.]+))*$/;

    /** @type {{[key: string] : any}} */
    var moduleStorage = {};

    var rootPath = "";
    var loadingPath = "";
    var loadingDirectory = "";

    /** @return {string} */
    function currentLoadingPath() {
        return loadingPath;
    }

    /** @return {string} */
    function currentLoadingDirectory() {
        return loadingDirectory;
    }

    /**
     * Convert relative path to absolute path
     * @param {string} path relative path
     * @return {string} absolute path
     */
    function getAbsolutePath(path) {
        // We should announce the path is invalid to others
        if (!PATH_REGEXP.test(path)) {
            throw new ModuleError("Path is not valid: " + path);
        }

        var result = "";

        var parts = path.split("/");
        for (var i = 0, n = parts.length; i < n; i++) {
            var part = parts[i];

            if (part === ".") {
                continue;
            } else if (part === "..") {
                var lastIndex = result.lastIndexOf("/");
                result = result.substring(0, lastIndex);
            } else {
                if (result.length > 0) {
                    result += "/" + part;
                } else {
                    result = part;
                }
            }
        }

        return result;
    }

    /**
     * 
     * @param {string} path
     * @return {string} 
     */
    function getDirectoryFromFilePath(path) {
        var directory = path.substring(0, path.lastIndexOf("/"));
        return directory;
    }

    /** 
     * Load script
     * @param {string} path
     * @return {void}
     */
    function loadScript(path) {
        var directory = getDirectoryFromFilePath(path);

        //let oldLoadingPath = loadingPath;
        //let oldLoadingDirectory = loadingDirectory;

        loadingPath = path;
        loadingDirectory = directory;

        if (typeof portalHelper !== "undefined" && typeof portalHelper.loadScript === "function") {
            if (!portalHelper.loadScript(path)) {
                throw new ModuleError("Failed to load script: " + path);
            }
        } else if (typeof portalManager !== "undefined" && typeof portalManager.runScript === "function") {
            if (!portalManager.runScript(path)) {
                throw new ModuleError("Failed to load script: " + path);
            }
        } else {
            try {
                require(path); // ccjs require function
                cc.sys.cleanScript(path);
            } catch (e) {
                var reason = "";
                if (e instanceof SyntaxError) {
                    reason = "SyntaxError: " + path + ":" + e.lineNumber + ":" + e.columnNumber + ": " + e.message;
                    cc.log("ModuleJS", reason);
                } else {
                    reason = "Failed to load script: " + path;
                    cc.log("ModuleJS", "Failed to load script: " + path, e.message);
                }

                throw new ModuleError(reason);
            }
        }

        //loadingPath = oldLoadingPath;
        //loadingDirectory = oldLoadingDirectory;
    }

    /** 
     * Create a module dependent loader function that use relative path solution
     * @param {string} basePath
     * @return {RequireFunction}
     */
    function createRequireFunction(basePath, currentFilePath) {
        return function (path) {
            //cc.log("============================ModuleJS: basePath: " + basePath + ", path: " + path);

            var subStringStartIndex = 0;
            while (path.substring(subStringStartIndex, 1) == "/") {
                subStringStartIndex++;
            }
            path = path.substring(subStringStartIndex);

            var fullPath = getAbsolutePath(basePath + "/" + path + ".js");
            if (fullPath === currentFilePath) {
                throw new ModuleError("This module is attempting to load itself. Full path: " + currentFilePath);
            }

            var moduleName = fullPath;
            if (!moduleStorage[moduleName]) {
                moduleStorage[moduleName] = {
                    loaded: false
                };
            }

            var moduleSession = moduleStorage[moduleName];
            if (!moduleSession.loaded) {
                moduleSession.loaded = true;

                loadScript(fullPath);
            }

            return moduleSession.defintion;
        };
    }

    /** 
     * Create a module dependent loader function that use absolute path solution
     * @param {string} rootPath
     * @return {IncludeFunction}
     */
    function createIncludeFunction(rootPath, currentFilePath) {
        return function (path) {
            //cc.log("============================ModuleJS: rootPath: " + basePath + ", path: " + path);

            var subStringStartIndex = 0;
            while (path.substring(subStringStartIndex, 1) == "/") {
                subStringStartIndex++;
            }
            path = path.substring(subStringStartIndex);

            var fullPath = rootPath + "/" + path + ".js";
            if (fullPath === currentFilePath) {
                throw new ModuleError("This module is attempting to load itself. Full path: " + currentFilePath);
            }

            var moduleName = fullPath;
            if (!moduleStorage[moduleName]) {
                moduleStorage[moduleName] = {
                    loaded: false
                };
            }

            var moduleSession = moduleStorage[moduleName];
            if (!moduleSession.loaded) {
                moduleSession.loaded = true;

                loadScript(fullPath);
            }

            return moduleSession.defintion;
        };
    }

    /**
     * Define new module
     * @param {DefinitionEntry} defintion Module defenition
     * @return {any} defined module 
     */
    function define(defintion) {
        // Make sure definition is valid: not null nor undefined
        if (typeof defintion === "undefined") {
            throw new ModuleError("Invalid module definition.");
        }

        // Dependencies of module
        var path = currentLoadingPath();
        var directory = getDirectoryFromFilePath(path);
        var require = createRequireFunction(directory, path);
        var include = createIncludeFunction(rootPath, path);

        // Define new module metadata
        var moduleName = path;
        var moduleSession = moduleStorage[moduleName];
        if (!moduleSession) {
            moduleStorage[moduleName] = moduleSession = {
                loaded: true,
                directory: directory,
                require: require,
                include: include
            };
        }

        // Define true module
        if (typeof defintion === "function") {
            moduleSession.defintion = defintion(require, include);
        } else {
            moduleSession.defintion = defintion;
        }

        // Done.
        return moduleSession.defintion;
    };

    /**
     * Main to the module session
     * @param {ModuleConfig} config
     * @param {DefinitionEntry} entry
     * @return {void}
     */
    function main(config, entry) {
        if ((typeof config === "undefined" ? "undefined" : _typeof(config)) !== "object") {
            throw new ModuleError("Requiring a valid config to start new module session.");
        }

        if (typeof entry !== "function") {
            throw new ModuleError("Entry to new module session is not valid, must be a function.");
        }

        if (config.path) {
            cc.log("ModuleJS", "config.path is deprecated.");
        }

        // Clear loaded modules
        moduleStorage = {};

        // Set new session fields
        rootPath = config.root || config.path || rootPath;
        loadingPath = "";
        loadingDirectory = rootPath;

        // Start the entry
        var require = createRequireFunction(loadingDirectory);
        var include = createIncludeFunction(loadingDirectory);
        entry(require, include);
    }

    // Export
    return {
        main: main, define: define
    };
}(ModuleError, SyntaxError, portalHelper, portalManager, cc);