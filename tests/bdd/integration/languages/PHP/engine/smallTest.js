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
    '../tools',
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    describe('PHP Engine small program integration', function () {
        var engine;

        beforeEach(function () {
            engine = tools.createEngine();
        });

        util.each([
            {
                code: '',
                expectedResult: undefined
            },
            {
                code: '<?php',
                expectedResult: undefined
            },
            {
                code: '<?php ?>',
                expectedResult: undefined
            },
            {
                code: '<?php $xyz = 21;',
                // No result is returned, even though $xyz is set to 21
                expectedResult: undefined
            },
            {
                code: '<?php return 37;',
                expectedResult: 37
            },
            {
                code: '<?php $answer = 6; return $answer;',
                expectedResult: 6
            },
            {
                code: '<?php $product = 2 * 4; return $product;',
                expectedResult: 8
            },
            {
                // Checks precedence handling of explicit parentheses, as "8 - (2 * 3)" will be 2 whereas "(8 - 2) * 3" will be 18
                code: '<?php $product = (8 - 2) * 3; return $product;',
                expectedResult: 18
            }
        ], function (scenario) {
            it('should return the expected result when the code is "' + scenario.code + '"', function (done) {
                engine.execute(scenario.code).done(function (result) {
                    expect(result).to.equal(scenario.expectedResult);
                    done();
                }).fail(done);
            });
        });
    });
});
