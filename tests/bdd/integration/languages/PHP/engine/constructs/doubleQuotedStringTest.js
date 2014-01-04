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

        util.each({
            'empty string': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "";
EOS
*/) {}),
                expectedResult: '',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "hello world";
EOS
*/) {}),
                expectedResult: 'hello world',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and backslash escape': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "this backslash \\ should end up as a single backslash";
EOS
*/) {}),
                expectedResult: 'this backslash \\ should end up as a single backslash',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and dollar escape': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "this escaped dollar \$ should end up as a plain dollar";
EOS
*/) {}),
                expectedResult: 'this escaped dollar $ should end up as a plain dollar',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and ESC escape': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "before \e after";
EOS
*/) {}),
                expectedResult: 'before \x1B after',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and form feed escape': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "before \f after";
EOS
*/) {}),
                expectedResult: 'before \f after',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and linefeed escape': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "before \n after";
EOS
*/) {}),
                expectedResult: 'before \n after',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and two linefeed escapes': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "before \n middle \n after";
EOS
*/) {}),
                expectedResult: 'before \n middle \n after',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and carriage return escape': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "before \r after";
EOS
*/) {}),
                expectedResult: 'before \r after',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and horizontal tab escape': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "before \t after";
EOS
*/) {}),
                expectedResult: 'before \t after',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and vertical tab escape': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "before \v after";
EOS
*/) {}),
                expectedResult: 'before \v after',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with all escapes and interpolated variable': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $name = 'Dan';

    return "before \n \r \t \v \e \f \\ \$ $name after";
EOS
*/) {}),
                expectedResult: 'before \n \r \t \v \x1B \f \\ $ Dan after',
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
});
