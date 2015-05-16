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

    describe('PHP Parser grammar "self" keyword construct integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            '"self" should be safe to use as a function name': {
                code: '<?php function self() {} self();',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FUNCTION_STATEMENT',
                        func: 'self',
                        args: [],
                        body: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: []
                        }
                    }, {
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_FUNCTION_CALL',
                            func: {
                                name: 'N_STRING',
                                string: 'self'
                            },
                            args: []
                        }
                    }]
                }
            },
            '"self" used to dereference a static class property with no whitespace before the "::" operator': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    echo self::$something;
EOS
*/;}), // jshint ignore:line
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ECHO_STATEMENT',
                        expression: {
                            name: 'N_STATIC_PROPERTY',
                            className: {
                                name: 'N_SELF'
                            },
                            property: {
                                name: 'N_STRING',
                                string: 'something'
                            }
                        }
                    }]
                }
            },
            '"self" used to dereference a static class property with whitespace before the "::" operator': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    echo self ::$something;
EOS
*/;}), // jshint ignore:line
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ECHO_STATEMENT',
                        expression: {
                            name: 'N_STATIC_PROPERTY',
                            className: {
                                name: 'N_SELF'
                            },
                            property: {
                                name: 'N_STRING',
                                string: 'something'
                            }
                        }
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
