/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define({
    'paths': {
        'languages': './languages',
        'js': './js'
    }
}, [
    'languages/PHP/grammar',
    'languages/PHP/recompiler',
    'languages/PHP/tokens',
    'js/Language',
    'js/Uniter'
], function (
    phpGrammarSpec,
    phpRecompilerSpec,
    phpTokenSpec,
    Language,
    Uniter
) {
    'use strict';

    var uniter = new Uniter();

    uniter.registerLanguage(new Language('PHP', phpTokenSpec, phpGrammarSpec, phpRecompilerSpec));

    return uniter;
});
