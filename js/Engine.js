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

    function Engine(tokenizer, lexicalAnalyzer, recompiler, options) {
        this.lexicalAnalyzer = lexicalAnalyzer;
        this.options = options;
        this.recompiler = recompiler;
        this.tokenizer = tokenizer;
    }

    util.extend(Engine.prototype, {
        execute: function () {
            var promise = new Promise();

            promise.resolve(null);

            return promise;
        }
    });

    return Engine;
});
