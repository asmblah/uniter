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

    describe('PHP Engine constant expression integration', function () {
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

        util.each({
            'assigning undefined constant called "MY_CONST" to variable': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = MY_CONST;

    return $value;
EOS
*/) {}),
                // Undefined constant should be interpreted as bareword string literal
                expectedResult: 'MY_CONST',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant MY_CONST - assumed \'MY_CONST\'',
                expectedStdout: ''
            },
            'assigning undefined constant called "YOUR_CONST" to variable': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = YOUR_CONST;

    return $value;
EOS
*/) {}),
                // Undefined constant should be interpreted as bareword string literal
                expectedResult: 'YOUR_CONST',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant YOUR_CONST - assumed \'YOUR_CONST\'',
                expectedStdout: ''
            },
            'undefined constant as default argument value should not raise warning when not called': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function test($value = UNDEF_CONST) {}
EOS
*/) {}),
                expectedResult: null,
                // No notice should be raised
                expectedStderr: '',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
