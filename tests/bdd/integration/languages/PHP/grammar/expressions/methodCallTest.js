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
    '../../tools',
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    describe('PHP Parser grammar method call expression integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'call to statically referenced instance method with no arguments': {
                code: '$obj->doSomething();',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_METHOD_CALL',
                            object: {
                                name: 'N_VARIABLE',
                                variable: '$obj'
                            },
                            calls: [{
                                func: {
                                    name: 'N_STRING',
                                    string: 'doSomething'
                                },
                                args: []
                            }]
                        }
                    }]
                }
            },
            'call to dynamically referenced instance method with no arguments': {
                code: '$obj->$methodName();',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_METHOD_CALL',
                            object: {
                                name: 'N_VARIABLE',
                                variable: '$obj'
                            },
                            calls: [{
                                func: {
                                    name: 'N_VARIABLE',
                                    variable: '$methodName'
                                },
                                args: []
                            }]
                        }
                    }]
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                var code = '<?php ' + scenario.code;

                // Pretty-print the code strings so any non-printable characters are readable
                describe('when the code is ' + JSON.stringify(code) + ' ?>', function () {
                    it('should return the expected AST', function () {
                        expect(parser.parse(code)).to.deep.equal(scenario.expectedAST);
                    });
                });
            });
        });
    });
});
