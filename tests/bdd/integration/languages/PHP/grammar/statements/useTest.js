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

    describe('PHP Parser grammar use statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'use outside of namespace for simple import': {
                code: 'use Toolkit;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_USE_STATEMENT',
                        uses: [{
                            source: 'Toolkit'
                        }]
                    }]
                }
            },
            'use outside of namespace for simple aliasing': {
                code: 'use Uniter as Library;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_USE_STATEMENT',
                        uses: [{
                            source: 'Uniter',
                            alias: 'Library'
                        }]
                    }]
                }
            },
            'use outside of namespace for aliasing deeply nested namespace': {
                code: 'use Framework\\Network\\Http\\Request as MyFrameworkRequest;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_USE_STATEMENT',
                        uses: [{
                            source: 'Framework\\Network\\Http\\Request',
                            alias: 'MyFrameworkRequest'
                        }]
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
