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
    'js/Interpreter',
    'js/Parser',
    'js/Stream'
], function (
    util,
    Engine,
    Interpreter,
    Parser,
    Stream
) {
    'use strict';

    function Language(name, grammarSpec, interpreterSpec) {
        this.name = name;
        this.grammarSpec = grammarSpec;
        this.interpreterSpec = interpreterSpec;
    }

    util.extend(Language.prototype, {
        createEngine: function (options) {
            var language = this,
                stderr = new Stream(),
                stdin = new Stream(),
                stdout = new Stream(),
                interpreter = new Interpreter(language.interpreterSpec, stdin, stdout, stderr),
                parser = new Parser(language.grammarSpec);

            return new Engine(parser, interpreter, options);
        },

        getName: function () {
            return this.name;
        }
    });

    return Language;
});
