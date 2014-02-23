/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, require */
define([
    'test-environment'
], function (
    testEnvironment
) {
    'use strict';

    if (testEnvironment.node) {
        describe('Node API integration', function () {
            var nodeRequire = testEnvironment.node.require,
                uniter;

            beforeEach(function (done) {
                require([
                    'uniter'
                ], function (
                    uniterSingleton
                ) {
                    uniter = uniterSingleton;
                    done();
                });
            });

            it('should make the Uniter singleton instance available as module.exports', function () {
                expect(nodeRequire(testEnvironment.node.rootPath)).to.equal(uniter);
            });
        });
    }
});
