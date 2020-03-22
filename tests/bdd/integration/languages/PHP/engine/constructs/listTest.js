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

describe('PHP Engine "list" construct integration', function () {
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

    describe('assignment', function () {
        _.each({
            'of array with one element to list with one element': {
                code: '<?php list($a) = array(25); return $a;',
                expectedResult: 25,
                expectedStderr: '',
                expectedStdout: ''
            },
            'of empty array to list with one element': {
                code: '<?php list($value) = array(); return $value;',
                expectedResult: null,
                expectedStderr: 'PHP Notice:  Undefined offset: 0 in /path/to/my_module.php on line 1\n',
                expectedStdout: '\nNotice: Undefined offset: 0 in /path/to/my_module.php on line 1\n'
            },
            'of array with two elements to list with two elements with first element skipped': {
                code: '<?php list(, $a) = array(21, 22); return $a;',
                expectedResult: 22,
                expectedStderr: '',
                expectedStdout: ''
            },
            'of array with two elements to list with two elements with first two elements skipped': {
                code: '<?php list(,, $third) = array(100, 101, 102); return $third;',
                expectedResult: 102,
                expectedStderr: '',
                expectedStdout: ''
            },
            'of array with two elements to list with two elements with last element skipped': {
                code: '<?php list($first,) = array(4, 5); return $first;',
                expectedResult: 4,
                expectedStderr: '',
                expectedStdout: ''
            },
            'of array with three elements to list with three elements with second element skipped': {
                code: '<?php list($first,,$third) = array(7, 8, 9); return $first . " then " . $third;',
                expectedResult: '7 then 9',
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
