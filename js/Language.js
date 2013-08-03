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
    'js/LexicalAnalyzer',
    'js/Recompiler',
    'js/Tokenizer'
], function (
    util,
    Engine,
    LexicalAnalyzer,
    Recompiler,
    Tokenizer
) {
    'use strict';

    function Language(name, tokenSpec, grammarSpec, recompilerSpec) {
        this.name = name;
        this.grammarSpec = grammarSpec;
        this.recompilerSpec = recompilerSpec;
        this.tokenSpec = tokenSpec;
    }

    util.extend(Language.prototype, {
        createEngine: function (options) {
            var language = this,
                recompiler = new Recompiler(language.recompilerSpec),
                tokenizer = new Tokenizer(language.tokenSpec),
                lexicalAnalyzer = new LexicalAnalyzer(language.tokenSpec, language.grammarSpec);

            return new Engine(tokenizer, lexicalAnalyzer, recompiler, options);
        },

        getName: function () {
            return this.name;
        }
    });

    return Language;
});
