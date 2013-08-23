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
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$b',
                        expression: '2'
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
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$a',
                        expression: '7'
                    }]
                }
            },
            {
                code: '<?php return 0;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: '0'
                    }]
                }
            },
            {
                code: '<?php $result = 6; return $result;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$result',
                        expression: '6'
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: '$result'
                    }]
                }
            },
            {
                code: '<?php $y = 3 * 4; return $y;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ASSIGNMENT_STATEMENT',
                        target: '$y',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: '3',
                            right: [{
                                operator: '*',
                                operand: '4'
                            }]
                        }
                    }, {
                        name: 'N_RETURN_STATEMENT',
                        expression: '$y'
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
