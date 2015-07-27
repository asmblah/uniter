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
    'parsing',
    'js/util',
    'js/Engine',
    'js/Interpreter',
    'js/Stream'
], function (
    parsing,
    util,
    Engine,
    Interpreter,
    Stream
) {
    'use strict';

    function Language(name, parserFactory, interpreterSpec) {
        this.name = name;
        this.interpreterSpec = interpreterSpec;
        this.parserFactory = parserFactory;
    }

    util.extend(Language.prototype, {
        createEngine: function (options) {
            var language = this,
                stderr = new Stream(),
                stdin = new Stream(),
                stdout = new Stream(),
                interpreter = new Interpreter(language.interpreterSpec, stdin, stdout, stderr, options),
                parser = language.parserFactory.create(stderr),
                engine = new Engine(parser, interpreter);

            interpreter.setEngine(engine);

            return engine;
        },

        createParser: function () {
            var language = this,
                stderr = new Stream(),
                parser = language.parserFactory.create(stderr);

            return parser;
        },

        getName: function () {
            return this.name;
        }
    });

    return Language;
});
