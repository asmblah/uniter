/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('lodash'),
    engineTools = require('../../tools'),
    nowdoc = require('nowdoc'),
    phpCommon = require('phpcommon'),
    phpTools = require('../../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

describe('PHP Engine class statement private static property integration', function () {
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
        'reading private static property from instance method': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';

        public function getPlanet() {
            return self::$planet;
        }
    }

    return (new Animal())->getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'reading private static property from static method': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';

        public static function getPlanet() {
            return self::$planet;
        }
    }

    return Animal::getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'trying to read private static property from outside class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';
    }

    return (new Animal())::$planet;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Cannot access private property Animal::\$planet$/
            },
            expectedStderr: 'PHP Fatal error: Cannot access private property Animal::$planet',
            expectedStdout: ''
        },
        'trying to read private static property from instance method of another, unrelated class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';
    }

    class Wall {
        public function getPlanet() {
            return Animal::$planet;
        }
    }

    return (new Wall())->getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Cannot access private property Animal::\$planet$/
            },
            expectedStderr: 'PHP Fatal error: Cannot access private property Animal::$planet',
            expectedStdout: ''
        },
        'trying to read private static property from instance method of derived class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';
    }

    class Chicken extends Animal {
        public function getPlanet() {
            return Animal::$planet;
        }
    }

    return (new Chicken())->getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Cannot access private property Animal::\$planet$/
            },
            expectedStderr: 'PHP Fatal error: Cannot access private property Animal::$planet',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
