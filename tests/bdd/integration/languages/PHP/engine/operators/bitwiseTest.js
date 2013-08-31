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
                            code: '<?php return ~1;',
                            expectedResult: -2,
                            expectedStderr: '',
                            expectedStdout: ''
                        }
                    ], function (scenario) {
                        check(scenario);
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
