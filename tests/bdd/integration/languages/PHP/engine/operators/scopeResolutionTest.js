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
    '../tools',
    '../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine scope resolution operator "::" integration', function () {
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
            'reading static property\'s initial value from class referenced statically': {
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
            },
            'reading static property\'s initial value from class referenced via an instance': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    $animal = new Animal;

    return $animal::$planet;
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'writing then reading static property from class referenced via an instance': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    $animal = new Animal;

    $animal::$planet = 'Mars';

    return $animal::$planet;
EOS
*/) {}),
                expectedResult: 'Mars',
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
