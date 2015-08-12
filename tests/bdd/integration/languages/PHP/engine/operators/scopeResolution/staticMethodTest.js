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

describe('PHP Engine scope resolution operator "::" static method integration', function () {
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
        'calling static method from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
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
        'calling dynamically referenced static method from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $methodName = 'getPlanet';

    return Animal::$methodName();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'attempting to call static method from array value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = array(1, 2);

    return $value::getIt();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Class name must be a valid object or a string$/
            },
            expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
            expectedStdout: ''
        },
        'attempting to call static method from boolean value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = true;

    return $value::getIt();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Class name must be a valid object or a string$/
            },
            expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
            expectedStdout: ''
        },
        'attempting to call static method from float value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = 4.1;

    return $value::getIt();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Class name must be a valid object or a string$/
            },
            expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
            expectedStdout: ''
        },
        'attempting to call static method from integer value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = 7;

    return $value::getIt();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Class name must be a valid object or a string$/
            },
            expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
            expectedStdout: ''
        },
        'attempting to call static method from null value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = null;

    return $value::getIt();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Class name must be a valid object or a string$/
            },
            expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
            expectedStdout: ''
        },
        'calling static method from class referenced via an instance': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $animal = new Animal;

    return $animal::getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'calling static method from class referenced via a string containing class name': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $myClassName = 'Animal';

    return $myClassName::getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'attempting to call static method from string containing non-existent class name': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $myClassName = 'Person';

    return $myClassName::getIt();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Class 'Person' not found$/
            },
            expectedStderr: 'PHP Fatal error: Class \'Person\' not found',
            expectedStdout: ''
        },
        'attempting to call undefined static method from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth {}

    return Earth::getLegLength();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Call to undefined method Earth::getLegLength\(\)$/
            },
            expectedStderr: 'PHP Fatal error: Call to undefined method Earth::getLegLength()',
            expectedStdout: ''
        },
        // Ensure we use .hasOwnProperty(...) checks internally
        'attempting to call undefined static method called "constructor" from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth {}

    return Earth::constructor();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Call to undefined method Earth::constructor\(\)$/
            },
            expectedStderr: 'PHP Fatal error: Call to undefined method Earth::constructor()',
            expectedStdout: ''
        },
        'calling instance method as static method from class referenced via an instance': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public function getPlanet() {
            return 'Earth';
        }
    }

    return Animal::getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: 'PHP Strict standards: Non-static method Animal::getPlanet() should not be called statically\n',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
