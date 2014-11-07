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

    describe('PHP Parser grammar class definition statement interface "implements" integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'class implementing a single interface': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Planet implements Rotatable {
        const SHAPE = 'sphere';
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'Planet',
                        implement: ['Rotatable'],
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
            'class implementing two interfaces': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Planet implements Rotatable, Orbitable {
        const SHAPE = 'sphere';
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: 'Planet',
                        implement: ['Rotatable', 'Orbitable'],
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
