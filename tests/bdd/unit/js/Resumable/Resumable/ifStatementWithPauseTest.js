/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, describe, setTimeout */
define([
    './tools',
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    describe('Resumable if (...) {...} statement with pause', function () {
        util.each({
            'when condition is truthy': {
                code: util.heredoc(function (/*<<<EOS
with (scope) {
    if (1 === 1) {
        inTruthy;
        exports.result = giveMe('yes');
    } else {
        inFalsy;
        exports.result = giveMe('no');
    }
}
EOS
*/) {}),
                expose: function (state) {
                    var getInFalsy = sinon.stub().returns(1),
                        getInTruthy = sinon.stub().returns(2),
                        scope = {
                            giveMe: function (what) {
                                var pause = state.resumable.createPause();

                                setTimeout(function () {
                                    pause.resume(what);
                                });

                                pause.now();
                            }
                        };

                    state.getInFalsy = getInFalsy;
                    state.getInTruthy = getInTruthy;

                    Object.defineProperties(scope, {
                        inFalsy: {
                            get: getInFalsy
                        },
                        inTruthy: {
                            get: getInTruthy
                        }
                    });

                    return {
                        scope: scope
                    };
                },
                expectedExports: {
                    result: 'yes'
                },
                expect: function () {
                    it('should read the inTruthy variable once', function () {
                        expect(this.getInTruthy).to.have.been.calledOnce;
                    });

                    it('should not read the inFalsy variable at all', function () {
                        expect(this.getInFalsy).not.to.have.been.called;
                    });
                }
            },
            'when condition is falsy': {
                code: util.heredoc(function (/*<<<EOS
with (scope) {
    if (1 === 2) {
        inTruthy;
        exports.result = giveMe('yes');
    } else {
        inFalsy;
        exports.result = giveMe('no');
    }
}
EOS
*/) {}),
                expose: function (state) {
                    var getInFalsy = sinon.stub().returns(1),
                        getInTruthy = sinon.stub().returns(2),
                        scope = {
                            giveMe: function (what) {
                                var pause = state.resumable.createPause();

                                setTimeout(function () {
                                    pause.resume(what);
                                });

                                pause.now();
                            }
                        };

                    state.getInFalsy = getInFalsy;
                    state.getInTruthy = getInTruthy;

                    Object.defineProperties(scope, {
                        inFalsy: {
                            get: getInFalsy
                        },
                        inTruthy: {
                            get: getInTruthy
                        }
                    });

                    return {
                        scope: scope
                    };
                },
                expectedExports: {
                    result: 'no'
                },
                expect: function () {
                    it('should read the inFalsy variable once', function () {
                        expect(this.getInFalsy).to.have.been.calledOnce;
                    });

                    it('should not read the inTruthy variable at all', function () {
                        expect(this.getInTruthy).not.to.have.been.called;
                    });
                }
            }
        }, tools.check);
    });
});
