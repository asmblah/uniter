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

    describe('PHP Parser grammar foreach statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'simple foreach over variable with no body statements': {
                code: 'foreach ($array as $item) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FOREACH_STATEMENT',
                        array: {
                            name: 'N_VARIABLE',
                            variable: 'array'
                        },
                        value: {
                            name: 'N_VARIABLE',
                            variable: 'item'
                        },
                        statements: []
                    }]
                }
            },
            'simple foreach over variable with key with no body statements': {
                code: 'foreach ($array as $key => $item) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FOREACH_STATEMENT',
                        array: {
                            name: 'N_VARIABLE',
                            variable: 'array'
                        },
                        key: {
                            name: 'N_VARIABLE',
                            variable: 'key'
                        },
                        value: {
                            name: 'N_VARIABLE',
                            variable: 'item'
                        },
                        statements: []
                    }]
                }
            },
            'simple foreach over variable by reference with key': {
                code: 'foreach ($array as $key => &$item) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FOREACH_STATEMENT',
                        array: {
                            name: 'N_VARIABLE',
                            variable: 'array'
                        },
                        key: {
                            name: 'N_VARIABLE',
                            variable: 'key'
                        },
                        value: {
                            name: 'N_VARIABLE',
                            reference: '&',
                            variable: 'item'
                        },
                        statements: []
                    }]
                }
            },
            'simple foreach over variable with list for value and no body statements': {
                code: 'foreach ($array as list($first, $second)) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FOREACH_STATEMENT',
                        array: {
                            name: 'N_VARIABLE',
                            variable: 'array'
                        },
                        value: {
                            name: 'N_LIST',
                            elements: [{
                                name: 'N_VARIABLE',
                                variable: 'first'
                            }, {
                                name: 'N_VARIABLE',
                                variable: 'second'
                            }]
                        },
                        statements: []
                    }]
                }
            },
            'simple foreach over variable with key with one body statement': {
                code: 'foreach ($array as $key => $item) { echo 3; }',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FOREACH_STATEMENT',
                        array: {
                            name: 'N_VARIABLE',
                            variable: 'array'
                        },
                        key: {
                            name: 'N_VARIABLE',
                            variable: 'key'
                        },
                        value: {
                            name: 'N_VARIABLE',
                            variable: 'item'
                        },
                        statements: [{
                            name: 'N_ECHO_STATEMENT',
                            expression: {
                                name: 'N_INTEGER',
                                number: '3'
                            }
                        }]
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
