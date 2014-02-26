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

    describe('PHP Parser grammar class statement static method definition integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'simple empty static method definition with no args or statements': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Thing {
        public static function doNothing() {

        }
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'Thing',
                        members: [{
                            name: 'N_STATIC_METHOD_DEFINITION',
                            method: 'doNothing',
                            visibility: 'public',
                            args: [],
                            body: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: []
                            }
                        }]
                    }]
                }
            },
            'simple empty static method definition with one arg but no statements': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Thing {
        public static function doNothing($a) {

        }
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'Thing',
                        members: [{
                            name: 'N_STATIC_METHOD_DEFINITION',
                            method: 'doNothing',
                            visibility: 'public',
                            args: [{
                                name: 'N_VARIABLE',
                                variable: 'a'
                            }],
                            body: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: []
                            }
                        }]
                    }]
                }
            },
            'static method definition with one arg and one body statement not wrapped in braces': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Thing {
        public static function printIt($string) echo $string;
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'Thing',
                        members: [{
                            name: 'N_STATIC_METHOD_DEFINITION',
                            method: 'printIt',
                            visibility: 'public',
                            args: [{
                                name: 'N_VARIABLE',
                                variable: 'string'
                            }],
                            body: {
                                name: 'N_ECHO_STATEMENT',
                                expression: {
                                    name: 'N_VARIABLE',
                                    variable: 'string'
                                }
                            }
                        }]
                    }]
                }
            },
            'static method definition with two args and two statements': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Thing {
        public static function add($number1, $number2) {
            $result = $number1 + $number2;
            return $result;
        }
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'Thing',
                        members: [{
                            name: 'N_STATIC_METHOD_DEFINITION',
                            method: 'add',
                            visibility: 'public',
                            args: [{
                                name: 'N_VARIABLE',
                                variable: 'number1'
                            }, {
                                name: 'N_VARIABLE',
                                variable: 'number2'
                            }],
                            body: {
                                name: 'N_COMPOUND_STATEMENT',
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
                                                name: 'N_EXPRESSION',
                                                left: {
                                                    name: 'N_VARIABLE',
                                                    variable: 'number1'
                                                },
                                                right: [{
                                                    operator: '+',
                                                    operand: {
                                                        name: 'N_VARIABLE',
                                                        variable: 'number2'
                                                    }
                                                }]
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
                        }]
                    }]
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                // Pretty-print the code strings so any non-printable characters are readable
                describe('when the code is ' + JSON.stringify(scenario.code) + ' ?>', function () {
                    it('should return the expected AST', function () {
                        expect(parser.parse(scenario.code)).to.deep.equal(scenario.expectedAST);
                    });
                });
            });
        });
    });
});
