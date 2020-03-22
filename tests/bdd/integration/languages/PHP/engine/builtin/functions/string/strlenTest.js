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
    engineTools = require('../../../tools'),
    phpTools = require('../../../../tools');

describe('PHP Engine strlen() builtin function integration', function () {
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
        'getting length of array': {
            code: '<?php return strlen(array());',
            expectedResult: null,
            expectedStderr: 'PHP Warning:  strlen() expects parameter 1 to be string, array given in /path/to/my_module.php on line 1\n',
            expectedStdout: '\nWarning: strlen() expects parameter 1 to be string, array given in /path/to/my_module.php on line 1\n'
        },
        'getting length of bool(true)': {
            code: '<?php return strlen(true);',
            expectedResult: 1,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of bool(false)': {
            code: '<?php return strlen(false);',
            expectedResult: 0,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of float 21.34': {
            code: '<?php $value = 21.34; return strlen($value);',
            expectedResult: 5,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of integer(4)': {
            code: '<?php $value = 4; return strlen($value);',
            expectedResult: 1,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of null': {
            code: '<?php return strlen(null);',
            expectedResult: 0,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of stdClass instance': {
            code: '<?php return strlen(new stdClass);',
            expectedResult: null,
            expectedStderr: 'PHP Warning:  strlen() expects parameter 1 to be string, object given in /path/to/my_module.php on line 1\n',
            expectedStdout: '\nWarning: strlen() expects parameter 1 to be string, object given in /path/to/my_module.php on line 1\n'
        },
        'getting length of empty string': {
            code: '<?php $value = ""; return strlen($value);',
            expectedResult: 0,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of string "octopus"': {
            code: '<?php $value = "octopus"; return strlen($value);',
            expectedResult: 7,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
