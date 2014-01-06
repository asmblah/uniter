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

    describe('PHP Parser grammar namespace {...} construct integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'first level namespace definition with no contents': {
                code: '<?php namespace Test;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_NAMESPACE_STATEMENT',
                        namespace: 'Test',
                        statements: []
                    }]
                }
            },
            'first level namespace definition with one expression statement': {
                code: '<?php namespace Test; myFunc();',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_NAMESPACE_STATEMENT',
                        namespace: 'Test',
                        statements: [{
                            name: 'N_EXPRESSION_STATEMENT',
                            expression: {
                                name: 'N_FUNCTION_CALL',
                                func: {
                                    name: 'N_STRING',
                                    string: 'myFunc'
                                },
                                args: []
                            }
                        }]
                    }]
                }
            },
            'two level namespace definitions with single expression statements': {
                code: '<?php namespace Here; myFunc(); namespace There; yourFunc();',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_NAMESPACE_STATEMENT',
                        namespace: 'Here',
                        statements: [{
                            name: 'N_EXPRESSION_STATEMENT',
                            expression: {
                                name: 'N_FUNCTION_CALL',
                                func: {
                                    name: 'N_STRING',
                                    string: 'myFunc'
                                },
                                args: []
                            }
                        }]
                    }, {
                        name: 'N_NAMESPACE_STATEMENT',
                        namespace: 'There',
                        statements: [{
                            name: 'N_EXPRESSION_STATEMENT',
                            expression: {
                                name: 'N_FUNCTION_CALL',
                                func: {
                                    name: 'N_STRING',
                                    string: 'yourFunc'
                                },
                                args: []
                            }
                        }]
                    }]
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                // Pretty-print the code strings so any non-printable characters are readable
                describe('when the code is ' + JSON.stringify(scenario.code) + ' ?>', function () {
                    it('should return the expected AST', function () {
                        expect(parser.parse(scenario.code)).to.deep.equal(scenario.expectedAST);
                    });
                });
            });
        });
    });
});
