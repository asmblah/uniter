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

describe('PHP Engine object access operator "->" instance method integration', function () {
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
        'call to statically referenced instance method returning value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public function getIt() {
            return 7;
        }
    }

    $object = new Test;

    return $object->getIt();
EOS
*/;}), // jshint ignore:line
            expectedResult: 7,
            expectedStderr: '',
            expectedStdout: ''
        },
        'call to statically referenced instance method with argument and returning value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public function addOne($number) {
            return $number + 1;
        }
    }

    $object = new Test;

    return $object->addOne(3);
EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedStderr: '',
            expectedStdout: ''
        },
        'call to dynamically referenced instance method returning value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public function getIt() {
            return 6;
        }
    }

    $object = new Test;
    $methodName = 'getIt';

    return $object->$methodName();
EOS
*/;}), // jshint ignore:line
            expectedResult: 6,
            expectedStderr: '',
            expectedStdout: ''
        },
        'call to undefined method of object when class is in global namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {}

    $object = new Test;

    var_dump($object->iDontExist());
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Call to undefined method Test::iDontExist\(\)$/
            },
            expectedStderr: 'PHP Fatal error: Call to undefined method Test::iDontExist()',
            expectedStdout: ''
        },
        'call to undefined method of object when class is in a namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace MyStuff;

    class Test {}

    $object = new Test;

    var_dump($object->iDontExist());
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Call to undefined method MyStuff\\Test::iDontExist\(\)$/
            },
            expectedStderr: 'PHP Fatal error: Call to undefined method MyStuff\\Test::iDontExist()',
            expectedStdout: ''
        },
        // Ensure we use .hasOwnProperty(...) checks internally
        'call to undefined instance method called "constructor"': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth {}

    $planet = new Earth;

    return $planet->constructor();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Call to undefined method Earth::constructor\(\)$/
            },
            expectedStderr: 'PHP Fatal error: Call to undefined method Earth::constructor()',
            expectedStdout: ''
        },
        'calling static method as instance method': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $animal = new Animal();

    return $animal->getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            // Note that no notices are generated at all
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
