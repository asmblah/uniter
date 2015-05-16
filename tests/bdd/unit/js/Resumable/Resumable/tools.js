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
    'js/util',
    'js/Resumable/Resumable',
    'js/Resumable/Transpiler'
], function (
    util,
    Resumable,
    Transpiler
) {
    'use strict';

    return {
        check: function (scenario, description) {
            describe(description, function () {
                var exports;

                beforeEach(function (done) {
                    var expose;

                    this.resolved = false;
                    this.resumable = new Resumable(new Transpiler());

                    exports = {};
                    expose = {
                        exports: exports
                    };

                    if (util.isFunction(scenario.expose)) {
                        util.extend(expose, scenario.expose(this));
                    } else {
                        util.extend(expose, {
                            tools: scenario.expose
                        });
                    }

                    this.resumable.execute(scenario.code, {expose: expose}).done(function () {
                        this.resolved = true;
                        done();
                    }.bind(this)).fail(function (e) {
                        this.resolved = false;
                        this.error = e;
                        done();
                    }.bind(this));
                });

                if (scenario.expectedExports) {
                    it('should resolve the promise with the correct result', function () {
                        expect(exports).to.deep.equal(scenario.expectedExports);
                    });
                } else {
                    it('should reject the promise with the correct error', function () {
                        expect(this.error.toString()).to.equal(scenario.expectedError.toString());
                    });
                }

                if (scenario.expect) {
                    scenario.expect();
                }
            });
        }
    };
});
