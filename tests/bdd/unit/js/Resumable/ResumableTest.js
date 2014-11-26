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
        var resumable,
            state;

        beforeEach(function () {
            resumable = new Resumable(new Transpiler());
            state = {};
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
            },
            'when pause occurs inside function call': {
                code: util.heredoc(function (/*<<<EOS
function getIt() {
    return tools.getValue() + 2;
}

exports.result = getIt() + 10;
EOS
*/) {}),
                expose: {
                    getValue: function () {
                        var pause = resumable.createPause();

                        setTimeout(function () {
                            pause.resume(21);
                        });

                        pause.now();
                    }
                },
                expectedExports: {
                    result: 33
                }
            },
            'when pause occurs inside function defined via declaration with closure-bound variables': {
                code: util.heredoc(function (/*<<<EOS
function getIt() {
    var myResult;

    function doGet() {
        myResult = tools.getValue() + 2;
    }

    doGet();

    return myResult;
}

exports.result = getIt() + 10;
EOS
*/) {}),
                expose: {
                    getValue: function () {
                        var pause = resumable.createPause();

                        setTimeout(function () {
                            pause.resume(21);
                        });

                        pause.now();
                    }
                },
                expectedExports: {
                    result: 33
                }
            },
            'when pause occurs inside function defined via expression with closure-bound variables': {
                code: util.heredoc(function (/*<<<EOS
function getIt() {
    var myResult,
        doGet = function () {
            myResult = tools.getValue() + 2;
        };

    doGet();

    return myResult;
}

exports.result = getIt() + 10;
EOS
*/) {}),
                expose: {
                    getValue: function () {
                        var pause = resumable.createPause();

                        setTimeout(function () {
                            pause.resume(21);
                        });

                        pause.now();
                    }
                },
                expectedExports: {
                    result: 33
                }
            },
            'when pause occurs inside if (...) {...} statement with condition that becomes falsy before resume': {
                code: util.heredoc(function (/*<<<EOS
var allow = true;

function getIt() {
    if (allow) {
        allow = false;

        var result = tools.getValue();

        return result + 2;
    }
}

exports.result = getIt();
EOS
*/) {}),
                expose: {
                    getValue: function () {
                        var pause = resumable.createPause();

                        setTimeout(function () {
                            pause.resume(20);
                        });

                        pause.now();
                    }
                },
                expectedExports: {
                    result: 22
                }
            },
            'multiple variable declarators in one declaration, with inits that yield': {
                code: util.heredoc(function (/*<<<EOS
var first = tools.addOneTo(4),
    second = tools.addOneTo(5);

exports.result = first + ',' + second;
EOS
*/) {}),
                expose: {
                    addOneTo: function (to) {
                        var pause = resumable.createPause();

                        setTimeout(function () {
                            pause.resume(to + 1);
                        });

                        pause.now();
                    }
                },
                expectedExports: {
                    result: '5,6'
                }
            },
            'while loop with condition that becomes falsy before resume': {
                code: util.heredoc(function (/*<<<EOS
var go = true,
    result = 0;

while (go) {
    go = false;
    result += tools.addOneTo(1);
    go = true;

    if (result === 6) {
        break;
    }
}

exports.result = result;
EOS
*/) {}),
                expose: {
                    addOneTo: function (to) {
                        var pause = resumable.createPause();

                        setTimeout(function () {
                            pause.resume(to + 1);
                        });

                        pause.now();
                    }
                },
                expectedExports: {
                    result: 6
                }
            },
            'logical OR (||) operator with short-circuit evaluation, where left operand evaluates to truthy': {
                code: util.heredoc(function (/*<<<EOS
var result = tools.truthy() || otherTools.falsy();

exports.result = result;
EOS
*/) {}),
                expose: function (state) {
                    var falsy = sinon.stub().returns(false),
                        truthy = sinon.stub().returns(true),
                        getOtherTools = sinon.stub(),
                        expose = {
                            tools: {
                                truthy: truthy
                            }
                        };

                    getOtherTools.returns({
                        falsy: falsy
                    });

                    Object.defineProperty(expose, 'otherTools', {
                        get: getOtherTools
                    });

                    state.getOtherTools = getOtherTools;
                    state.falsy = falsy;
                    state.truthy = truthy;

                    return expose;
                },
                expectedExports: {
                    result: true
                },
                expect: function () {
                    it('should only call the .truthy() method, not the .falsy() method', function () {
                        expect(state.truthy).to.have.been.calledOnce;
                        expect(state.falsy).not.to.have.been.called;
                    });

                    it('should not attempt to read the object variable for the right operand', function () {
                        expect(state.getOtherTools).not.to.have.been.called;
                    });
                }
            },
            'logical OR (||) operator with short-circuit evaluation, where left operand evaluates to falsy but right operand truthy': {
                code: util.heredoc(function (/*<<<EOS
var result = tools.falsy() || tools.truthy();

exports.result = result;
EOS
*/) {}),
                expose: function (state) {
                    var falsy = sinon.stub().returns(false),
                        truthy = sinon.stub().returns(true);

                    state.falsy = falsy;
                    state.truthy = truthy;

                    return {
                        tools: {
                            falsy: falsy,
                            truthy: truthy
                        }
                    };
                },
                expectedExports: {
                    result: true
                },
                expect: function () {
                    it('should call both the .falsy() and .truthy() methods', function () {
                        expect(state.falsy).to.have.been.calledOnce;
                        expect(state.truthy).to.have.been.calledOnce;
                    });
                }
            },
            'logical OR (||) operator with short-circuit evaluation, where left and right operands both evaluate to falsy': {
                code: util.heredoc(function (/*<<<EOS
var result = tools.falsy() || tools.alsoFalsy();

exports.result = result;
EOS
*/) {}),
                expose: function (state) {
                    var falsy = sinon.stub().returns(false),
                        alsoFalsy = sinon.stub().returns(false);

                    state.falsy = falsy;
                    state.alsoFalsy = alsoFalsy;

                    return {
                        tools: {
                            falsy: falsy,
                            alsoFalsy: alsoFalsy
                        }
                    };
                },
                expectedExports: {
                    result: false
                },
                expect: function () {
                    it('should call both the .falsy() and .alsoFalsy() methods', function () {
                        expect(state.falsy).to.have.been.calledOnce;
                        expect(state.alsoFalsy).to.have.been.calledOnce;
                    });
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                var exports;

                beforeEach(function (done) {
                    var expose;

                    exports = {};
                    expose = {
                        exports: exports
                    };

                    if (util.isFunction(scenario.expose)) {
                        util.extend(expose, scenario.expose(state));
                    } else {
                        util.extend(expose, {
                            tools: scenario.expose
                        });
                    }

                    resumable.execute(scenario.code, {expose: expose}).done(function () {
                        done();
                    }).fail(function (e) {
                        done(e);
                    });
                });

                it('should resolve the promise with the correct result', function () {
                    expect(exports).to.deep.equal(scenario.expectedExports);
                });

                if (scenario.expect) {
                    scenario.expect();
                }
            });
        });
    });
});
