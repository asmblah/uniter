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
    '../tools',
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
                expectedResult: null,
                expectedResultType: 'null'
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
                expectedResult: null,
                expectedResultType: 'null'
            },
            {
                originalCode: '<?php',
                ast: {
                    name: 'N_PROGRAM',
                    statements: []
                },
                expectedResult: null,
                expectedResultType: 'null'
            },
            {
                originalCode: '<?php ?>',
                ast: {
                    name: 'N_PROGRAM',
                    statements: []
                },
                expectedResult: null,
                expectedResultType: 'null'
            },
            {
                originalCode: '<?php $a = 7;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$a'
                        },
                        expression: {
                            name: 'N_INTEGER',
                            number: '7'
                        }
                    }]
                },
                // Not 7, because the value is never returned
                expectedResult: null,
                expectedResultType: 'null'
            },
            {
                originalCode: '<?php return 0;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_INTEGER',
                            number: '0'
                        }
                    }]
                },
                expectedResult: 0,
                expectedResultType: 'integer'
            },
            {
                originalCode: '<?php $a = 7; return $a;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$a'
                        },
                        expression: {
                            name: 'N_INTEGER',
                            number: '7'
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: '$a'
                        }
                    }]
                },
                expectedResult: 7,
                expectedResultType: 'integer'
            },
            {
                originalCode: '<?php $b = 3 * 2; return $b;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$b'
                        },
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_INTEGER',
                                number: '3'
                            },
                            right: [{
                                operator: '*',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '2'
                                }
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: '$b'
                        }
                    }]
                },
                expectedResult: 6,
                expectedResultType: 'integer'
            },
            {
                originalCode: '<?php $result = (1 + 3) * 2; return $result;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$result'
                        },
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_INTEGER',
                                    number: '1'
                                },
                                right: [{
                                    operator: '+',
                                    operand: {
                                        name: 'N_INTEGER',
                                        number: '3'
                                    }
                                }]
                            },
                            right: [{
                                operator: '*',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '2'
                                }
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: '$result'
                        }
                    }]
                },
                // Checks precedence handling of explicit parentheses, as "1 + (3 * 2)" will be 7 whereas "(1 + 3) * 2" will be 8
                expectedResult: 8,
                expectedResultType: 'integer'
            },
            {
                originalCode: '<?php return "hello";',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_STRING_LITERAL',
                            string: 'hello'
                        }
                    }]
                },
                // Constant string literal, delimited by double quotes
                expectedResult: 'hello',
                expectedResultType: 'string'
            },
            {
                originalCode: '<?php return \'world\';',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_STRING_LITERAL',
                            string: 'world'
                        }
                    }]
                },
                // Constant string literal, delimited by single quotes
                expectedResult: 'world',
                expectedResultType: 'string'
            },
            {
                originalCode: '<?php return \'hello \' . \'world\';',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_STRING_LITERAL',
                                string: 'hello '
                            },
                            right: [{
                                operator: '.',
                                operand: {
                                    name: 'N_STRING_LITERAL',
                                    string: 'world'
                                }
                            }]
                        }
                    }]
                },
                expectedResult: 'hello world',
                expectedResultType: 'string'
            },
            // Ternary with nested ternary in condition:
            // - Common gotcha for developers, as in other languages ?: is right-associative whereas in PHP it's left-associative
            // - Result should be "Banana", but if right-associative it would be "Orange"
            {
                originalCode: '<?php $arg = "A"; return ($arg === "A") ? "Apple" : ($arg === "B") ? "Banana" : "Orange";',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$arg'
                        },
                        expression: {
                            name: 'N_STRING_LITERAL',
                            string: 'A'
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_TERNARY',
                            condition: {
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_VARIABLE',
                                    variable: '$arg'
                                },
                                right: [{
                                    operator: '===',
                                    operand: {
                                        name: 'N_STRING_LITERAL',
                                        string: 'A'
                                    }
                                }]
                            },
                            options: [{
                                consequent: {
                                    name: 'N_STRING_LITERAL',
                                    string: 'Apple'
                                },
                                alternate: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: '$arg'
                                    },
                                    right: [{
                                        operator: '===',
                                        operand: {
                                            name: 'N_STRING_LITERAL',
                                            string: 'B'
                                        }
                                    }]
                                }
                            }, {
                                consequent: {
                                    name: 'N_STRING_LITERAL',
                                    string: 'Banana'
                                },
                                alternate: {
                                    name: 'N_STRING_LITERAL',
                                    string: 'Orange'
                                }
                            }]
                        }
                    }]
                },
                expectedResult: 'Banana',
                expectedResultType: 'string'
            },
            {
                originalCode: '<?php $arr = array("hello", 84 + 3); return $arr;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$arr'
                        },
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: [{
                                name: 'N_STRING_LITERAL',
                                string: 'hello'
                            }, {
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_INTEGER',
                                    number: '84'
                                },
                                right: [{
                                    operator: '+',
                                    operand: {
                                        name: 'N_INTEGER',
                                        number: '3'
                                    }
                                }]
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: '$arr'
                        }
                    }]
                },
                expectedResult: ['hello', 87],
                expectedResultType: 'array'
            },
            {
                originalCode: '<?php $names = array("Peter", "Paul", "Bex"); return $names[1];',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$names'
                        },
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: [{
                                name: 'N_STRING_LITERAL',
                                string: 'Peter'
                            }, {
                                name: 'N_STRING_LITERAL',
                                string: 'Paul'
                            }, {
                                name: 'N_STRING_LITERAL',
                                string: 'Bex'
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_INDEX',
                            array: {
                                name: 'N_VARIABLE',
                                variable: '$names'
                            },
                            indices: [{index: {
                                name: 'N_INTEGER',
                                number: '1'
                            }}]
                        }
                    }]
                },
                expectedResult: 'Paul',
                expectedResultType: 'string'
            },
            {
                originalCode: '<?php $a = 4; $b = $a++; return array($a, $b);',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$a'
                        },
                        expression: {
                            name: 'N_INTEGER',
                            number: '4'
                        }
                    }, {
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$b'
                        },
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: {
                                name: 'N_VARIABLE',
                                variable: '$a'
                            },
                            operator: '++',
                            prefix: false
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: [{
                                name: 'N_VARIABLE',
                                variable: '$a'
                            }, {
                                name: 'N_VARIABLE',
                                variable: '$b'
                            }]
                        }
                    }]
                },
                // Note that the pre-increment value is used
                expectedResult: [5, 4],
                expectedResultType: 'array'
            },
            {
                originalCode: '<?php $a = 4; $b = ++$a; return array($a, $b);',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$a'
                        },
                        expression: {
                            name: 'N_INTEGER',
                            number: '4'
                        }
                    }, {
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$b'
                        },
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: {
                                name: 'N_VARIABLE',
                                variable: '$a'
                            },
                            operator: '++',
                            prefix: true
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: [{
                                name: 'N_VARIABLE',
                                variable: '$a'
                            }, {
                                name: 'N_VARIABLE',
                                variable: '$b'
                            }]
                        }
                    }]
                },
                // Note that the post-increment value is used
                expectedResult: [5, 5],
                expectedResultType: 'array'
            },
            {
                originalCode: '<?php $a = 4; $b = $a--; return array($a, $b);',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$a'
                        },
                        expression: {
                            name: 'N_INTEGER',
                            number: '4'
                        }
                    }, {
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$b'
                        },
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: {
                                name: 'N_VARIABLE',
                                variable: '$a'
                            },
                            operator: '--',
                            prefix: false
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: [{
                                name: 'N_VARIABLE',
                                variable: '$a'
                            }, {
                                name: 'N_VARIABLE',
                                variable: '$b'
                            }]
                        }
                    }]
                },
                // Note that the pre-decrement value is used
                expectedResult: [3, 4],
                expectedResultType: 'array'
            },
            {
                originalCode: '<?php $a = 4; $b = --$a; return array($a, $b);',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$a'
                        },
                        expression: {
                            name: 'N_INTEGER',
                            number: '4'
                        }
                    }, {
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: {
                            name: 'N_VARIABLE',
                            variable: '$b'
                        },
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: {
                                name: 'N_VARIABLE',
                                variable: '$a'
                            },
                            operator: '--',
                            prefix: true
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: [{
                                name: 'N_VARIABLE',
                                variable: '$a'
                            }, {
                                name: 'N_VARIABLE',
                                variable: '$b'
                            }]
                        }
                    }]
                },
                // Note that the post-decrement value is used
                expectedResult: [3, 3],
                expectedResultType: 'array'
            },
            {
                originalCode: '<?php return ~1;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operator: '~',
                            operand: {
                                name: 'N_INTEGER',
                                number: '1'
                            },
                            prefix: true
                        }
                    }]
                },
                expectedResult: -2,
                expectedResultType: 'integer'
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
