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

    describe('PHP Parser grammar array literal expression integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'array with one associative element': {
                code: '$array = array("a" => "b");',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: '$array'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_ARRAY_LITERAL',
                                    elements: [{
                                        name: 'N_KEY_VALUE_PAIR',
                                        key: {
                                            name: 'N_STRING_LITERAL',
                                            string: 'a'
                                        },
                                        value: {
                                            name: 'N_STRING_LITERAL',
                                            string: 'b'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            }
        }, function (scenario) {
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
