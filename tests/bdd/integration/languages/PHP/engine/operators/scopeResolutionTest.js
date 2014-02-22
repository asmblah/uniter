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
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    engineTools,
    phpTools,
    util,
    PHPFatalError
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
            'attempting to read static property from array value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = array(1, 2);

    return $value::$prop;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
                expectedStdout: ''
            },
            'attempting to read static property from boolean value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = true;

    return $value::$prop;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
                expectedStdout: ''
            },
            'attempting to read static property from float value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = 4.1;

    return $value::$prop;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
                expectedStdout: ''
            },
            'attempting to read static property from integer value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = 7;

    return $value::$prop;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
                expectedStdout: ''
            },
            'attempting to read static property from null value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = null;

    return $value::$prop;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class name must be a valid object or a string$/
                },
                expectedStderr: 'PHP Fatal error: Class name must be a valid object or a string',
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
            },
            'reading static property\'s initial value from class referenced via a string containing class name': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    $myClassName = 'Animal';

    return $myClassName::$planet;
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'attempting to read static property from string containing non-existent class name': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $myClassName = 'Person';

    return $myClassName::$planet;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class 'Person' not found$/
                },
                expectedStderr: 'PHP Fatal error: Class \'Person\' not found',
                expectedStdout: ''
            },
            'attempting to read undefined static property from class referenced statically': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Earth {}

    return Earth::$legLength;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Access to undeclared static property: Earth::\$legLength$/
                },
                expectedStderr: 'PHP Fatal error: Access to undeclared static property: Earth::$legLength',
                expectedStdout: ''
            },
            'storing reference in static property': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Human {
        static $planet;
    }

    Human::$planet =& $world;

    $world = 'Earth';

    return Human::$planet;
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
