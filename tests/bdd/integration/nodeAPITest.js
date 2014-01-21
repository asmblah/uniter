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
    'module',
    'require',
    'test-environment'
], function (
    module,
    require,
    testEnvironment
) {
    'use strict';

    if (testEnvironment.node) {
        describe('Node API integration', function () {
            var nodeRequire = testEnvironment.node.require,
                uniter;

            // Perform scoped require from root path context so Modular maps to the same files
            require({
                baseUrl: testEnvironment.node.rootPath
            }, [
                'uniter'
            ], function (
                uniterSingleton
            ) {
                uniter = uniterSingleton;
            });

            it('should make the Uniter singleton instance available as module.exports', function () {
                expect(nodeRequire(testEnvironment.node.rootPath)).to.equal(uniter);
            });
        });
    }
});
