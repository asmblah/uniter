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

    describe('PHP Parser grammar comparison operators integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'assigning result of equality comparison to variable': {
                code: '$isEqual = $a == $b;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'isEqual'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'a'
                                    },
                                    right: [{
                                        operator: '==',
                                        operand: {
                                            name: 'N_VARIABLE',
                                            variable: 'b'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'assigning result of identicalness comparison to variable': {
                code: '$isEqual = $a === $b;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'isEqual'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'a'
                                    },
                                    right: [{
                                        operator: '===',
                                        operand: {
                                            name: 'N_VARIABLE',
                                            variable: 'b'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'assigning result of non-identicalness comparison to variable': {
                code: '$isEqual = $a !== $b;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'isEqual'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'a'
                                    },
                                    right: [{
                                        operator: '!==',
                                        operand: {
                                            name: 'N_VARIABLE',
                                            variable: 'b'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'assigning result of non-equality comparison to variable': {
                code: '$isEqual = $a != $b;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'isEqual'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'a'
                                    },
                                    right: [{
                                        operator: '!=',
                                        operand: {
                                            name: 'N_VARIABLE',
                                            variable: 'b'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'assigning result of less-than comparison to variable': {
                code: '$lessThan = $a < $b;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'lessThan'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'a'
                                    },
                                    right: [{
                                        operator: '<',
                                        operand: {
                                            name: 'N_VARIABLE',
                                            variable: 'b'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'assigning result of less-than-or-equal comparison to variable': {
                code: '$lessThanOrEqual = $a <= $b;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'lessThanOrEqual'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'a'
                                    },
                                    right: [{
                                        operator: '<=',
                                        operand: {
                                            name: 'N_VARIABLE',
                                            variable: 'b'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'assigning result of greater-than comparison to variable': {
                code: '$greaterThan = $a > $b;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'greaterThan'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'a'
                                    },
                                    right: [{
                                        operator: '>',
                                        operand: {
                                            name: 'N_VARIABLE',
                                            variable: 'b'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'assigning result of greater-than-or-equal comparison to variable': {
                code: '$greaterThanOrEqual = $a >= $b;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'greaterThanOrEqual'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'a'
                                    },
                                    right: [{
                                        operator: '>=',
                                        operand: {
                                            name: 'N_VARIABLE',
                                            variable: 'b'
                                        }
                                    }]
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
