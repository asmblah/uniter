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
                        className: {
                            name: 'N_STRING',
                            string: 'Test'
                        },
                        members: []
                    }]
                }
            },
            'class with one public property': {
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
                        className: {
                            name: 'N_STRING',
                            string: 'OnePub'
                        },
                        members: [{
                            name: 'N_PROPERTY_DEFINITION',
                            visibility: 'public',
                            type: '',
                            variable: {
                                name: 'N_VARIABLE',
                                variable: '$aPublicProp'
                            },
                            value: {
                                name: 'N_STRING_LITERAL',
                                string: 'yep'
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
