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
    engineTools = require('../tools'),
    nowdoc = require('nowdoc'),
    phpCommon = require('phpcommon'),
    phpTools = require('../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

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

    _.each({
        'calling function in global namespace with prefixed path': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function printIt() {
        echo 'it';
    }

    \printIt();
EOS
*/;}), // jshint ignore:line
            expectedStderr: '',
            expectedStdout: 'it'
        },
        'calling function in another deep namespace with prefixed path': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace MyStuff\Tools;

    function printIt() {
        echo 'it';
    }

    namespace MyProgram;

    \MyStuff\Tools\printIt();
EOS
*/;}), // jshint ignore:line
            expectedStderr: '',
            expectedStdout: 'it'
        },
        'call to function that is defined in current namespace should not fall back to global namespace': {
            code: nowdoc(function () {/*<<<EOS
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
*/;}), // jshint ignore:line
            expectedStderr: '',
            expectedStdout: 'MyStuff-it'
        },
        'call to function not defined in current namespace should fall back to global and not a parent namespace': {
            code: nowdoc(function () {/*<<<EOS
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
*/;}), // jshint ignore:line
            expectedStderr: '',
            expectedStdout: 'global-it'
        },
        'call to function defined in current namespace via prefixed string': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace MyTest;
    function myFunc() {
        return 24;
    }

    $fn = 'MyTest\myFunc';
    return $fn();
EOS
*/;}), // jshint ignore:line
            expectedResult: 24,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'call to instance method via array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class MyClass {
        public function printMsg($msg) {
            print $msg;

            return 24;
        }
    }

    $object = new MyClass;
    $ref = array($object, 'printMsg');

    return $ref('it');
EOS
*/;}), // jshint ignore:line
            expectedResult: 24,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: 'it'
        },
        'call to static method via array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class MyClass {
        public static function printMsg($msg) {
            print $msg;

            return 24;
        }
    }

    $ref = array('MyClass', 'printMsg');

    return $ref('it');
EOS
*/;}), // jshint ignore:line
            expectedResult: 24,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: 'it'
        },
        'passing an array literal referencing variable directly to a function when calling': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function getFirst($numbers) {
        return $numbers[0];
    }

    $seven = 7;
    $eight = 8;

    return getFirst(array($seven, '1' => $eight));
EOS
*/;}), // jshint ignore:line
            expectedResult: 7,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'attempting to call instance method via array with only one element should fail': {
            code: nowdoc(function () {/*<<<EOS
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
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Function name must be a string in \/path\/to\/my_module\.php on line 13$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Function name must be a string in /path/to/my_module.php:13
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 13

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Function name must be a string in /path/to/my_module.php:13
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 13

EOS
*/;}) //jshint ignore:line
        },
        'call to function defined in current namespace via unprefixed string should fail': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace MyTest;
    function myFunc() {}

    $fn = 'myFunc';
    $fn();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Call to undefined function myFunc\(\) in \/path\/to\/my_module\.php on line 6$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function myFunc() in /path/to/my_module.php:6
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 6

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function myFunc() in /path/to/my_module.php:6
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 6

EOS
*/;}) //jshint ignore:line
        },
        'call to undefined function in another namespace with prefixed path': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Test;
    \Creator\Stuff\doSomething();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Call to undefined function Creator\\Stuff\\doSomething\(\) in \/path\/to\/my_module\.php on line 3$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function Creator\Stuff\doSomething() in /path/to/my_module.php:3
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function Creator\Stuff\doSomething() in /path/to/my_module.php:3
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}) //jshint ignore:line
        },
        'call to undefined function in another namespace with unprefixed path': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Test;
    Creator\Stuff\doSomething();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Call to undefined function Test\\Creator\\Stuff\\doSomething\(\) in \/path\/to\/my_module\.php on line 3$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function Test\Creator\Stuff\doSomething() in /path/to/my_module.php:3
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function Test\Creator\Stuff\doSomething() in /path/to/my_module.php:3
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}) //jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
