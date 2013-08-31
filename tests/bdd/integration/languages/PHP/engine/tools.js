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
            describe('when the code is "' + scenario.code + '"', function () {
                var engine;

                beforeEach(function () {
                    engine = getData().engine;
                });

                it('should return the expected result', function (done) {
                    engine.execute(scenario.code).done(function (result) {
                        if (hasOwn.call(scenario, 'expectedResult')) {
                            expect(result).to.equal(scenario.expectedResult);
                        } else {
                            scenario.expectedResultCallback(result);
                        }
                        done();
                    }).fail(done);
                });

                it('should output the expected data to stderr', function (done) {
                    engine.execute(scenario.code).done(function () {
                        expect(engine.getStderr().readAll()).to.equal(scenario.expectedStderr);
                        done();
                    }).fail(done);
                });

                it('should output the expected data to stdout', function (done) {
                    engine.execute(scenario.code).done(function () {
                        expect(engine.getStdout().readAll()).to.equal(scenario.expectedStdout);
                        done();
                    }).fail(done);
                });
            });
        }
    };
});
