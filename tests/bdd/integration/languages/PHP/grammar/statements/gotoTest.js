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

    describe('PHP Parser grammar goto statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'forward goto immediately followed by label': {
                code: 'goto test; test:',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_GOTO_STATEMENT',
                        label: 'test',
                    }, {
                        name: 'N_LABEL_STATEMENT',
                        label: 'test'
                    }]
                }
            },
            'forward goto jumping over first echo to second': {
                code: 'goto secondEcho; echo "first"; secondEcho: echo "second";',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_GOTO_STATEMENT',
                        label: 'secondEcho',
                    }, {
                        name: 'N_ECHO_STATEMENT',
                        expression: {
                            name: 'N_STRING_LITERAL',
                            string: 'first'
                        }
                    }, {
                        name: 'N_LABEL_STATEMENT',
                        label: 'secondEcho'
                    }, {
                        name: 'N_ECHO_STATEMENT',
                        expression: {
                            name: 'N_STRING_LITERAL',
                            string: 'second'
                        }
                    }]
                }
            },
            'backward goto used as infinite loop': {
                code: 'repeat: echo 1; goto repeat;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_LABEL_STATEMENT',
                        label: 'repeat'
                    }, {
                        name: 'N_ECHO_STATEMENT',
                        expression: {
                            name: 'N_INTEGER',
                            number: '1'
                        }
                    }, {
                        name: 'N_GOTO_STATEMENT',
                        label: 'repeat',
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
