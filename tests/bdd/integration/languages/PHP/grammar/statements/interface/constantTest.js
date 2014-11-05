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

    describe('PHP Parser grammar interface definition statement constant integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'interface constant with default string value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    interface Planet {
        const SHAPE = 'sphere';
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INTERFACE_STATEMENT',
                        interfaceName: 'Planet',
                        members: [{
                            name: 'N_CONSTANT_DEFINITION',
                            constant: 'SHAPE',
                            value: {
                                name: 'N_STRING_LITERAL',
                                string: 'sphere'
                            }
                        }]
                    }]
                }
            },
            'interface constant referencing another': {
                code: util.heredoc(function (/*<<<EOS
<?php
    interface Thing {
        const FIRST = self::SECOND;
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INTERFACE_STATEMENT',
                        interfaceName: 'Thing',
                        members: [{
                            name: 'N_CONSTANT_DEFINITION',
                            constant: 'FIRST',
                            value: {
                                name: 'N_CLASS_CONSTANT',
                                className: {
                                    name: 'N_SELF'
                                },
                                constant: 'SECOND'
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
