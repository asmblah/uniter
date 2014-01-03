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
            'string with plain text and newline escape': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return "before \n after";
EOS
*/) {}),
                expectedResult: 'before \n after',
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
