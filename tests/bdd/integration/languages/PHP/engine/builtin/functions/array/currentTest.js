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
    '../../../tools',
    '../../../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine current() builtin function integration', function () {
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

        describe('outside foreach (...) {...}', function () {
            util.each({
                'getting value of current element of empty array': {
                    code: '<?php $array = array(); return current($array);',
                    expectedResult: false,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'getting value of current indexed element of 1-element array when just created': {
                    code: '<?php $array = array(7); return current($array);',
                    expectedResult: 7,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'getting value of current associative element of 1-element array when just created': {
                    code: '<?php $array = array("a" => "b"); return current($array);',
                    expectedResult: 'b',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'getting value of current indexed element of array when initially empty then setting an element at index > 0': {
                    code: '<?php $array = array(); $array[7] = 2; return current($array);',
                    expectedResult: 2,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'getting value of current associative element of array when initially empty then set': {
                    code: '<?php $array = array(); $array["me"] = 3; return current($array);',
                    expectedResult: 3,
                    expectedStderr: '',
                    expectedStdout: ''
                }
            }, function (scenario, description) {
                describe(description, function () {
                    check(scenario);
                });
            });
        });

        describe('inside foreach (...) {...}', function () {
            util.each({
                'foreach should reset internal pointer but not advance during': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    $array = array(1, 2, 3);
    $result = '';

    // Advance to next element before loop, to check internal pointer is reset by foreach
    next($array);

    foreach ($array as $val) {
        $result = $result . current($array) . ',';
    }

    return $result;
EOS
*/) {}),
                    expectedResult: '1,1,1,',
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
});
