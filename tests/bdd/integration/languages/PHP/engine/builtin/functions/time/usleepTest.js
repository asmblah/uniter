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
    '../../../../tools',
    'js/util'
], function (
    phpTools,
    util
) {
    'use strict';

    var realSetTimeout = setTimeout;

    describe('PHP Engine usleep() builtin function integration', function () {
        var clock,
            engine;

        beforeEach(function () {
            clock = sinon.useFakeTimers();
            engine = phpTools.createEngine();
        });

        afterEach(function () {
            clock.restore();
        });

        util.each({
            'when the delay is 1000000us, after 999ms': {
                delay: 1000000,
                tick: 999,
                expectDone: false
            },
            'when the delay is 1000000us, after 1000ms': {
                delay: 1000000,
                tick: 1000,
                expectDone: true
            }
        }, function (scenario, description) {
            describe(description, function () {
                if (scenario.expectDone) {
                    it('should have resolved the promise from .execute()', function (done) {
                        engine.execute('<?php usleep(' + scenario.delay + '); print "done";').then(function () {
                            done();
                        });

                        clock.tick(scenario.tick);
                    });
                } else {
                    it('should not have resolved the promise from .execute()', function (done) {
                        var onDone = sinon.spy();
                        engine.execute('<?php usleep(' + scenario.delay + '); print "done";').done(onDone);

                        clock.tick(scenario.tick);

                        realSetTimeout(function () {
                            try {
                                expect(onDone).not.to.have.been.called;
                                done();
                            } catch (error) {
                                done(error);
                            }
                        }, 200);
                    });
                }
            });
        });
    });
});
