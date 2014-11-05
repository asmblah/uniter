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

    describe('PHP Parser grammar interface statement "extends" integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'empty interface followed by derived interface in current namespace': {
                code: '<?php interface Animal {} interface Human extends Animal {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INTERFACE_STATEMENT',
                        interfaceName: 'Animal',
                        members: []
                    }, {
                        name: 'N_INTERFACE_STATEMENT',
                        interfaceName: 'Human',
                        extend: 'Animal',
                        members: []
                    }]
                }
            },
            'empty derived interface extending interface in another namespace': {
                code: '<?php interface Drill extends \\Vendor\\Toolbox\\Tool {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INTERFACE_STATEMENT',
                        interfaceName: 'Drill',
                        extend: '\\Vendor\\Toolbox\\Tool',
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
