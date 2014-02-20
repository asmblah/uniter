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
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    describe('PHP Parser grammar __FILE__ magic constant expression integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'simple echo of current file using correct case': {
                code: 'echo __FILE__;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ECHO_STATEMENT',
                        expression: {
                            name: 'N_MAGIC_FILE_CONSTANT'
                        }
                    }]
                }
            },
            'simple echo of current file using weird case': {
                code: 'echo __FilE__;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ECHO_STATEMENT',
                        expression: {
                            name: 'N_MAGIC_FILE_CONSTANT'
                        }
                    }]
                }
            },
            'assignment of current file to variable using correct case': {
                code: '$file = __FILE__;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'file'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_MAGIC_FILE_CONSTANT'
                                }
                            }]
                        }
                    }]
                }
            },
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
