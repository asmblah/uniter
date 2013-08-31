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

    describe('PHP Engine update operators integration', function () {
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

        describe('when using the pre-increment operator "++$var"', function () {
            describe('in free context', function () {
                util.each([
                    {
                        code: '<?php $a = 7; ++$a; return $a;',
                        expectedResult: 8,
                        expectedStderr: '',
                        expectedStdout: ''
                    }
                ], function (scenario) {
                    check(scenario);
                });
            });
        });

        describe('when using the post-increment operator "$var++"', function () {
            describe('in free context', function () {
                util.each([
                    {
                        code: '<?php $a = 4; $a++; return $a;',
                        expectedResult: 5,
                        expectedStderr: '',
                        expectedStdout: ''
                    }
                ], function (scenario) {
                    check(scenario);
                });
            });
        });

        describe('when using the pre-decrement operator "--$var"', function () {
            describe('in free context', function () {
                util.each([
                    {
                        code: '<?php $a = 7; --$a; return $a;',
                        expectedResult: 6,
                        expectedStderr: '',
                        expectedStdout: ''
                    }
                ], function (scenario) {
                    check(scenario);
                });
            });
        });

        describe('when using the post-decrement operator "$var--"', function () {
            describe('in free context', function () {
                util.each([
                    {
                        code: '<?php $a = 4; $a--; return $a;',
                        expectedResult: 3,
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
