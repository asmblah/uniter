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
    'test-environment',
    'js/Engine',
    'js/HostEnvironment',
    'js/Interpreter',
    'js/Parser',
    'js/Stream'
], function (
    phpGrammarSpec,
    phpInterpreterSpec,
    testEnvironment,
    Engine,
    HostEnvironment,
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
                hostEnvironment = tools.createHostEnvironment(),
                interpreter = tools.createInterpreter(hostEnvironment, stdin, stdout, stderr, options),
                parser = new Parser(phpGrammarSpec, stderr),
                engine = new Engine(parser, interpreter);

            interpreter.setEngine(engine);

            return engine;
        },

        createHostEnvironment: function () {
            return new HostEnvironment(function () {
                return testEnvironment.sandboxGlobal;
            });
        },

        createInterpreter: function (hostEnvironment, stdin, stdout, stderr, options) {
            return new Interpreter(phpInterpreterSpec, hostEnvironment, stdin, stdout, stderr, options);
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
