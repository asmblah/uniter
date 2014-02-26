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

    describe('PHP Parser grammar class definition statement instance method default argument value integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'empty method definition with argument with no type hint but a default value of null': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Thing {
        public function doNothing($items = null) {}
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'Thing',
                        members: [{
                            name: 'N_METHOD_DEFINITION',
                            func: 'doNothing',
                            visibility: 'public',
                            args: [{
                                name: 'N_ARGUMENT',
                                variable: {
                                    name: 'N_VARIABLE',
                                    variable: 'items'
                                },
                                value: {
                                    name: 'N_NULL'
                                }
                            }],
                            body: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: []
                            }
                        }]
                    }]
                }
            },
            'empty method definition with "array" type hinted argument with a default value of 7': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Thing {
        public function doNothing(array $items = 7) {}
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'Thing',
                        members: [{
                            name: 'N_METHOD_DEFINITION',
                            func: 'doNothing',
                            visibility: 'public',
                            args: [{
                                name: 'N_ARGUMENT',
                                type: 'array',
                                variable: {
                                    name: 'N_VARIABLE',
                                    variable: 'items'
                                },
                                value: {
                                    name: 'N_INTEGER',
                                    number: '7'
                                }
                            }],
                            body: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: []
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
