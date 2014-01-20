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

    describe('PHP Parser grammar if statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'simple if with no consequent body statements': {
                code: 'if (true) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        consequentStatement: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: []
                        }
                    }]
                }
            },
            'simple if with no consequent or alternate body statements': {
                code: 'if (true) {} else {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        consequentStatement: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: []
                        },
                        alternateStatement: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: []
                        }
                    }]
                }
            },
            'if with more complex expression and one consequent body statement': {
                code: 'if ($accountNumber === 2) { $cheques = 7; }',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'accountNumber'
                            },
                            right: [{
                                operator: '===',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '2'
                                }
                            }]
                        },
                        consequentStatement: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: [{
                                name: 'N_EXPRESSION_STATEMENT',
                                expression: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'cheques'
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
                    }]
                }
            },
            'if with consequent statement without compound braces': {
                code: 'if (true) echo 1;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        consequentStatement: {
                            name: 'N_ECHO_STATEMENT',
                            expression: {
                                name: 'N_INTEGER',
                                number: '1'
                            }
                        }
                    }]
                }
            },
            'if with one else if (space)': {
                code: 'if (true) {} else if (false) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        consequentStatement: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: []
                        },
                        alternateStatement: {
                            name: 'N_IF_STATEMENT',
                            condition: {
                                name: 'N_BOOLEAN',
                                bool: 'false'
                            },
                            consequentStatement: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: []
                            }
                        }
                    }]
                }
            },
            'if with one elseif (no space)': {
                code: 'if (true) {} elseif (false) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        consequentStatement: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: []
                        },
                        alternateStatement: {
                            name: 'N_IF_STATEMENT',
                            condition: {
                                name: 'N_BOOLEAN',
                                bool: 'false'
                            },
                            consequentStatement: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: []
                            }
                        }
                    }]
                }
            },
            'if with one elseif (no space) and an else': {
                code: 'if (true) {} elseif (false) {} else {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        consequentStatement: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: []
                        },
                        alternateStatement: {
                            name: 'N_IF_STATEMENT',
                            condition: {
                                name: 'N_BOOLEAN',
                                bool: 'false'
                            },
                            consequentStatement: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: []
                            },
                            alternateStatement: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: []
                            }
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
