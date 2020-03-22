/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global after */
'use strict';

var _ = require('microdash'),
    expect = require('chai').expect,
    hasOwn = {}.hasOwnProperty;

module.exports = {
    check: function (getData, scenario) {
        describe('when the code is ' + JSON.stringify(scenario.code), function () {
            var engine,
                scenarioException,
                scenarioResult,
                scenarioResultType;

            beforeEach(function (done) {
                var expose;

                // Only execute code once per scenario,
                // sharing results between assertions
                if (engine) {
                    done();
                    return;
                }

                expose = _.isFunction(scenario.expose) ?
                    scenario.expose.call(this) :
                    scenario.expose;

                engine = getData().engine;

                _.forOwn(expose, function (object, name) {
                    engine.expose(object, name);
                });

                if (scenario.options) {
                    engine.configure(scenario.options);
                }

                scenarioException = scenarioResult = scenarioResultType = null;

                engine.execute(scenario.code, '/path/to/my_module.php').done(function (result, type) {
                    scenarioResult = result;
                    scenarioResultType = type;
                    done();
                }).fail(function (exception) {
                    scenarioException = exception;
                    done();
                });
            });

            // Ensure we execute the next scenario
            after(function () {
                engine = null;
            });

            if (scenario.expectedException) {
                it('should throw the expected Exception', function () {
                    if (!scenarioException) {
                        throw new Error('Expected an Exception to be thrown');
                    }

                    if (hasOwn.call(scenario.expectedException, 'instanceOf')) {
                        expect(scenarioException).to.be.an.instanceOf(scenario.expectedException.instanceOf);
                    }
                    if (hasOwn.call(scenario.expectedException, 'match')) {
                        expect(scenarioException.message).to.match(scenario.expectedException.match);
                    }
                });
            } else {
                it('should not have thrown an exception', function () {
                    if (scenarioException) {
                        throw new Error(
                            'Expected no Exception to be thrown, but one was: ' +
                            scenarioException
                        );
                    }
                });

                if (
                    hasOwn.call(scenario, 'expectedResult') ||
                    scenario.expectedResultCallback
                ) {
                    it('should return the expected result', function () {
                        if (hasOwn.call(scenario, 'expectedResult')) {
                            if (scenario.expectedResultDeep) {
                                expect(scenarioResult).to.deep.equal(scenario.expectedResult);
                            } else {
                                expect(scenarioResult).to.equal(scenario.expectedResult);
                            }
                        } else {
                            scenario.expectedResultCallback.call(this, scenarioResult);
                        }
                    });
                }

                if (scenario.expectedResultType) {
                    it('should return a value of type "' + scenario.expectedResultType + '"', function () {
                        expect(scenarioResultType).to.equal(scenario.expectedResultType);
                    });
                }
            }

            it('should output the expected data to stderr', function () {
                expect(engine.getStderr().readAll()).to.equal(scenario.expectedStderr);
            });

            it('should output the expected data to stdout', function () {
                expect(engine.getStdout().readAll()).to.equal(scenario.expectedStdout);
            });
        });
    }
};
