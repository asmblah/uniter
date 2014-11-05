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

    describe('PHP Parser grammar interface definition statement static method type hinting integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'method definition with one "array" type hinted arg': {
                code: util.heredoc(function (/*<<<EOS
<?php
    interface Thing {
        public static function doNothing(array $items);
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INTERFACE_STATEMENT',
                        interfaceName: 'Thing',
                        members: [{
                            name: 'N_STATIC_INTERFACE_METHOD_DEFINITION',
                            method: 'doNothing',
                            visibility: 'public',
                            args: [{
                                name: 'N_ARGUMENT',
                                type: 'array',
                                variable: {
                                    name: 'N_VARIABLE',
                                    variable: 'items'
                                }
                            }]
                        }]
                    }]
                }
            },
            'method definition with one unnamespaced class or interface type hinted arg': {
                code: util.heredoc(function (/*<<<EOS
<?php
    interface Thing {
        public static function doNothing(ItemList $items);
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INTERFACE_STATEMENT',
                        interfaceName: 'Thing',
                        members: [{
                            name: 'N_STATIC_INTERFACE_METHOD_DEFINITION',
                            method: 'doNothing',
                            visibility: 'public',
                            args: [{
                                name: 'N_ARGUMENT',
                                type: 'ItemList',
                                variable: {
                                    name: 'N_VARIABLE',
                                    variable: 'items'
                                }
                            }]
                        }]
                    }]
                }
            },
            'method definition with one namespaced class or interface type hinted arg': {
                code: util.heredoc(function (/*<<<EOS
<?php
    interface Thing {
        public static function doNothing(\Creator\Framework\Request $items);
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INTERFACE_STATEMENT',
                        interfaceName: 'Thing',
                        members: [{
                            name: 'N_STATIC_INTERFACE_METHOD_DEFINITION',
                            method: 'doNothing',
                            visibility: 'public',
                            args: [{
                                name: 'N_ARGUMENT',
                                type: '\\Creator\\Framework\\Request',
                                variable: {
                                    name: 'N_VARIABLE',
                                    variable: 'items'
                                }
                            }]
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
