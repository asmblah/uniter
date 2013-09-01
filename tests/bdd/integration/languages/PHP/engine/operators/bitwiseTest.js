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

    describe('PHP Engine bitwise operators integration', function () {
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

        describe('when using the one\'s complement (bitwise negation) operator "~<val>"', function () {
            describe('when used as a single term in an expression', function () {
                describe('when the operand is a constant value', function () {
                    util.each([
                        {
                            expression: '~1',
                            expectedResult: -2
                        },
                        {
                            expression: '~"1"',
                            // Gets cast to a string with the question mark character
                            expectedResult: '?'
                        },
                        {
                            expression: '~"a"',
                            // Gets cast to a string with the question mark character
                            expectedResult: '?'
                        },
                        {
                            expression: '~"a" + 2',
                            // Gets cast to a string (question mark character), then to int (zero) because of numeric addition
                            expectedResult: 2
                        },
                        {
                            expression: '~"a" . 3',
                            // Gets cast to a string (question mark character), but kept as string because of concatenation
                            expectedResult: '?3'
                        }
                    ], function (scenario) {
                        check({
                            code: '<?php return ' + scenario.expression + ';',
                            expectedResult: scenario.expectedResult,
                            expectedStderr: '',
                            expectedStdout: ''
                        });
                    });
                });

                describe('when the operand is a variable', function () {
                    util.each([
                        {
                            code: '<?php $a = 1; return ~$a;',
                            expectedResult: -2,
                            expectedStderr: '',
                            expectedStdout: ''
                        }
                    ], function (scenario) {
                        check(scenario);
                    });
                });
            });
        });
    });
});
