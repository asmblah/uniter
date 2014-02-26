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

    describe('PHP Parser grammar class statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'empty class that does not extend or implement': {
                code: '<?php class Test {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'Test',
                        members: []
                    }]
                }
            },
            'class with one public instance property with no value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OnePub {
        public $aPublicProp;
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'OnePub',
                        members: [{
                            name: 'N_INSTANCE_PROPERTY_DEFINITION',
                            visibility: 'public',
                            variable: {
                                name: 'N_VARIABLE',
                                variable: 'aPublicProp'
                            }
                        }]
                    }]
                }
            },
            'class with one public instance property with string value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OnePub {
        public $aPublicProp = 'yep';
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'OnePub',
                        members: [{
                            name: 'N_INSTANCE_PROPERTY_DEFINITION',
                            visibility: 'public',
                            variable: {
                                name: 'N_VARIABLE',
                                variable: 'aPublicProp'
                            },
                            value: {
                                name: 'N_STRING_LITERAL',
                                string: 'yep'
                            }
                        }]
                    }]
                }
            },
            'class with one public instance method': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OneMethod {
        public function printIt($what) {
            echo $what;
        }
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'OneMethod',
                        members: [{
                            name: 'N_METHOD_DEFINITION',
                            visibility: 'public',
                            func: 'printIt',
                            args: [{
                                name: 'N_VARIABLE',
                                variable: 'what'
                            }],
                            body: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: [{
                                    name: 'N_ECHO_STATEMENT',
                                    expression: {
                                        name: 'N_VARIABLE',
                                        variable: 'what'
                                    }
                                }]
                            }
                        }]
                    }]
                }
            },
            'class with one public instance method with one body statement not wrapped in braces': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class OneMethod {
        public function printIt($what) echo $what;
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'OneMethod',
                        members: [{
                            name: 'N_METHOD_DEFINITION',
                            visibility: 'public',
                            func: 'printIt',
                            args: [{
                                name: 'N_VARIABLE',
                                variable: 'what'
                            }],
                            body: {
                                name: 'N_ECHO_STATEMENT',
                                expression: {
                                    name: 'N_VARIABLE',
                                    variable: 'what'
                                }
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
