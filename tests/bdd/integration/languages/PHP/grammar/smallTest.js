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
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    describe('PHP Parser grammar small program integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each([
            {
                code: '',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: []
                }
            },
            {
                code: '<a>42</a><b />',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INLINE_HTML_STATEMENT',
                        html: '<a>42</a><b />'
                    }]
                }
            },
            {
                code: '<?php',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: []
                }
            },
            {
                code: '<?php ?>',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: []
                }
            },
            {
                code: 'before<?php ?>',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INLINE_HTML_STATEMENT',
                        html: 'before'
                    }]
                }
            },
            {
                code: '<html><?php $b = 2; ?></html>',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INLINE_HTML_STATEMENT',
                        html: '<html>'
                    }, {
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'b'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '2'
                                }
                            }]
                        }
                    }, {
                        name: 'N_INLINE_HTML_STATEMENT',
                        html: '</html>'
                    }]
                }
            },
            {
                code: '<?php $a = 7;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'a'
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
            {
                code: '<?php return 0;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_INTEGER',
                            number: '0'
                        }
                    }]
                }
            },
            {
                code: '<?php $result = 6; return $result;',
                expectedAST: {
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
                                    name: 'N_INTEGER',
                                    number: '6'
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
                }
            },
            {
                code: '<?php $y = 3 * 4; return $y;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'y'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_INTEGER',
                                        number: '3'
                                    },
                                    right: [{
                                        operator: '*',
                                        operand: {
                                            name: 'N_INTEGER',
                                            number: '4'
                                        }
                                    }]
                                }
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: 'y'
                        }
                    }]
                }
            },
            {
                code: '<?php return \'hello\';',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_STRING_LITERAL',
                            string: 'hello'
                        }
                    }]
                }
            },
            {
                code: '<?php return "world";',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_STRING_LITERAL',
                            string: 'world'
                        }
                    }]
                }
            },
            {
                code: '<?php return \'hello \' . \'world\';',
                expectedAST: {
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
                }
            },
            // Simple ternary
            {
                code: '<?php return 1 ? 4 : 8;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_TERNARY',
                            condition: {
                                name: 'N_INTEGER',
                                number: '1'
                            },
                            options: [{
                                consequent: {
                                    name: 'N_INTEGER',
                                    number: '4'
                                },
                                alternate: {
                                    name: 'N_INTEGER',
                                    number: '8'
                                }
                            }]
                        }
                    }]
                }
            },
            // Ternary with higher precedence "+" operator in condition, consequent and alternate
            {
                code: '<?php return 1 + 2 ? 3 + 2 : 7 + 5;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_TERNARY',
                            condition: {
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_INTEGER',
                                    number: '1'
                                },
                                right: [{
                                    operator: '+',
                                    operand: {
                                        name: 'N_INTEGER',
                                        number: '2'
                                    }
                                }]
                            },
                            options: [{
                                consequent: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_INTEGER',
                                        number: '3'
                                    },
                                    right: [{
                                        operator: '+',
                                        operand: {
                                            name: 'N_INTEGER',
                                            number: '2'
                                        }
                                    }]
                                },
                                alternate: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_INTEGER',
                                        number: '7'
                                    },
                                    right: [{
                                        operator: '+',
                                        operand: {
                                            name: 'N_INTEGER',
                                            number: '5'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            // Ternary with nested ternary in condition:
            // - Common gotcha for developers, as in other languages ?: is right-associative whereas in PHP it's left-associative
            // - Result would be "Banana", but if right-associative it would be "Orange"
            {
                code: '<?php $arg = "A"; return ($arg === "A") ? "Apple" : ($arg === "B") ? "Banana" : "Orange";',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'arg'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_STRING_LITERAL',
                                    string: 'A'
                                }
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_TERNARY',
                            condition: {
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_VARIABLE',
                                    variable: 'arg'
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
                                        variable: 'arg'
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
                }
            },
            {
                code: '<?php $arr = array(); return $arr;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'arr'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_ARRAY_LITERAL',
                                    elements: []
                                }
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: 'arr'
                        }
                    }]
                }
            },
            {
                code: '<?php $arr = array(7); return $arr;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'arr'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_ARRAY_LITERAL',
                                    elements: [{
                                        name: 'N_INTEGER',
                                        number: '7'
                                    }]
                                }
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: 'arr'
                        }
                    }]
                }
            },
            {
                code: '<?php $arr = array("hello", 84 + 3); return $arr;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'arr'
                            },
                            right: [{
                                operator: '=',
                                operand: {
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
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: 'arr'
                        }
                    }]
                }
            },
            {
                code: '<?php return $names[2];',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_ARRAY_INDEX',
                            array: {
                                name: 'N_VARIABLE',
                                variable: 'names'
                            },
                            indices: [{index: {
                                name: 'N_INTEGER',
                                number: '2'
                            }}]
                        }
                    }]
                }
            },
            {
                code: '<?php $a = 4; ++$a; return $a;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'a'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '4'
                                }
                            }]
                        }
                    }, {
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: {
                                name: 'N_VARIABLE',
                                variable: 'a'
                            },
                            operator: '++',
                            prefix: true
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: 'a'
                        }
                    }]
                }
            },
            {
                code: '<?php $a = 4; $a++; return $a;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'a'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '4'
                                }
                            }]
                        }
                    }, {
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: {
                                name: 'N_VARIABLE',
                                variable: 'a'
                            },
                            operator: '++',
                            prefix: false
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: 'a'
                        }
                    }]
                }
            },
            {
                code: '<?php $a = 4; --$a; return $a;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'a'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '4'
                                }
                            }]
                        }
                    }, {
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: {
                                name: 'N_VARIABLE',
                                variable: 'a'
                            },
                            operator: '--',
                            prefix: true
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: 'a'
                        }
                    }]
                }
            },
            {
                code: '<?php $a = 4; $a--; return $a;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'a'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '4'
                                }
                            }]
                        }
                    }, {
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operand: {
                                name: 'N_VARIABLE',
                                variable: 'a'
                            },
                            operator: '--',
                            prefix: false
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_VARIABLE',
                            variable: 'a'
                        }
                    }]
                }
            },
            {
                code: '<?php return ~4;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_UNARY_EXPRESSION',
                            operator: '~',
                            operand: {
                                name: 'N_INTEGER',
                                number: '4'
                            },
                            prefix: true
                        }
                    }]
                }
            }
        ], function (scenario) {
            // Pretty-print the code strings so any non-printable characters are readable
            describe('when the code is ' + JSON.stringify(scenario.code), function () {
                it('should return the expected AST', function () {
                    expect(parser.parse(scenario.code)).to.deep.equal(scenario.expectedAST);
                });
            });
        });
    });
});
