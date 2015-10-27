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
    nowdoc = require('nowdoc'),
    phpTools = require('../../tools');

describe('PHP Engine single-quoted string construct integration', function () {
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
        'empty string': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return '';
EOS
*/;}), // jshint ignore:line
            expectedResult: '',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return 'hello world';
EOS
*/;}), // jshint ignore:line
            expectedResult: 'hello world',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and one dollar sign surrounded by whitespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return 'this $ is a dollar';
EOS
*/;}), // jshint ignore:line
            expectedResult: 'this $ is a dollar',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and partial variable interpolation surrounded by whitespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return 'this ${ should not be interpolated';
EOS
*/;}), // jshint ignore:line
            expectedResult: 'this ${ should not be interpolated',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and full variable interpolation surrounded by whitespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return 'this ${var} should not be interpolated';
EOS
*/;}), // jshint ignore:line
            expectedResult: 'this ${var} should not be interpolated',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with newline escape sequence (should be ignored in single-quoted strings)': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return 'this \n is not a newline';
EOS
*/;}), // jshint ignore:line
            // Double-escape the JS backslash escape as we want a literal '\' followed by 'n'
            expectedResult: 'this \\n is not a newline',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'escaped backslash should end up as just a single backslash': {
            code: nowdoc(function () {/*<<<EOS
<?php
return 'a\\b';
EOS
*/;}), // jshint ignore:line
            expectedResult: 'a\\b',
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
