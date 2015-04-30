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

    describe('PHP Engine class statement public static property integration', function () {
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
            'defining static property without initial value and reading from outside class': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Animal {
        public static $planet;
    }

    return Animal::$planet;
EOS
*/;}), // jshint ignore:line
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            'defining static property with initial value and reading from outside class': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    return Animal::$planet;
EOS
*/;}), // jshint ignore:line
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'trying to read public static property as instance property from outside class': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Animal {
        public static $species = 'Human';
    }

    return (new Animal)->species;
EOS
*/;}), // jshint ignore:line
                expectedResult: null,
                expectedStderr: util.heredoc(function () {/*<<<EOS
PHP Strict standards: Accessing static property Animal::$species as non static
PHP Notice: Undefined property: Animal::$species

EOS
*/;}), // jshint ignore:line
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
