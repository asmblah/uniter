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
                'assignment of variable containing array to another variable': {
                    code: '<?php $a = array(); $b = $a; return $b;',
                    expectedResult: [],
                    expectedResultDeep: true,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of variable containing array to another variable, then modifying the copy (should not affect original)': {
                    code: '<?php $a = array(); $b = $a; $b[0] = 7; return $a;',
                    expectedResult: [],
                    expectedResultDeep: true,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of variable containing array to element of array': {
                    code: '<?php $a = array(); $a[0] = $a; return $a;',
                    expectedResult: [[]],
                    expectedResultDeep: true,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of variable reference to element of array': {
                    code: '<?php $a = array(); $b = 1; $a[0] =& $b; $b = 7; return $a[0];',
                    expectedResult: 7,
                    expectedStderr: '',
                    expectedStdout: ''
                },
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
                'assignment of integer value to index of existing array then reading back': {
                    code: '<?php $array = array(); $array[0] = 27; return $array[0];',
                    expectedResult: 27,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of integer value to string key of existing array then reading back': {
                    code: '<?php $array = array(); $array["test"] = 6; return $array["test"];',
                    expectedResult: 6,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of integer value to index of undefined implied array then reading back': {
                    code: '<?php $array[0] = 22; return $array[0];',
                    expectedResult: 22,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of integer value to index of defined but null (so implied) array then reading back': {
                    code: '<?php $array = null; $array[0] = 23; return $array[0];',
                    expectedResult: 23,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'assignment of integer value to index of non-array element': {
                    code: '<?php $notAnArray = 2; $notAnArray[0] = 3; return $notAnArray;',
                    expectedResult: 2,
                    expectedStderr: 'PHP Warning: Cannot use a scalar value as an array\n',
                    expectedStdout: ''
                },
                'assignment of integer value to variable after variable has been read: definitions should not be hoisted': {
                    code: '<?php var_dump($value); $value = 7;',
                    expectedResult: null,
                    expectedStderr: util.heredoc(function (/*<<<EOS
PHP Notice: Undefined variable: value

EOS
*/) {}),
                    expectedStdout: util.heredoc(function (/*<<<EOS
NULL

EOS
*/) {}),
                },
                'assignment of integer value to variable before variable has been read, but in code block that is never run': {
                    code: '<?php if (0) { $value = 1; } var_dump($value);',
                    expectedResult: null,
                    expectedStderr: util.heredoc(function (/*<<<EOS
PHP Notice: Undefined variable: value

EOS
*/) {}),
                    expectedStdout: util.heredoc(function (/*<<<EOS
NULL

EOS
*/) {}),
                },
                'assignment of result of assignment to variable': {
                    code: '<?php $value = $result = 7; return $value + $result;',
                    expectedResult: 14,
                    expectedResultType: 'integer',
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
