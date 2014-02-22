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
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine class statement static property integration', function () {
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
            'defining static property without initial value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public static $planet;
    }

    return Animal::$planet;
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            'defining static property with initial value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    return Animal::$planet;
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
