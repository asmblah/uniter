/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'module',
    'js/util',
    'js/Engine',
    'js/Exception',
    'js/HostEnvironment',
    'js/Language'
], function (
    module,
    util,
    Engine,
    Exception,
    HostEnvironment,
    Language
) {
    'use strict';

    var callback = module.defer(),
        hasOwn = {}.hasOwnProperty;

    function Uniter(options) {
        this.hostEnvironment = null;
        this.languages = {};
        this.options = options || {};
    }

    util.extend(Uniter.prototype, {
        createEngine: function (name, options) {
            var language,
                uniter = this;

            options = util.extend({}, uniter.options, options);

            if (!hasOwn.call(uniter.languages, name)) {
                throw new Exception('Uniter.createEngine() :: Language with name "' + name + '" is not registered');
            }

            language = uniter.languages[name];

            /*engine.globalScope.define({
                'const': {
                    '__WINDOW__': engine.global
                },
                'function': {
                    'fopen': {
                        args: [{type: 'string'}, {type: 'string'}],
                        options: {async: true},
                        handler: function (promise, path, mode) {

                        }
                    }
                },
                'class': {
                    DOMDocument: DOMDocument
                }
            });*/

            return language.createEngine(uniter.hostEnvironment, options);
        },

        createHostEnvironment: function (sandboxGlobalFactory) {
            return new HostEnvironment(sandboxGlobalFactory);
        },

        registerLanguage: function (language) {
            var name,
                uniter = this;

            if (!(language instanceof Language)) {
                throw new Exception('Uniter.registerLanguage() :: "language" must be a valid Language object');
            }

            name = language.getName();

            if (hasOwn.call(uniter.languages, name)) {
                throw new Exception('Uniter.registerLanguage() :: Language with name "' + name + '" is already registered');
            }

            uniter.languages[name] = language;
        },

        setHostEnvironment: function (hostEnvironment) {
            this.hostEnvironment = hostEnvironment;
        }
    });

    // Breaks the circular dependency between js/Uniter.js<->js/util.js
    util.init(function () {
        callback(Uniter);
    });
});
