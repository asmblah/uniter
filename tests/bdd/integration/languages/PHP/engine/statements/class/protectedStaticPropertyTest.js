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
    phpCommon = require('phpcommon'),
    phpTools = require('../../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

describe('PHP Engine class statement protected static property integration', function () {
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
        'reading protected static property from instance method': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        protected static $planet = 'Earth';

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
        'reading protected static property from static method': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        protected static $planet = 'Earth';

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
        'reading protected static property from instance method of derived class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        protected static $planet = 'Earth';
    }

    class Chicken extends Animal {
        public function getPlanet() {
            return Animal::$planet;
        }
    }

    return (new Chicken())->getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'trying to read protected static property from outside class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        protected static $planet = 'Earth';
    }

    return (new Animal())::$planet;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Cannot access protected property Animal::\$planet in \/path\/to\/my_module\.php on line 6$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Cannot access protected property Animal::$planet in /path/to/my_module.php:6
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 6

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Cannot access protected property Animal::$planet in /path/to/my_module.php:6
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 6

EOS
*/;}) //jshint ignore:line
        },
        'trying to read protected static property from instance method of another, unrelated class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        protected static $planet = 'Earth';
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
                match: /^PHP Fatal error: Uncaught Error: Cannot access protected property Animal::\$planet in \/path\/to\/my_module\.php on line 8$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Cannot access protected property Animal::$planet in /path/to/my_module.php:8
Stack trace:
#0 /path/to/my_module.php(12): Wall->getPlanet()
#1 {main}
  thrown in /path/to/my_module.php on line 8

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Cannot access protected property Animal::$planet in /path/to/my_module.php:8
Stack trace:
#0 /path/to/my_module.php(12): Wall->getPlanet()
#1 {main}
  thrown in /path/to/my_module.php on line 8

EOS
*/;}) //jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
