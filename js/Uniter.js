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
    'js/util',
    'js/Engine',
    'js/Exception',
    'js/Language'
], function (
    util,
    Engine,
    Exception,
    Language
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function Uniter(options) {
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

            return language.createEngine(options);
        },

        createParser: function (name) {
            var language,
                uniter = this;

            if (!hasOwn.call(uniter.languages, name)) {
                throw new Exception('Uniter.createParser() :: Language with name "' + name + '" is not registered');
            }

            language = uniter.languages[name];

            return language.createParser();
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
        }
    });

    return Uniter;
});
