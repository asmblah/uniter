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

function Engine(phpParser, phpToJS, phpRuntime, environment, options) {
    this.environment = environment;
    this.options = options || {};
    this.phpParser = phpParser;
    this.phpRuntime = phpRuntime;
    this.phpToJS = phpToJS;
}

_.extend(Engine.prototype, {
    configure: function (options) {
        _.extend(this.options, options);
    },

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
                    {'bare': true}
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
            // Any PHP errors from the transpiler or parser should be written to stdout by default
            if (path === null && error instanceof PHPError) {
                engine.getStderr().write(error.message);
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

    expose: function (object, name) {
        this.environment.expose(object, name);
    },

    getStderr: function () {
        return this.environment.getStderr();
    },

    getStdin: function () {
        return this.environment.getStdin();
    },

    getStdout: function () {
        return this.environment.getStdout();
    }
});

module.exports = Engine;
