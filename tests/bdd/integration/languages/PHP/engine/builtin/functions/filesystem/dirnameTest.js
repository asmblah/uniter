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

describe('PHP Engine dirname() builtin function integration', function () {
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
        'dirname of empty string is empty string': {
            code: '<?php return dirname("");',
            expectedResult: '',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'dirname of string with no slashes resolves to the current directory (".")': {
            code: '<?php return dirname("my-folder");',
            expectedResult: '.',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'dirname of string with only backslashes resolves to the current directory (".")': {
            code: '<?php return dirname("my\\\\folder");',
            expectedResult: '.',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'dirname of string with two levels': {
            code: '<?php return dirname("my/folder");',
            expectedResult: 'my',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'dirname of string with three levels and extension': {
            code: '<?php return dirname("path/to/my/file.txt");',
            expectedResult: 'path/to/my',
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
