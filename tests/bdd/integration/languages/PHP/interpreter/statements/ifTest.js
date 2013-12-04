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

    describe('PHP Interpreter if statement integration', function () {
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
                originalCode: 'if (true) { return "yes"; } else { return "no"; }',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        consequentStatements: [{
                            name: 'N_RETURN_STATEMENT',
                            expression: {
                                name: 'N_STRING_LITERAL',
                                string: 'yes'
                            }
                        }],
                        alternateStatements: [{
                            name: 'N_RETURN_STATEMENT',
                            expression: {
                                name: 'N_STRING_LITERAL',
                                string: 'no'
                            }
                        }]
                    }]
                },
                expectedResult: 'yes',
                expectedResultType: 'string'
            },
            {
                originalCode: 'if (false) { return "yes"; } else { return "no"; }',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'false'
                        },
                        consequentStatements: [{
                            name: 'N_RETURN_STATEMENT',
                            expression: {
                                name: 'N_STRING_LITERAL',
                                string: 'yes'
                            }
                        }],
                        alternateStatements: [{
                            name: 'N_RETURN_STATEMENT',
                            expression: {
                                name: 'N_STRING_LITERAL',
                                string: 'no'
                            }
                        }]
                    }]
                },
                expectedResult: 'no',
                expectedResultType: 'string'
            }
        ], function (scenario) {
            describe('when the original code was "' + scenario.originalCode + '"', function () {
                it('should return the expected result', function () {
                    expect(interpreter.interpret(scenario.ast).value).to.deep.equal(scenario.expectedResult);
                });

                it('should return a value of type "' + scenario.expectedResultType + '"', function () {
                    expect(interpreter.interpret(scenario.ast).type).to.deep.equal(scenario.expectedResultType);
                });
            });
        });
    });
});
