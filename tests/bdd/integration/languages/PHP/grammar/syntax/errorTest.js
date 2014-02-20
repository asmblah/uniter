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

    describe('PHP Parser syntax error handling integration', function () {
        var parser;

        function check(scenario) {
            engineTools.check(function () {
                return {
                    parser: parser
                };
            }, scenario);
        }

        beforeEach(function () {
            parser = phpTools.createParser();
        });

        util.each({
            'function call missing end semicolon': {
                code: '<?php open()',
                expectedException: {
                    instanceOf: PHPParseError,
                    match: /^PHP Parse error: syntax error, unexpected \$end in \(program\) on line 1$/
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
