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
    'js/util',
    'js/Interpreter'
], function (
    util,
    Interpreter
) {
    'use strict';

    describe('Interpreter', function () {
        describe('getEnvironment()', function () {
            describe('when using interpreter spec #1', function () {
                var interpreter,
                    interpreterSpec,
                    LanguageEnvironment;

                beforeEach(function () {
                    LanguageEnvironment = function () {};

                    interpreterSpec = {
                        Environment: LanguageEnvironment,
                        nodes: {
                            'PROGRAM': function () {}
                        }
                    };

                    interpreter = new Interpreter(interpreterSpec);
                });

                it('should create an instance of the class defined by Environment', function () {
                    expect(interpreter.getEnvironment()).to.be.an.instanceOf(LanguageEnvironment);
                });

                it('should return the same object when called multiple times', function () {
                    var environment = interpreter.getEnvironment();

                    expect(interpreter.getEnvironment()).to.equal(environment);
                });
            });
        });

        describe('interpret()', function () {
            describe('when using interpreter spec #1', function () {
                var interpreter,
                    interpreterSpec;

                beforeEach(function () {
                    interpreterSpec = {
                        nodes: {
                            'EXPRESSION': function (node, interpret) {
                                var expression = node.left;

                                if (!util.isString(expression)) {
                                    expression = interpret(expression);
                                }

                                util.each(node.right, function (operation) {
                                    expression += ' ' + interpret(operation);
                                });

                                return '(' + expression + ')';
                            },
                            'OPERATION': function (node) {
                                return node.operator + ' ' + node.operand;
                            },
                            'PROGRAM': function (node, interpret) {
                                /*jshint evil:true */
                                var body = '';

                                util.each(node.statements, function (statement) {
                                    body += interpret(statement);
                                });

                                return new Function(body)();
                            },
                            'RETURN': function (node, interpret) {
                                var expression = node.expression;

                                if (expression && !util.isString(expression)) {
                                    expression = interpret(expression);
                                }

                                return 'return' + (expression ? ' ' + expression : '') + ';';
                            }
                        }
                    };

                    interpreter = new Interpreter(interpreterSpec);
                });

                util.each([
                    {
                        originalCode: 'return 128;',
                        ast: {
                            name: 'PROGRAM',
                            statements: [
                                {
                                    name: 'RETURN',
                                    expression: '128'
                                }
                            ]
                        },
                        expectedResult: 128
                    },
                    {
                        originalCode: 'return 2 + 3 - 4;',
                        ast: {
                            name: 'PROGRAM',
                            statements: [
                                {
                                    name: 'RETURN',
                                    expression: {
                                        name: 'EXPRESSION',
                                        left: '2',
                                        right: [{
                                            name: 'OPERATION',
                                            operator: '+',
                                            operand: '3'
                                        }, {
                                            name: 'OPERATION',
                                            operator: '-',
                                            operand: '4'
                                        }]
                                    }
                                }
                            ]
                        },
                        expectedResult: 1
                    },
                    {
                        originalCode: 'return (6 + 4) / 2;',
                        ast: {
                            name: 'PROGRAM',
                            statements: [
                                {
                                    name: 'RETURN',
                                    expression: {
                                        name: 'EXPRESSION',
                                        left: {
                                            name: 'EXPRESSION',
                                            left: '6',
                                            right: [{
                                                name: 'OPERATION',
                                                operator: '+',
                                                operand: '4'
                                            }]
                                        },
                                        right: [{
                                            name: 'OPERATION',
                                            operator: '/',
                                            operand: '2'
                                        }]
                                    }
                                }
                            ]
                        },
                        expectedResult: 5
                    }
                ], function (scenario) {
                    it('should return the correct result when the original code was "' + scenario.originalCode + '"', function () {
                        expect(interpreter.interpret(scenario.ast)).to.equal(scenario.expectedResult);
                    });
                });
            });

            describe('when the "data" argument to the root .interpret() call', function () {
                util.each({
                    'is not specified': {
                        rootInterpretArgs: [{
                            name: 'PROGRAM'
                        }],
                        expectedRootNodeHandlerData: null
                    },
                    'is null': {
                        rootInterpretArgs: [{
                            name: 'PROGRAM'
                        }, null],
                        expectedRootNodeHandlerData: null
                    },
                    'is the number 0': {
                        rootInterpretArgs: [{
                            name: 'PROGRAM'
                        }, 0],
                        expectedRootNodeHandlerData: 0
                    },
                    'is the number 4': {
                        rootInterpretArgs: [{
                            name: 'PROGRAM'
                        }, 4],
                        expectedRootNodeHandlerData: 4
                    }
                }, function (rootScenario, description) {
                    describe(description, function () {
                        var childNodeHandler,
                            interpreter,
                            programNodeHandler;

                        beforeEach(function () {
                            childNodeHandler = sinon.spy();
                            programNodeHandler = sinon.spy();
                            interpreter = new Interpreter({
                                nodes: {
                                    'CHILD': childNodeHandler,
                                    'PROGRAM': programNodeHandler
                                }
                            });
                        });

                        it('should pass ' + JSON.stringify(rootScenario.expectedRootNodeHandlerData) + ' to the root node\'s handler', function () {
                            interpreter.interpret.apply(interpreter, rootScenario.rootInterpretArgs);

                            expect(programNodeHandler).to.have.been.calledWith(sinon.match.any, sinon.match.any, rootScenario.expectedRootNodeHandlerData);
                        });

                        describe('and the "data" argument to the child .interpret() call', function () {
                            util.each({
                                'is not specified': {
                                    childInterpretArgs: [{
                                        name: 'CHILD'
                                    }],
                                    // Should inherit data from root node handler
                                    expectedChildNodeHandlerData: rootScenario.expectedRootNodeHandlerData
                                },
                                'is null': {
                                    childInterpretArgs: [{
                                        name: 'CHILD'
                                    }, null],
                                    expectedChildNodeHandlerData: null
                                },
                                'is the number 0': {
                                    childInterpretArgs: [{
                                        name: 'CHILD'
                                    }, 0],
                                    expectedChildNodeHandlerData: 0
                                },
                                'is the number 5': {
                                    childInterpretArgs: [{
                                        name: 'CHILD'
                                    }, 5],
                                    expectedChildNodeHandlerData: 5
                                }
                            }, function (childScenario, description) {
                                describe(description, function () {
                                    it('should pass ' + JSON.stringify(childScenario.expectedChildNodeHandlerData) + ' to the child node\'s handler', function () {
                                        interpreter.interpret.apply(interpreter, rootScenario.rootInterpretArgs);

                                        programNodeHandler.args[0][1].apply(interpreter, childScenario.childInterpretArgs);

                                        expect(childNodeHandler).to.have.been.calledWith(sinon.match.any, sinon.match.any, childScenario.expectedChildNodeHandlerData);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
