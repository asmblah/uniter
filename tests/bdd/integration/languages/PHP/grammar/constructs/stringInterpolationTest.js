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

    describe('PHP Parser grammar string interpolation construct integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'string containing only an interpolated variable': {
                code: '<?php return "$myValue";',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_STRING_EXPRESSION',
                            parts: [{
                                name: 'N_VARIABLE',
                                variable: '$myValue'
                            }]
                        }
                    }]
                }
            },
            'string containing some text followed by an interpolated variable': {
                code: '<?php return "abc$myValue";',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_STRING_EXPRESSION',
                            parts: [{
                                name: 'N_STRING_LITERAL',
                                string: 'abc'
                            }, {
                                name: 'N_VARIABLE',
                                variable: '$myValue'
                            }]
                        }
                    }]
                }
            },
            'string containing two interpolated variables touching': {
                code: '<?php return "$value1$value2";',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_RETURN_STATEMENT',
                        expression: {
                            name: 'N_STRING_EXPRESSION',
                            parts: [{
                                name: 'N_VARIABLE',
                                variable: '$value1'
                            }, {
                                name: 'N_VARIABLE',
                                variable: '$value2'
                            }]
                        }
                    }]
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                describe('when the code is ' + JSON.stringify(scenario.code) + ' ?>', function () {
                    it('should return the expected AST', function () {
                        expect(parser.parse(scenario.code)).to.deep.equal(scenario.expectedAST);
                    });
                });
            });
        });
    });
});
