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

describe('PHP Engine double-quoted string construct integration', function () {
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
    return "";
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
    return "hello world";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'hello world',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and backslash escape': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "this backslash \\ should end up as a single backslash";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'this backslash \\ should end up as a single backslash',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and invalid backslash escape with whitespace following': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "this standalone backslash \ should end up as a single backslash";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'this standalone backslash \\ should end up as a single backslash',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and invalid backslash escape with character following': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "this invalid escape \z should be left alone";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'this invalid escape \\z should be left alone',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and dollar escape': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "this escaped dollar \$ should end up as a plain dollar";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'this escaped dollar $ should end up as a plain dollar',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and escaped double-quote': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "this escaped quote \" should end up as just a double-quote";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'this escaped quote " should end up as just a double-quote',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and ESC escape': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "before \e after";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'before \x1B after',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and form feed escape': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "before \f after";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'before \f after',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and linefeed escape': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "before \n after";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'before \n after',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and two linefeed escapes': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "before \n middle \n after";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'before \n middle \n after',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and carriage return escape': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "before \r after";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'before \r after',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and horizontal tab escape': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "before \t after";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'before \t after',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with plain text and vertical tab escape': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return "before \v after";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'before \v after',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'string with all escapes and interpolated variable': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $name = 'Dan';

    return "before \n \r \t \v \e \f \\ \ \z \$ \" $name after";
EOS
*/;}), // jshint ignore:line
            expectedResult: 'before \n \r \t \v \x1B \f \\ \\ \\z $ " Dan after',
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
