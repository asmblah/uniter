/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define(function () {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    return {
        check: function (getData, scenario) {
            describe('when the code is ' + JSON.stringify(scenario.code), function () {
                var engine;

                beforeEach(function () {
                    engine = getData().engine;
                });

                if (scenario.expectedException) {
                    it('should throw the expected Exception', function (done) {
                        engine.execute(scenario.code).fail(function (exception) {
                            if (hasOwn.call(scenario.expectedException, 'instanceOf')) {
                                expect(exception).to.be.an.instanceOf(scenario.expectedException.instanceOf);
                            }
                            if (hasOwn.call(scenario.expectedException, 'match')) {
                                expect(exception.message).to.match(scenario.expectedException.match);
                            }
                            done();
                        }).done(function () {
                            done(new Error('Expected an Exception to be thrown'));
                        });
                    });
                } else if (hasOwn.call(scenario, 'expectedResult')) {
                    it('should return the expected result', function (done) {
                        engine.execute(scenario.code).done(function (result) {
                            if (hasOwn.call(scenario, 'expectedResult')) {
                                expect(result).to.equal(scenario.expectedResult);
                            } else {
                                scenario.expectedResultCallback(result);
                            }
                            done();
                        }).fail(function (exception) {
                            done(new Error('Expected no Exception to be thrown, but one was: ' + exception));
                        });
                    });

                    if (scenario.expectedResultType) {
                        it('should return a value of type "' + scenario.expectedResultType + '"', function (done) {
                            engine.execute(scenario.code).done(function (result, type) {
                                expect(type).to.equal(scenario.expectedResultType);
                                done();
                            }).fail(function (exception) {
                                done(new Error('Expected no Exception to be thrown, but one was: ' + exception));
                            });
                        });
                    }
                }

                it('should output the expected data to stderr', function (done) {
                    engine.execute(scenario.code).always(function () {
                        expect(engine.getStderr().readAll()).to.equal(scenario.expectedStderr);
                        done();
                    });
                });

                it('should output the expected data to stdout', function (done) {
                    engine.execute(scenario.code).always(function () {
                        expect(engine.getStdout().readAll()).to.equal(scenario.expectedStdout);
                        done();
                    });
                });
            });
        }
    };
});
