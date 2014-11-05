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
    '../../../tools',
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    engineTools,
    phpTools,
    util,
    PHPFatalError
) {
    'use strict';

    describe('PHP Engine interface statement instance method integration', function () {
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
            'attempting to define an instance method with a body for an interface': {
                code: util.heredoc(function (/*<<<EOS
<?php
    interface Mine {
        private function getYours() {
            return true;
        }
    }
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Interface function Mine::getYours\(\) cannot contain body$/
                },
                expectedStderr: 'PHP Fatal error: Interface function Mine::getYours() cannot contain body',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
