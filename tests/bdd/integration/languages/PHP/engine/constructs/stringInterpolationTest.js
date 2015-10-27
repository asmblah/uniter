/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    engineTools = require('../tools'),
    phpTools = require('../../tools');

describe('PHP Engine string interpolation construct integration', function () {
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

    _.each({
        'string containing only an interpolated variable with integer value - cast to string': {
            code: '<?php $number = 7; return "$number";',
            expectedResult: '7',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string containing some text followed by an interpolated variable (touching)': {
            code: '<?php $number = 8; return "number$number";',
            expectedResult: 'number8',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string containing two interpolated variables touching': {
            // Ensure adjacent interpolated number values are cast to string and concatenated, not added
            code: '<?php $number1 = 4; $number2 = 6; return "$number1$number2";',
            expectedResult: '46',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string containing an interpolated array value': {
            code: '<?php $array = array(); return "$array";',
            expectedResult: 'Array',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string containing text with ${...} interpolation': {
            code: '<?php $name = "Dan"; return "My name is ${name}.";',
            expectedResult: 'My name is Dan.',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string containing text with variable variable ${$...} interpolation': {
            code: '<?php $myName = "Fred"; $varName = "myName"; return "My name is ${$varName}.";',
            expectedResult: 'My name is Fred.',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
