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

    describe('PHP Parser grammar array access operator integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each([
            {
                // Simple numeric index read
                code: '$a = $elements[0];',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$a'
                        },
                        expression: {
                            name: 'N_ARRAY_INDEX',
                            array: {
                                name: 'N_VARIABLE',
                                variable: '$elements'
                            },
                            indices: [{
                                index: {
                                    name: 'N_INTEGER',
                                    number: '0'
                                }
                            }]
                        }
                    }]
                }
            }, {
                // Simple numeric index assignment
                code: '$elements[2] = 4;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_ARRAY_INDEX',
                            array: {
                                name: 'N_VARIABLE',
                                variable: '$elements'
                            },
                            indices: [{
                                index: {
                                    name: 'N_INTEGER',
                                    number: '2'
                                }
                            }]
                        },
                        expression:{
                            name: 'N_INTEGER',
                            number: '4'
                        }
                    }]
                }
            }
        ], function (scenario) {
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
