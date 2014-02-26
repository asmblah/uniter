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

    describe('PHP Parser grammar switch statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'switch with no cases or default case': {
                code: 'switch (null) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_SWITCH_STATEMENT',
                        expression: {
                            name: 'N_NULL'
                        },
                        cases: []
                    }]
                }
            },
            'switch with one empty case': {
                code: 'switch (null) {case 1:}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_SWITCH_STATEMENT',
                        expression: {
                            name: 'N_NULL'
                        },
                        cases: [{
                            name: 'N_CASE',
                            expression: {
                                name: 'N_INTEGER',
                                number: '1'
                            },
                            body: []
                        }]
                    }]
                }
            },
            'switch with one empty case with one statement but no break': {
                code: 'switch (null) {case 1: $a = 7;}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_SWITCH_STATEMENT',
                        expression: {
                            name: 'N_NULL'
                        },
                        cases: [{
                            name: 'N_CASE',
                            expression: {
                                name: 'N_INTEGER',
                                number: '1'
                            },
                            body: [{
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
                        }]
                    }]
                }
            },
            'switch with one case with one statement and break': {
                code: 'switch (null) {case 1: $a = 7; break;}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_SWITCH_STATEMENT',
                        expression: {
                            name: 'N_NULL'
                        },
                        cases: [{
                            name: 'N_CASE',
                            expression: {
                                name: 'N_INTEGER',
                                number: '1'
                            },
                            body: [{
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
                            }, {
                                name: 'N_BREAK_STATEMENT',
                                levels: {
                                    name: 'N_INTEGER',
                                    number: '1'
                                }
                            }]
                        }]
                    }]
                }
            },
            'switch with one case with one statement and break, and one empty default case': {
                code: 'switch (null) {case 1: $a = 7; break; default:}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_SWITCH_STATEMENT',
                        expression: {
                            name: 'N_NULL'
                        },
                        cases: [{
                            name: 'N_CASE',
                            expression: {
                                name: 'N_INTEGER',
                                number: '1'
                            },
                            body: [{
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
                            }, {
                                name: 'N_BREAK_STATEMENT',
                                levels: {
                                    name: 'N_INTEGER',
                                    number: '1'
                                }
                            }]
                        }, {
                            name: 'N_DEFAULT_CASE',
                            body: []
                        }]
                    }]
                }
            },
            'switch with one case with one statement and break, and one default case with one statement': {
                code: 'switch (null) {case 1: $a = 7; break; default: $a = 2;}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_SWITCH_STATEMENT',
                        expression: {
                            name: 'N_NULL'
                        },
                        cases: [{
                            name: 'N_CASE',
                            expression: {
                                name: 'N_INTEGER',
                                number: '1'
                            },
                            body: [{
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
                            }, {
                                name: 'N_BREAK_STATEMENT',
                                levels: {
                                    name: 'N_INTEGER',
                                    number: '1'
                                }
                            }]
                        }, {
                            name: 'N_DEFAULT_CASE',
                            body: [{
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
                                            number: '2'
                                        }
                                    }]
                                }
                            }]
                        }]
                    }]
                }
            },
            'switch with one matched case with assignment then continue': {
                code: 'switch (1) {case 1: $a = 1; continue;}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_SWITCH_STATEMENT',
                        expression: {
                            name: 'N_INTEGER',
                            number: '1'
                        },
                        cases: [{
                            name: 'N_CASE',
                            expression: {
                                name: 'N_INTEGER',
                                number: '1'
                            },
                            body: [{
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
                                            number: '1'
                                        }
                                    }]
                                }
                            }, {
                                name: 'N_CONTINUE_STATEMENT',
                                levels: {
                                    name: 'N_INTEGER',
                                    number: '1'
                                }
                            }]
                        }]
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
