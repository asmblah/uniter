/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    hasOwn = {}.hasOwnProperty,
    phpCommon = require('phpcommon'),
    INCLUDE = 'include',
    PHPError = phpCommon.PHPError,
    Promise = require('./Promise');

/**
 * Allows arbitrary PHP code strings to be compiled and executed,
 * all within the same shared environment (so eg. any classes defined
 * by a script will be usable from future scripts run by this engine)
 *
 * @param {Parser} phpParser
 * @param {Transpiler} phpToJS
 * @param {Runtime} phpRuntime
 * @param {Environment} environment
 * @param {Object} options
 * @constructor
 */
function Engine(phpParser, phpToJS, phpRuntime, environment, options) {
    /**
     * @type {Environment}
     */
    this.environment = environment;
    /**
     * @type {Object}
     */
    this.options = options || {};
    /**
     * @type {Parser}
     */
    this.phpParser = phpParser;
    /**
     * @type {Runtime}
     */
    this.phpRuntime = phpRuntime;
    /**
     * @type {Transpiler}
     */
    this.phpToJS = phpToJS;
}

_.extend(Engine.prototype, {
    /**
     * Sets one or more configuration options for the engine
     *
     * @param {Object} options
     */
    configure: function (options) {
        _.extend(this.options, options);
    },

    /**
     * Creates a new FFI Result, to provide the result of a call to a JS function
     *
     * @param {Function} syncCallback
     * @param {Function|null} asyncCallback
     * @returns {FFIResult}
     */
    createFFIResult: function (syncCallback, asyncCallback) {
        return this.environment.createFFIResult(syncCallback, asyncCallback);
    },

    /**
     * Executes the given PHP code string in PHPCore's async mode,
     * returning a promise to be resolved or rejected based on whether an error occurs
     *
     * @param {string} code
     * @param {string} path
     * @return {Promise}
     */
    execute: function (code, path) {
        var engine = this,
            module,
            options,
            promise = new Promise(),
            subEngine,
            wrapper;

        function transpile(code, path) {
            engine.phpParser.getState().setPath(path || null);

            code = 'return ' +
                engine.phpToJS.transpile(
                    engine.phpParser.parse(code),
                    {
                        'bare': true,

                        // Record line numbers for statements/expressions
                        lineNumbers: true,

                        path: path || null
                    }
                ) +
                ';';

            /*jshint evil: true */
            wrapper = new Function(code)();

            return engine.phpRuntime.compile(wrapper);
        }

        path = path || null;
        options = _.extend({}, engine.options, {
            path: path
        });

        // Install an include transport wrapper for transports that return PHP code strings
        if (hasOwn.call(options, INCLUDE)) {
            options[INCLUDE] = (function (configuredInclude) {
                return function (path, promise, callerPath, valueFactory) {
                    var subPromise = {
                            reject: promise.reject,
                            resolve: function (result) {
                                // Support include transports that return PHP code strings
                                // by transpiling them before passing back to the core
                                if (_.isString(result)) {
                                    promise.resolve(transpile(result, path));
                                    return;
                                }

                                promise.resolve(result);
                            }
                        };

                    configuredInclude(path, subPromise, callerPath, valueFactory);
                };
            }(options[INCLUDE]));
        }

        try {
            module = transpile(code, path);
        } catch (error) {
            if (error instanceof PHPError) {
                // Report parser or transpiler errors via PHPCore,
                // so that INI settings such as `display_errors` are taken into account
                engine.environment.reportError(error);
            }

            return promise.reject(error);
        }

        subEngine = module(options, engine.environment);

        subEngine.execute().then(
            function (resultValue) {
                promise.resolve(resultValue.getNative(), resultValue.getType(), resultValue);
            },
            function (error) {
                promise.reject(error);
            }
        );

        return promise;
    },

    /**
     * Defines a global variable in PHP-land to expose the given native value
     *
     * @param {*} value
     * @param {string} name
     */
    expose: function (value, name) {
        this.environment.expose(value, name);
    },

    /**
     * Fetches PHPCore's stderr stream
     *
     * @return {Stream}
     */
    getStderr: function () {
        return this.environment.getStderr();
    },

    /**
     * Fetches PHPCore's stdin stream
     *
     * @return {Stream}
     */
    getStdin: function () {
        return this.environment.getStdin();
    },

    /**
     * Fetches PHPCore's stdout stream
     *
     * @return {Stream}
     */
    getStdout: function () {
        return this.environment.getStdout();
    }
});

module.exports = Engine;
