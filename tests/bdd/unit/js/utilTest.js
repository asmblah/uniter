/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, describe, expect, it */
define([
    'modular',
    'require',
    'js/util'
], function (
    modular,
    require,
    util
) {
    'use strict';

    describe('Util', function () {
        it('should inherit from modular.util', function () {
            expect(Object.getPrototypeOf(util)).to.equal(modular.util);
        });

        describe('heredoc()', function () {
            util.each([
                {
                    heredoc: util.heredoc(function (/*<<<EOS
Line 1
Line 2
EOS
*/) {}),
                    expectedString: 'Line 1\nLine 2'
                },
                {
                    heredoc: util.heredoc(function (/*<<<EOS
${person} walked up the stairs in ${person}'s flat.
EOS
*/) {}, {person: 'Fred'}),
                    expectedString: 'Fred walked up the stairs in Fred\'s flat.'
                },
                {
                    heredoc: util.heredoc(function (/*<<<EOS
The ladder is ${length}cm long.
EOS
*/) {}, {length: 12}),
                    expectedString: 'The ladder is 12cm long.'
                }
            ], function (scenario, index) {
                it('should return the correct string for heredoc #' + (index + 1), function () {
                    expect(scenario.heredoc).to.equal(scenario.expectedString);
                });
            });
        });

        describe('inherit()', function () {
            it('should set the .prototype of the To class to be an object that uses the From class\' .prototype as its prototype', function () {
                function From() {}
                function To() {}

                util.inherit(To).from(From);

                expect(Object.getPrototypeOf(To.prototype)).to.equal(From.prototype);
            });
        });
    });
});
