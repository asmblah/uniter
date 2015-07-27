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
    'languages/PHP/interpreter',
    'phptoast',
    'js/Engine',
    'js/Interpreter',
    'js/Stream'
], function (
    phpInterpreterSpec,
    phpToAST,
    Engine,
    Interpreter,
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
                parser = phpToAST.create(stderr),
                engine = new Engine(parser, interpreter);

            interpreter.setEngine(engine);

            return engine;
        },

        createInterpreter: function (stdin, stdout, stderr, options) {
            return new Interpreter(phpInterpreterSpec, stdin, stdout, stderr, options);
        },

        createParser: function () {
            var stderr = new Stream();

            return phpToAST.create(stderr);
        }
    };
});
