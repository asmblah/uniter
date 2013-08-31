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
                expectedResult: 'hello'
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
                expectedResult: 'world'
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
                expectedResult: 'hello world'
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
                        target: '$arg',
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
                                left: '$arg',
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
                                    left: '$arg',
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
                expectedResult: 'Banana'
            },
            {
                originalCode: '<?php $arr = array("hello", 84 + 3); return $arr;',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$arr',
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: [{
                                name: 'N_STRING_LITERAL',
                                string: 'hello'
                            }, {
                                name: 'N_EXPRESSION',
                                left: '84',
                                right: [{
                                    operator: '+',
                                    operand: '3'
                                }]
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: '$arr'
                    }]
                },
                expectedResult: ['hello', 87]
            },
            {
                originalCode: '<?php $names = array("Peter", "Paul", "Bex"); return $names[1];',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$names',
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
                            array: '$names',
                            indices: [{index: '1'}]
                        }
                    }]
                },
                expectedResult: 'Paul'
            },
            {
                originalCode: '<?php $a = 4; $b = $a++; return array($a, $b);',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$a',
                        expression: '4'
                    }, {
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$b',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: '$a',
                            operator: '++',
                            prefix: false
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: ['$a', '$b']
                        }
                    }]
                },
                // Note that the pre-increment value is used
                expectedResult: [5, 4]
            },
            {
                originalCode: '<?php $a = 4; $b = ++$a; return array($a, $b);',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$a',
                        expression: '4'
                    }, {
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$b',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: '$a',
                            operator: '++',
                            prefix: true
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: ['$a', '$b']
                        }
                    }]
                },
                // Note that the post-increment value is used
                expectedResult: [5, 5]
            },
            {
                originalCode: '<?php $a = 4; $b = $a--; return array($a, $b);',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$a',
                        expression: '4'
                    }, {
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$b',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: '$a',
                            operator: '--',
                            prefix: false
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: ['$a', '$b']
                        }
                    }]
                },
                // Note that the pre-decrement value is used
                expectedResult: [3, 4]
            },
            {
                originalCode: '<?php $a = 4; $b = --$a; return array($a, $b);',
                ast: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$a',
                        expression: '4'
                    }, {
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$b',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: '$a',
                            operator: '--',
                            prefix: true
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_LITERAL',
                            elements: ['$a', '$b']
                        }
                    }]
                },
                // Note that the post-decrement value is used
                expectedResult: [3, 3]
            }
        ], function (scenario) {
            // Pretty-print the code strings so any non-printable characters are readable
            it('should return the expected result when the original code was "' + scenario.originalCode + '"', function () {
                expect(interpreter.interpret(scenario.ast)).to.deep.equal(scenario.expectedResult);
            });
        });
    });
});
