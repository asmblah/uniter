/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, describe, expect, it, setTimeout */
define([
    'vendor/esparse/esprima',
    'js/util',
    'js/Resumable/Resumable',
    'js/Resumable/Transpiler'
], function (
    esprima,
    util,
    Resumable,
    Transpiler
) {
    'use strict';

    describe('Resumable', function () {
        var resumable;

        beforeEach(function () {
            resumable = new Resumable(new Transpiler());
        });

        util.each({
            'when no pauses are used': {
                code: util.heredoc(function (/*<<<EOS
exports.result = 21;
EOS
*/) {}),
                expectedExports: {
                    result: 21
                }
            },
            'when one pause is used with a single expression': {
                code: util.heredoc(function (/*<<<EOS
exports.result = tools.getResult();
EOS
*/) {}),
                expose: {
                    getResult: function () {
                        var pause = resumable.createPause();

                        setTimeout(function () {
                            pause.resume(22);
                        });

                        pause.now();
                    }
                },
                expectedExports: {
                    result: 22
                }
            },
            'when two pauses are used with a single expression': {
                code: util.heredoc(function (/*<<<EOS
exports.result = tools.getFirst() + 4 + tools.getSecond();
EOS
*/) {}),
                expose: {
                    getFirst: function () {
                        var pause = resumable.createPause();

                        setTimeout(function () {
                            pause.resume(2);
                        });

                        pause.now();
                    },
                    getSecond: function () {
                        var pause = resumable.createPause();

                        setTimeout(function () {
                            pause.resume(3);
                        });

                        pause.now();
                    }
                },
                expectedExports: {
                    result: 9
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                var exports,
                    options;

                beforeEach(function (done) {
                    exports = {};

                    options = {
                        expose: {
                            exports: exports,
                            tools: scenario.expose
                        }
                    };

                    resumable.execute(scenario.code, options).done(function () {
                        done();
                    }).fail(function (e) {
                        done(e);
                    });
                });

                it('should resolve the promise with the correct result', function () {
                    expect(exports).to.deep.equal(scenario.expectedExports);
                });
            });
        });
    });
});
