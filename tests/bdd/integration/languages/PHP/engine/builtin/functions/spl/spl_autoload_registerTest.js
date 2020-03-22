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
    engineTools = require('../../../tools'),
    nowdoc = require('nowdoc'),
    phpCommon = require('phpcommon'),
    phpTools = require('../../../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

describe('PHP Engine spl_autoload_register() builtin function integration', function () {
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
        'registered autoloader function should not be called when no classes are referenced': {
            code: nowdoc(function () {/*<<<EOS
<?php
    spl_autoload_register(function ($className) {
        var_dump($className);
    });

    return 27;
EOS
*/;}), // jshint ignore:line
            expectedResult: 27,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'registered autoloader function should not be called when a previously defined class is referenced': {
            code: nowdoc(function () {/*<<<EOS
<?php
    spl_autoload_register(function ($className) {
        var_dump($className);
    });

    class MyClass {}
    $object = new MyClass;

    return 27;
EOS
*/;}), // jshint ignore:line
            expectedResult: 27,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'registered autoloader function should be called with the class name when an undefined class is referenced': {
            code: nowdoc(function () {/*<<<EOS
<?php
    spl_autoload_register(function ($className) {
        var_dump($className);

        class MyUndefClass {}
    });

    $object = new MyUndefClass;

    return 27;
EOS
*/;}), // jshint ignore:line
            expectedResult: 27,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: 'string(12) "MyUndefClass"\n'
        },
        'registered autoloader string callable should be called with the class name when an undefined class is referenced': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function myAutoloader($className) {
        var_dump($className);

        class MyUndefClass {}
    }

    spl_autoload_register('myAutoloader');

    $object = new MyUndefClass;

    return 27;
EOS
*/;}), // jshint ignore:line
            expectedResult: 27,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: 'string(12) "MyUndefClass"\n'
        },
        'magic __autoload() function should not be called with the class name when an undefined class is referenced after the SPL stack has been enabled': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function __autoload($className) {
        print 'Wrong';
    }

    spl_autoload_register(function ($className) {
        class MyUndefClass {}
    });

    $object = new MyUndefClass;

    return 31;
EOS
*/;}), // jshint ignore:line
            expectedResult: 31,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'prevents further autoload functions from being called once one has defined the class': {
            code: nowdoc(function () {/*<<<EOS
<?php
function firstAutoloader($className) {
    class MyClass {}
    print 'First: ' . $className;
}
spl_autoload_register('firstAutoloader');
function secondAutoloader($className) {
    class MyClass {}
    print 'Second: ' . $className;
}
spl_autoload_register('secondAutoloader');

new MyClass();
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'First: MyClass'
        },
        'passing the class name argument directly to a print expression': {
            code: nowdoc(function () {/*<<<EOS
<?php
    spl_autoload_register(function ($className) {
        class MyClass {}

        print $className;
    });

    $object = new MyClass();

    return 27;
EOS
*/;}), // jshint ignore:line
            expectedResult: 27,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: 'MyClass'
        },
        'should be called when undefined class is used, erroring if class is still not defined by autoloader': {
            code: nowdoc(function () {/*<<<EOS
<?php
spl_autoload_register(function ($class) {
    echo 'autoloading ' . $class;
});

$object = new TeSt;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'TeSt' not found in \/path\/to\/my_module\.php on line 6/
            },
            // Note additional check for case preservation in class name string passed to autoloader
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'TeSt' not found in /path/to/my_module.php:6
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 6

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS
autoloading TeSt
Fatal error: Uncaught Error: Class 'TeSt' not found in /path/to/my_module.php:6
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 6

EOS
*/;}), //jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
