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
    'js/Engine',
    'js/Interpreter',
    'js/Parser',
    'js/Stream'
], function (
    phpGrammarSpec,
    phpInterpreterSpec,
    Engine,
    Interpreter,
    Parser,
    Stream
) {
    'use strict';

    return {
        createEngine: function (options) {
            var tools = this,
                stderr = new Stream(),
                stdin = new Stream(),
                stdout = new Stream(),
                interpreter = tools.createInterpreter(stdin, stdout, stderr, options),
                parser = new Parser(phpGrammarSpec, stderr),
                engine = new Engine(parser, interpreter);

            interpreter.setEngine(engine);

            return engine;
        },

        createInterpreter: function (stdin, stdout, stderr, options) {
            return new Interpreter(phpInterpreterSpec, stdin, stdout, stderr, options);
        },

        createParser: function () {
            var stderr = new Stream();

            return new Parser(phpGrammarSpec, stderr);
        },

        getGrammarSpec: function () {
            return phpGrammarSpec;
        }
    };
});
