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

    describe('PHP Parser syntax whitespace handling integration', function () {
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
            'function call followed by a single space': {
                code: '<?php open(); ',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_FUNCTION_CALL',
                            func: {
                                name: 'N_STRING',
                                string: 'open'
                            },
                            args: []
                        }
                    }]
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
