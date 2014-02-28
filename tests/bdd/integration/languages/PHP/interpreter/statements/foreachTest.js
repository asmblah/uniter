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

    describe('PHP Interpreter foreach statement integration', function () {
        var interpreter,
            stderr,
            stdin,
            stdout;

        beforeEach(function () {
            stderr = new Stream();
            stdin = new Stream();
            stdout = new Stream();
            interpreter = tools.createInterpreter(tools.createHostEnvironment(), stdin, stdout, stderr);
        });

        util.each([
            {
                originalCode: '$result = ""; foreach (array("a", "b", "c") as $key => $item) { $result = $result . $item; } return $result;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'result'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_STRING_LITERAL',
                                    string: ''
                                }
                            }]
                        }
                    }, {
                        name: 'N_FOREACH_STATEMENT',
                        array: {
                            name: 'N_ARRAY_LITERAL',
                            elements: [{
                                name: 'N_STRING_LITERAL',
                                string: 'a'
                            }, {
                                name: 'N_STRING_LITERAL',
                                string: 'b'
                            }, {
                                name: 'N_STRING_LITERAL',
                                string: 'c'
                            }]
                        },
                        key: {
                            name: 'N_VARIABLE',
                            variable: 'key'
                        },
                        value: {
                            name: 'N_VARIABLE',
                            variable: 'item'
                        },
                        body: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: [{
                                name: 'N_EXPRESSION_STATEMENT',
                                expression: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'result'
                                    },
                                    right: [{
                                        operator: '=',
                                        operand: {
                                            name: 'N_EXPRESSION',
                                            left: {
                                                name: 'N_VARIABLE',
                                                variable: 'result'
                                            },
                                            right: [{
                                                operator: '.',
                                                operand: {
                                                    name: 'N_VARIABLE',
                                                    variable: 'item'
                                                }
                                            }]
                                        }
                                    }]
                                }
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: 'result'
                        }
                    }]
                },
                expectedResult: 'abc',
                expectedResultType: 'string'
            }
        ], function (scenario) {
            describe('when the original code was ' + JSON.stringify(scenario.originalCode), function () {
                it('should return the expected result', function (done) {
                    interpreter.interpret(scenario.ast).done(function (value) {
                        expect(value).to.deep.equal(scenario.expectedResult);
                        done();
                    });
                });

                it('should return a value of type "' + scenario.expectedResultType + '"', function (done) {
                    interpreter.interpret(scenario.ast).done(function (value, type) {
                        expect(type).to.deep.equal(scenario.expectedResultType);
                        done();
                    });
                });
            });
        });
    });
});
