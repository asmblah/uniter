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
    'js/util',
    'js/Stream'
], function (
    tools,
    util,
    Stream
) {
    'use strict';

    describe('PHP Interpreter spec small program integration', function () {
        var interpreter,
            stderr,
            stdin,
            stdout;

        beforeEach(function () {
            stderr = new Stream();
            stdin = new Stream();
            stdout = new Stream();
            interpreter = tools.createInterpreter(stdin, stdout, stderr);
        });

        util.each([
            {
                originalCode: '',
                ast: {
                    name: 'N_PROGRAM',
                    statements: []
                },
                expectedResult: undefined
            },
            {
                originalCode: '<a>42</a><b />',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INLINE_HTML_STATEMENT',
                        html: '<a>42</a><b />'
                    }]
                },
                expectedResult: undefined
            },
            {
                originalCode: '<?php',
                ast: {
                    name: 'N_PROGRAM',
                    statements: []
                },
                expectedResult: undefined
            },
            {
                originalCode: '<?php ?>',
                ast: {
                    name: 'N_PROGRAM',
                    statements: []
                },
                expectedResult: undefined
            },
            {
                originalCode: '<?php $a = 7;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$a',
                        expression: '7'
                    }]
                },
                // Not 7, because the value is never returned
                expectedResult: undefined
            },
            {
                originalCode: '<?php return 0;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: '0'
                    }]
                },
                expectedResult: 0
            },
            {
                originalCode: '<?php $a = 7; return $a;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$a',
                        expression: '7'
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: '$a'
                    }]
                },
                expectedResult: 7
            },
            {
                originalCode: '<?php $b = 3 * 2; return $b;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$a',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: '3',
                            right: [{
                                operator: '*',
                                operand: '2'
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: '$a'
                    }]
                },
                expectedResult: 6
            },
            {
                originalCode: '<?php $result = (1 + 3) * 2; return $result;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$result',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_EXPRESSION',
                                left: '1',
                                right: [{
                                    operator: '+',
                                    operand: '3'
                                }]
                            },
                            right: [{
                                operator: '*',
                                operand: '2'
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: '$result'
                    }]
                },
                // Checks precedence handling of explicit parentheses, as "1 + (3 * 2)" will be 7 whereas "(1 + 3) * 2" will be 8
                expectedResult: 8
            }
        ], function (scenario) {
            // Pretty-print the code strings so any non-printable characters are readable
            it('should return the expected AST when the original code was "' + scenario.originalCode + '"', function () {
                expect(interpreter.interpret(scenario.ast)).to.deep.equal(scenario.expectedResult);
            });
        });
    });
});
