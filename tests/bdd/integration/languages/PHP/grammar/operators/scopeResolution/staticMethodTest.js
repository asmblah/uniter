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

    describe('PHP Parser grammar scope resolution operator "::" static method integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'calling statically referenced static method of statically referenced class without namespace prefix': {
                code: 'MyClass::myMethod(7);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_STATIC_METHOD_CALL',
                            className: {
                                name: 'N_STRING',
                                string: 'MyClass'
                            },
                            method: {
                                name: 'N_STRING',
                                string: 'myMethod'
                            },
                            args: [{
                                name: 'N_INTEGER',
                                number: '7'
                            }]
                        }
                    }]
                }
            },
            'calling statically referenced static method of statically referenced class with namespace prefix': {
                code: '\\My\\Awesome\\Stuff::myMethod(6);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_STATIC_METHOD_CALL',
                            className: {
                                name: 'N_STRING',
                                string: '\\My\\Awesome\\Stuff'
                            },
                            method: {
                                name: 'N_STRING',
                                string: 'myMethod'
                            },
                            args: [{
                                name: 'N_INTEGER',
                                number: '6'
                            }]
                        }
                    }]
                }
            },
            'calling statically referenced static method of dynamically referenced class stored in variable': {
                code: '$myClassName::myMethod(5);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_STATIC_METHOD_CALL',
                            className: {
                                name: 'N_VARIABLE',
                                variable: 'myClassName'
                            },
                            method: {
                                name: 'N_STRING',
                                string: 'myMethod'
                            },
                            args: [{
                                name: 'N_INTEGER',
                                number: '5'
                            }]
                        }
                    }]
                }
            },
            'calling statically referenced static method of dynamically referenced class stored at array index': {
                code: '$classes[7]::myMethod(5);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_STATIC_METHOD_CALL',
                            className: {
                                name: 'N_ARRAY_INDEX',
                                array: {
                                    name: 'N_VARIABLE',
                                    variable: 'classes'
                                },
                                indices: [{
                                    index: {
                                        name: 'N_INTEGER',
                                        number: '7'
                                    }
                                }]
                            },
                            method: {
                                name: 'N_STRING',
                                string: 'myMethod'
                            },
                            args: [{
                                name: 'N_INTEGER',
                                number: '5'
                            }]
                        }
                    }]
                }
            },
            'calling dynamically ($...) referenced static method of dynamically referenced class stored in variable': {
                code: '$myClass::$myMethodName(4);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_STATIC_METHOD_CALL',
                            className: {
                                name: 'N_VARIABLE',
                                variable: 'myClass'
                            },
                            method: {
                                name: 'N_VARIABLE',
                                variable: 'myMethodName'
                            },
                            args: [{
                                name: 'N_INTEGER',
                                number: '4'
                            }]
                        }
                    }]
                }
            },
            'calling dynamically (${$...}) referenced static method with name referenced by variable variable': {
                code: '$myClass::${$myMethodVariableName}(4);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_STATIC_METHOD_CALL',
                            className: {
                                name: 'N_VARIABLE',
                                variable: 'myClass'
                            },
                            method: {
                                name: 'N_VARIABLE_EXPRESSION',
                                expression: {
                                    name: 'N_VARIABLE',
                                    variable: 'myMethodVariableName'
                                }
                            },
                            args: [{
                                name: 'N_INTEGER',
                                number: '4'
                            }]
                        }
                    }]
                }
            },
            'calling dynamically (${...}) referenced static method with name referenced by variable variable': {
                code: '$myClass::${"variable name"}(4);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_STATIC_METHOD_CALL',
                            className: {
                                name: 'N_VARIABLE',
                                variable: 'myClass'
                            },
                            method: {
                                name: 'N_VARIABLE_EXPRESSION',
                                expression: {
                                    name: 'N_STRING_LITERAL',
                                    string: 'variable name'
                                }
                            },
                            args: [{
                                name: 'N_INTEGER',
                                number: '4'
                            }]
                        }
                    }]
                }
            },
            'calling dynamically (${<expr>}) referenced static method with name referenced by variable variable': {
                code: '$myClass::${"my" . "variable"}(4);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_STATIC_METHOD_CALL',
                            className: {
                                name: 'N_VARIABLE',
                                variable: 'myClass'
                            },
                            method: {
                                name: 'N_VARIABLE_EXPRESSION',
                                expression: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_STRING_LITERAL',
                                        string: 'my'
                                    },
                                    right: [{
                                        operator: '.',
                                        operand: {
                                            name: 'N_STRING_LITERAL',
                                            string: 'variable'
                                        }
                                    }]
                                }
                            },
                            args: [{
                                name: 'N_INTEGER',
                                number: '4'
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
