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
    'languages/PHP/grammar',
    'languages/PHP/recompiler',
    'languages/PHP/tokens',
    'js/Engine',
    'js/LexicalAnalyzer',
    'js/Recompiler',
    'js/Tokenizer'
], function (
    phpGrammarSpec,
    phpRecompilerSpec,
    phpTokenSpec,
    Engine,
    LexicalAnalyzer,
    Recompiler,
    Tokenizer
) {
    'use strict';

    return {
        createEngine: function () {
            var recompiler = new Recompiler(phpRecompilerSpec),
                tokenizer = this.createTokenizer(),
                lexicalAnalyzer = new LexicalAnalyzer(phpTokenSpec, phpGrammarSpec);

            return new Engine(tokenizer, lexicalAnalyzer, recompiler);
        },

        createTokenizer: function () {
            return new Tokenizer(phpTokenSpec);
        },

        getTokenSpec: function () {
            return phpTokenSpec;
        }
    };
});
