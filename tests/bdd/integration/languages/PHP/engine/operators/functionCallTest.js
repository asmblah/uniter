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

    describe('PHP Engine function call operator integration', function () {
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
            'calling function in global namespace with prefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function printIt() {
        echo 'it';
    }

    \printIt();
EOS
*/) {}),
                expectedStderr: '',
                expectedStdout: 'it'
            },
            'calling function in another deep namespace with prefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace MyStuff\Tools;

    function printIt() {
        echo 'it';
    }

    namespace MyProgram;

    \MyStuff\Tools\printIt();
EOS
*/) {}),
                expectedStderr: '',
                expectedStdout: 'it'
            },
            'call to function that is defined in current namespace should not fall back to global namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function printIt() {
        echo 'global-it';
    }

    namespace MyStuff;
    function printIt() {
        echo 'MyStuff-it';
    }

    namespace MyStuff;
    printIt();
EOS
*/) {}),
                expectedStderr: '',
                expectedStdout: 'MyStuff-it'
            },
            'call to function not defined in current namespace should fall back to global and not a parent namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function printIt() {
        echo 'global-it';
    }

    namespace MyStuff;
    function printIt() {
        echo 'MyStuff-it';
    }

    namespace MyStuff\Tools;

    printIt();
EOS
*/) {}),
                expectedStderr: '',
                expectedStdout: 'global-it'
            },
            'call to function defined in current namespace via prefixed string': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace MyTest;
    function myFunc() {
        return 24;
    }

    $fn = 'MyTest\myFunc';
    return $fn();
EOS
*/) {}),
                expectedResult: 24,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'call to instance method via array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class MyClass {
        public function printIt() {
            print 'it';

            return 24;
        }
    }

    $object = new MyClass;
    $ref = array($object, 'printIt');

    return $ref();
EOS
*/) {}),
                expectedResult: 24,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: 'it'
            },
            'attempting to call instance method via array with only one element should fail': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class MyClass {
        public function printIt() {
            print 'it';

            return 24;
        }
    }

    $object = new MyClass;
    $ref = array($object);

    return $ref();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Function name must be a string$/
                },
                expectedStderr: 'PHP Fatal error: Function name must be a string',
                expectedStdout: ''
            },
            'call to function defined in current namespace via unprefixed string should fail': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace MyTest;
    function myFunc() {}

    $fn = 'myFunc';
    $fn();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function myFunc\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function myFunc()',
                expectedStdout: ''
            },
            'call to undefined function in another namespace with prefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace Test;
    \Creator\Stuff\doSomething();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function Creator\\Stuff\\doSomething\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function Creator\\Stuff\\doSomething()',
                expectedStdout: ''
            },
            'call to undefined function in another namespace with unprefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace Test;
    Creator\Stuff\doSomething();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function Test\\Creator\\Stuff\\doSomething\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function Test\\Creator\\Stuff\\doSomething()',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
