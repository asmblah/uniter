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
                    match: /^PHP Parse error: syntax error, unexpected \$end$/
                },
                expectedStderr: 'PHP Parse error: syntax error, unexpected $end',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
