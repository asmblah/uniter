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
    'js/util',
    'languages/PHP/interpreter/Error/Parse'
], function (
    engineTools,
    phpTools,
    util,
    PHPParseError
) {
    'use strict';

    describe('PHP Engine syntax error handling integration', function () {
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
            'function call missing end semicolon': {
                code: util.heredoc(function (/*<<<EOS
<?php
    open()
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPParseError,
                    match: /^PHP Parse error: syntax error, unexpected \$end in \(program\)$/
                },
                expectedStderr: 'PHP Parse error: syntax error, unexpected $end in (program)',
                expectedStdout: ''
            },
            'function call missing end semicolon in required module': {
                code: util.heredoc(function (/*<<<EOS
<?php
    require_once 'syntax_error.php';
EOS
*/) {}),
                options: {
                    'include': function (path, promise) {
                        promise.resolve('<?php open()');
                    }
                },
                expectedException: {
                    instanceOf: PHPParseError,
                    match: /^PHP Parse error: syntax error, unexpected \$end in syntax_error\.php$/
                },
                expectedStderr: 'PHP Parse error: syntax error, unexpected $end in syntax_error.php',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
