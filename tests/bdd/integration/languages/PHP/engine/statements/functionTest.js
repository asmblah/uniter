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
    '../tools',
    '../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine function definition statement integration', function () {
        var engine;

        function check(scenario) {
            engineTools.check(function () {
                return {
                    engine: engine
                };
            }, scenario);
        }

        beforeEach(function () {
            engine = phpTools.createEngine();
        });

        util.each([
            {
                // Simple function call
                code: '<?php function show($string) { echo $string; } show("hello!");',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'hello!'
            }, {
                // Make sure variables defined in inner scopes are not defined in the outer one
                code: '<?php function doSomething() { $a = 1; } echo $a;',
                expectedResult: null,
                expectedStderr: 'PHP Notice: Undefined variable: $a',
                expectedStdout: ''
            }, {
                // Make sure variables defined in outer scopes are not defined in the inner one
                code: '<?php $a = 1; function doSomething() { echo $a; } doSomething();',
                expectedResult: null,
                expectedStderr: 'PHP Notice: Undefined variable: $a',
                expectedStdout: ''
            }
        ], function (scenario) {
            check(scenario);
        });
    });
});
