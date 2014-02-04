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

    describe('PHP Parser grammar class statement "extends" integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'empty class followed by derived class in current namespace': {
                code: '<?php class Animal {} class Human extends Animal {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: {
                            name: 'N_STRING',
                            string: 'Animal'
                        },
                        members: []
                    }, {
                        name: 'N_CLASS_STATEMENT',
                        className: {
                            name: 'N_STRING',
                            string: 'Human'
                        },
                        extend: {
                            name: 'N_CLASS_REFERENCE',
                            path: 'Animal'
                        },
                        members: []
                    }]
                }
            },
            'empty derived class extending class in another namespace': {
                code: '<?php class Drill extends \\Vendor\\Toolbox\\Tool {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_CLASS_STATEMENT',
                        className: {
                            name: 'N_STRING',
                            string: 'Drill'
                        },
                        extend: {
                            name: 'N_CLASS_REFERENCE',
                            path: '\\Vendor\\Toolbox\\Tool'
                        },
                        members: []
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
