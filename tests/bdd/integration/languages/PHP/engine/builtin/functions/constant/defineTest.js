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
    '../../../tools',
    '../../../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine define() builtin function integration', function () {
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
            'defining case-sensitive constant in global namespace then referencing with correct case from global namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    define('NAME', 'Dan');

    return NAME;
EOS
*/) {}),
                expectedResult: 'Dan',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'defining case-sensitive constant in global namespace but referencing with incorrect case from global namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    define('NAME', 'Dan');

    return NaME;
EOS
*/) {}),
                expectedResult: 'NaME',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant NaME - assumed \'NaME\'\n',
                expectedStdout: ''
            },
            'defining case-insensitive constant in global namespace then referencing with correct case from global namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    define('NAME', 'Dan', true);

    return NAME;
EOS
*/) {}),
                expectedResult: 'Dan',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'defining case-insensitive constant in global namespace but referencing with incorrect case from global namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    define('NAME', 'Dan', true);

    return NaME;
EOS
*/) {}),
                expectedResult: 'Dan',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'defining case-sensitive lowercase constant in global namespace but referencing with incorrect case from global namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    define('name', 'Dan');

    return NAME;
EOS
*/) {}),
                expectedResult: 'NAME',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant NAME - assumed \'NAME\'\n',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
