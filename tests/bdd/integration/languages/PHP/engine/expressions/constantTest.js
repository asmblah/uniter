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
            'undefined constant as default argument value when not called': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function test($value = UNDEF_CONST) {}
EOS
*/) {}),
                expectedResult: null,
                // No notice should be raised
                expectedStderr: '',
                expectedStdout: ''
            },
            'undefined constant as default argument value when called and used': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function test($value = UNDEF_CONST) {
        return $value;
    }

    return test();
EOS
*/) {}),
                // Undefined constant should be interpreted as bareword string literal
                expectedResult: 'UNDEF_CONST',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant UNDEF_CONST - assumed \'UNDEF_CONST\'',
                expectedStdout: ''
            },
            // Ensure we use .hasOwnProperty(...) checks internally
            'undefined constant called "constructor" as default argument value when called and used': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function test($value = constructor) {
        return $value;
    }

    return test();
EOS
*/) {}),
                // Undefined constant should be interpreted as bareword string literal
                expectedResult: 'constructor',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant constructor - assumed \'constructor\'',
                expectedStdout: ''
            },
            'undefined constant as default argument value when called but not used': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function test($value = UNDEF_CONST) {
        return $value;
    }

    return test('world');
EOS
*/) {}),
                expectedResult: 'world',
                expectedResultType: 'string',
                // No notice should be raised
                expectedStderr: '',
                expectedStdout: ''
            },
            'defined constant as default argument value should be read and not raise warning when called and used': {
                code: util.heredoc(function (/*<<<EOS
<?php
    define('MY_PLANET', 'Earth');

    function getPlanet($name = MY_PLANET) {
        return $name;
    }

    return getPlanet();
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
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
