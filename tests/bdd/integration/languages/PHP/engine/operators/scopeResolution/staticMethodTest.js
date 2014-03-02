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

        util.each({
            'calling static method from class referenced statically': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    return Animal::getPlanet();
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'calling dynamically referenced static method from class referenced statically': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $methodName = 'getPlanet';

    return Animal::$methodName();
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'attempting to call static method from array value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = array(1, 2);

    return $value::getIt();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
                expectedStdout: ''
            },
            'attempting to call static method from boolean value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = true;

    return $value::getIt();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
                expectedStdout: ''
            },
            'attempting to call static method from float value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = 4.1;

    return $value::getIt();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
                expectedStdout: ''
            },
            'attempting to call static method from integer value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = 7;

    return $value::getIt();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
                expectedStdout: ''
            },
            'attempting to call static method from null value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = null;

    return $value::getIt();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
                expectedStdout: ''
            },
            'calling static method from class referenced via an instance': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $animal = new Animal;

    return $animal::getPlanet();
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'calling static method from class referenced via a string containing class name': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $myClassName = 'Animal';

    return $myClassName::getPlanet();
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'attempting to call static method from string containing non-existent class name': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $myClassName = 'Person';

    return $myClassName::getIt();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class 'Person' not found$/
                },
                expectedStderr: 'PHP Fatal error: Class \'Person\' not found',
                expectedStdout: ''
            },
            'attempting to call undefined static method from class referenced statically': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Earth {}

    return Earth::getLegLength();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined method Earth::getLegLength\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined method Earth::getLegLength()',
                expectedStdout: ''
            },
            // Ensure we use .hasOwnProperty(...) checks internally
            'attempting to call undefined static method called "constructor" from class referenced statically': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Earth {}

    return Earth::constructor();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined method Earth::constructor\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined method Earth::constructor()',
                expectedStdout: ''
            },
            'calling instance method as static method from class referenced via an instance': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public function getPlanet() {
            return 'Earth';
        }
    }

    return Animal::getPlanet();
EOS
*/) {}),
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
});
