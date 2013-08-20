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
    'js/Promise'
], function (
    util,
    Promise
) {
    'use strict';

    function Engine(parser, interpreter, options) {
        this.interpreter = interpreter;
        this.options = options;
        this.parser = parser;
    }

    util.extend(Engine.prototype, {
        execute: function (code) {
            var ast,
                engine = this,
                promise = new Promise(),
                result;

            ast = engine.parser.parse(code);
            result = engine.interpreter.interpret(ast);
            promise.resolve(result);

            return promise;
        }
    });

    return Engine;
});
