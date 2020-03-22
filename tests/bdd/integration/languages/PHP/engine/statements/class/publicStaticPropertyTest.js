/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    engineTools = require('../../tools'),
    nowdoc = require('nowdoc'),
    phpTools = require('../../../tools');

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

    _.each({
        'defining static property without initial value and reading from outside class': {
            code: nowdoc(function () {/*<<<EOS
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
            code: nowdoc(function () {/*<<<EOS
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
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static $species = 'Human';
    }

    return (new Animal)->species;
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Strict standards:  Accessing static property Animal::$species as non static in /path/to/my_module.php on line 6
PHP Notice:  Undefined property: Animal::$species in /path/to/my_module.php on line 6

EOS
*/;}), // jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Strict standards: Accessing static property Animal::$species as non static in /path/to/my_module.php on line 6

Notice: Undefined property: Animal::$species in /path/to/my_module.php on line 6

EOS
*/;} )// jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
