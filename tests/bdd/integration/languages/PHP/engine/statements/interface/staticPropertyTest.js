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
    '../../tools',
    'phpcommon',
    '../../../tools',
    'js/util'
], function (
    engineTools,
    phpCommon,
    phpTools,
    util
) {
    'use strict';

    var PHPFatalError = phpCommon.PHPFatalError;

    describe('PHP Engine interface statement static property integration', function () {
        var engine;

        function check(scenario) {
            engineTools.check(function () {
                return {
                    engine: engine
                };
            }, scenario);
        }

        beforeEach(function () {
            engine = phpTools.createEngine();
        });

        util.each({
            'attempting to define a static property for an interface': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    interface Mine {
        private static $yours = false;
    }
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Interfaces may not include member variables$/
                },
                expectedStderr: 'PHP Fatal error: Interfaces may not include member variables',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
