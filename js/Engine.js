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
    phpCommon = require('phpcommon'),
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

        path = path || null;
        options = _.extend({}, engine.options, {
            path: path
        });

        try {
            code = 'return ' +
                engine.phpToJS.transpile(
                    engine.phpParser.parse(code),
                    {'bare': true}
                ) +
                ';';
        } catch (error) {
            // Any PHP errors from the transpiler or parser should be written to stdout by default
            if (path === null && error instanceof PHPError) {
                engine.getStderr().write(error.message);
            }

            return promise.reject(error);
        }

        /*jshint evil: true */
        wrapper = new Function(code)();

        module = engine.phpRuntime.compile(wrapper);
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
