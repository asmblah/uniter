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

    describe('PHP Engine assignment operators integration', function () {
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

        describe('the "=" operator', function () {
            util.each({
                'assignment of integer value to variable': {
                    code: '<?php $a = 26; return $a;',
                    expectedResult: 26,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'reading result of assignment': {
                    code: '<?php $a = ($b = 7); return $a;',
                    expectedResult: 7,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of integer value to variable then reading from a reference': {
                    code: '<?php $a = 24; $b =& $a; return $b;',
                    expectedResult: 24,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of integer value to variable, changing original then reading from reference': {
                    code: '<?php $a = 20; $b =& $a; $a = 3; return $b;',
                    expectedResult: 3,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of integer value to array index then reading back': {
                    code: '<?php $array = array(); $array[0] = 27; return $array[0];',
                    expectedResult: 27,
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
