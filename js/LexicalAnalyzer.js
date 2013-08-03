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
    'js/AST'
], function (
    util,
    AST
) {
    'use strict';

    function LexicalAnalyzer(tokenSpec, grammarSpec) {
        this.grammarSpec = grammarSpec;
        this.tokenSpec = tokenSpec;
    }

    util.extend(LexicalAnalyzer.prototype, {
        analyze: function (tokens) {
            return new AST();
        }
    });

    return LexicalAnalyzer;
});
