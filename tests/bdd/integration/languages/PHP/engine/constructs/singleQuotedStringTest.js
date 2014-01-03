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

        util.each({
            'empty string': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return '';
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
    return 'hello world';
EOS
*/) {}),
                expectedResult: 'hello world',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and one dollar sign surrounded by whitespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return 'this $ is a dollar';
EOS
*/) {}),
                expectedResult: 'this $ is a dollar',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and partial variable interpolation surrounded by whitespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return 'this ${ should not be interpolated';
EOS
*/) {}),
                expectedResult: 'this ${ should not be interpolated',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with plain text and full variable interpolation surrounded by whitespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return 'this ${var} should not be interpolated';
EOS
*/) {}),
                expectedResult: 'this ${var} should not be interpolated',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'string with newline escape sequence (should be ignored in single-quoted strings)': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return 'this \n is not a newline';
EOS
*/) {}),
                // Double-escape the JS backslash escape as we want a literal '\' followed by 'n'
                expectedResult: 'this \\n is not a newline',
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
