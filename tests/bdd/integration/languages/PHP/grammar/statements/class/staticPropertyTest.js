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

    describe('PHP Parser grammar class statement static property integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'class with a single public static suffixed property with no value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OneProperty {
        public static $name;
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: {
                            name: 'N_STRING',
                            string: 'OneProperty'
                        },
                        members: [{
                            name: 'N_STATIC_PROPERTY_DEFINITION',
                            visibility: 'public',
                            variable: {
                                name: 'N_VARIABLE',
                                variable: 'name'
                            }
                        }]
                    }]
                }
            },
            'class with a single public static suffixed property with a string value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OneProperty {
        public static $job = 'Engineer';
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: {
                            name: 'N_STRING',
                            string: 'OneProperty'
                        },
                        members: [{
                            name: 'N_STATIC_PROPERTY_DEFINITION',
                            visibility: 'public',
                            variable: {
                                name: 'N_VARIABLE',
                                variable: 'job'
                            },
                            value: {
                                name: 'N_STRING_LITERAL',
                                string: 'Engineer'
                            }
                        }]
                    }]
                }
            },
            'class with a single public static prefixed property with no value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OneProperty {
        static public $name;
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: {
                            name: 'N_STRING',
                            string: 'OneProperty'
                        },
                        members: [{
                            name: 'N_STATIC_PROPERTY_DEFINITION',
                            visibility: 'public',
                            variable: {
                                name: 'N_VARIABLE',
                                variable: 'name'
                            }
                        }]
                    }]
                }
            },
            'class with a single public static prefixed property with a string value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OneProperty {
        static public $job = 'Engineer';
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: {
                            name: 'N_STRING',
                            string: 'OneProperty'
                        },
                        members: [{
                            name: 'N_STATIC_PROPERTY_DEFINITION',
                            visibility: 'public',
                            variable: {
                                name: 'N_VARIABLE',
                                variable: 'job'
                            },
                            value: {
                                name: 'N_STRING_LITERAL',
                                string: 'Engineer'
                            }
                        }]
                    }]
                }
            },
            'class with a single implicitly public static prefixed property with no value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OneProperty {
        static $name;
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: {
                            name: 'N_STRING',
                            string: 'OneProperty'
                        },
                        members: [{
                            name: 'N_STATIC_PROPERTY_DEFINITION',
                            variable: {
                                name: 'N_VARIABLE',
                                variable: 'name'
                            }
                        }]
                    }]
                }
            },
            'class with a single implicitly public static prefixed property with a string value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OneProperty {
        static $job = 'Engineer';
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: {
                            name: 'N_STRING',
                            string: 'OneProperty'
                        },
                        members: [{
                            name: 'N_STATIC_PROPERTY_DEFINITION',
                            variable: {
                                name: 'N_VARIABLE',
                                variable: 'job'
                            },
                            value: {
                                name: 'N_STRING_LITERAL',
                                string: 'Engineer'
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
