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
    'languages/PHP/interpreter',
    'js/Language',
    'js/Uniter'
], function (
    phpGrammarSpec,
    phpInterpreterSpec,
    Language,
    Uniter
) {
    'use strict';

    var uniter = new Uniter();

    uniter.registerLanguage(new Language('PHP', phpGrammarSpec, phpInterpreterSpec));

    return uniter;
});
