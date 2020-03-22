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
    nowdoc = require('nowdoc'),
    phpTools = require('../../../../tools');

describe('PHP Engine strrpos() builtin function integration', function () {
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
        'finding only occurrence of character in string, no offset': {
            code: nowdoc(function () {/*<<<EOS
<?php
return strrpos('abc', 'a');
EOS
*/;}), // jshint ignore:line
            expectedResult: 0,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'finding last occurrence of character in string, no offset': {
            code: nowdoc(function () {/*<<<EOS
<?php
return strrpos('abccba', 'b');
EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'finding last occurrence of character in string, positive offset is before occurrence': {
            code: nowdoc(function () {/*<<<EOS
<?php
return strrpos('abccba', 'b', 2);
EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'finding last occurrence of character in string, positive offset is at occurrence': {
            code: nowdoc(function () {/*<<<EOS
<?php
return strrpos('abccba', 'b', 4);
EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'finding last occurrence of character in string, positive offset is after occurrence': {
            code: nowdoc(function () {/*<<<EOS
<?php
return strrpos('abccbaaa', 'b', 5);
EOS
*/;}), // jshint ignore:line
            expectedResult: false,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: ''
        },
        'finding last occurrence of character in string, negative offset is before occurrence': {
            code: nowdoc(function () {/*<<<EOS
<?php
return strrpos('abccba', 'b', -3);
EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'finding last occurrence of character in string, negative offset is at occurrence': {
            code: nowdoc(function () {/*<<<EOS
<?php
return strrpos('abccba', 'b', -2);
EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'finding last occurrence of character in string, negative offset is after occurrence': {
            code: nowdoc(function () {/*<<<EOS
<?php
return strrpos('abccba', 'b', -1);
EOS
*/;}), // jshint ignore:line
            expectedResult: false,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: ''
        },
        'finding character in empty string, no offset': {
            code: nowdoc(function () {/*<<<EOS
<?php
return strrpos('', 'a');
EOS
*/;}), // jshint ignore:line
            expectedResult: false,
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
