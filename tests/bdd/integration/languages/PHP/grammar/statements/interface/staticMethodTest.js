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

    describe('PHP Parser grammar interface definition statement static method integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'static method with body in interface - semantically invalid but still parseable': {
                code: util.heredoc(function (/*<<<EOS
<?php
    interface Thing {
        public static function doNothing() {}
    }
EOS
*/) {}),
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_INTERFACE_STATEMENT',
                        interfaceName: 'Thing',
                        members: [{
                            name: 'N_STATIC_METHOD_DEFINITION',
                            method: 'doNothing',
                            visibility: 'public',
                            args: [],
                            body: {
                                name: 'N_COMPOUND_STATEMENT',
                                statements: []
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
