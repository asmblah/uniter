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

    describe('PHP Engine "isset" construct integration', function () {
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
            'undefined variable': {
                code: '<?php return isset($undefinedVariable);',
                expectedResult: false,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'variable with value of null assigned': {
                code: '<?php $variable = null; return isset($variable);',
                expectedResult: false,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'undefined property of object assigned to variable': {
                code: '<?php $variable = new stdClass; return isset($variable->undefinedProp);',
                expectedResult: false,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'defined property with value null of object assigned to variable': {
                code: '<?php $variable = new stdClass; $variable->prop = null; return isset($variable->prop);',
                expectedResult: false,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'undefined element of array assigned to variable': {
                code: '<?php $variable = array(); return isset($variable[7]);',
                expectedResult: false,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'defined element with value null of array assigned to variable': {
                code: '<?php $variable = array(); $variable[6] = null; return isset($variable[6]);',
                expectedResult: false,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'one variable with 0 assigned and one undefined variable': {
                code: '<?php $definedVar = 0; return isset($definedVar, $undefinedVar);',
                expectedResult: false,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'one variable with 1 assigned and one variable assigned null': {
                code: '<?php $var1 = 1; $var2 = null; return isset($var1, $var2);',
                expectedResult: false,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'variable with value of 0 assigned': {
                code: '<?php $variable = 0; return isset($variable);',
                expectedResult: true,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'variable with value of 1 assigned': {
                code: '<?php $variable = 1; return isset($variable);',
                expectedResult: true,
                1: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'variable with value of false assigned': {
                code: '<?php $variable = false; return isset($variable);',
                expectedResult: true,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'variable with an object assigned': {
                code: '<?php $variable = new stdClass; return isset($variable);',
                expectedResult: true,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'variable with an empty array assigned': {
                code: '<?php $variable = array(); return isset($variable);',
                expectedResult: true,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'property with value 0 of object assigned to variable': {
                code: '<?php $variable = new stdClass; $variable->prop = 0; return isset($variable->prop);',
                expectedResult: true,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'element with value "rabbit" of array assigned to variable': {
                code: '<?php $variable = array(); $variable[4] = "rabbit"; return isset($variable[4]);',
                expectedResult: true,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'variable with 0 assigned and variable with false assigned': {
                code: '<?php $var1 = 0; $var2 = false; return isset($var1, $var2);',
                expectedResult: true,
                expectedResultType: 'boolean',
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
