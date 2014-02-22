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

    describe('PHP Parser grammar scope resolution operator "::" integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'assignment to statically referenced static property of statically referenced class without namespace prefix': {
                code: 'MyClass::$prop = 7;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_STATIC_PROPERTY',
                                className: {
                                    name: 'N_STRING',
                                    string: 'MyClass'
                                },
                                property: {
                                    name: 'N_STRING',
                                    string: 'prop'
                                }
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '7'
                                }
                            }]
                        }
                    }]
                }
            },
            'assignment to statically referenced static property of statically referenced class with namespace prefix': {
                code: '\\My\\Awesome\\Stuff::$prop = 6;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_STATIC_PROPERTY',
                                className: {
                                    name: 'N_STRING',
                                    string: '\\My\\Awesome\\Stuff'
                                },
                                property: {
                                    name: 'N_STRING',
                                    string: 'prop'
                                }
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '6'
                                }
                            }]
                        }
                    }]
                }
            },
            'assignment to statically referenced static property of dynamically referenced class stored in variable': {
                code: '$myClassName::$prop = 5;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_STATIC_PROPERTY',
                                className: {
                                    name: 'N_VARIABLE',
                                    variable: 'myClassName'
                                },
                                property: {
                                    name: 'N_STRING',
                                    string: 'prop'
                                }
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '5'
                                }
                            }]
                        }
                    }]
                }
            },
            'assignment to statically referenced static property of dynamically referenced class stored at array index': {
                code: '$classes[7]::$prop = 5;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_STATIC_PROPERTY',
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
                                property: {
                                    name: 'N_STRING',
                                    string: 'prop'
                                }
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '5'
                                }
                            }]
                        }
                    }]
                }
            },
            'assignment to dynamically ($$) referenced static property of dynamically referenced class stored in variable': {
                code: '$myClass::$$prop = 4;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_STATIC_PROPERTY',
                                className: {
                                    name: 'N_VARIABLE',
                                    variable: 'myClass'
                                },
                                property: {
                                    name: 'N_VARIABLE',
                                    variable: 'prop'
                                }
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '4'
                                }
                            }]
                        }
                    }]
                }
            },
            'assignment to dynamically (${$...}) referenced static property of dynamically referenced class stored in variable': {
                code: '$myClass::${$prop} = 4;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_STATIC_PROPERTY',
                                className: {
                                    name: 'N_VARIABLE',
                                    variable: 'myClass'
                                },
                                property: {
                                    name: 'N_VARIABLE',
                                    variable: 'prop'
                                }
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '4'
                                }
                            }]
                        }
                    }]
                }
            },
            'assignment to dynamically (${...}) referenced static property of dynamically referenced class stored in variable': {
                code: '$myClass::${"prop name"} = 4;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_STATIC_PROPERTY',
                                className: {
                                    name: 'N_VARIABLE',
                                    variable: 'myClass'
                                },
                                property: {
                                    name: 'N_STRING_LITERAL',
                                    string: 'prop name'
                                }
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '4'
                                }
                            }]
                        }
                    }]
                }
            },
            'assignment to dynamically (${<expr>}) referenced static property of dynamically referenced class stored in variable': {
                code: '$myClass::${"my" . "prop"} = 3;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_STATIC_PROPERTY',
                                className: {
                                    name: 'N_VARIABLE',
                                    variable: 'myClass'
                                },
                                property: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_STRING_LITERAL',
                                        string: 'my'
                                    },
                                    right: [{
                                        operator: '.',
                                        operand: {
                                            name: 'N_STRING_LITERAL',
                                            string: 'prop'
                                        }
                                    }]
                                }
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '3'
                                }
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
