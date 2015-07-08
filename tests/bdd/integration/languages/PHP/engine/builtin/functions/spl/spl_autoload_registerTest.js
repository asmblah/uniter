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
    '../../../tools',
    '../../../../tools',
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    engineTools,
    phpTools,
    util,
    PHPFatalError
) {
    'use strict';

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

        util.each({
            'registered autoloader function should not be called when no classes are referenced': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    spl_autoload_register(function ($className) {
        var_dump($className);
    });

    return 27;
EOS
*/;}), // jshint ignore:line
                expectedResult: 27,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'registered autoloader function should not be called when a previously defined class is referenced': {
                code: util.heredoc(function () {/*<<<EOS
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
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'registered autoloader function should be called with the class name when an undefined class is referenced': {
                code: util.heredoc(function () {/*<<<EOS
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
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: 'string(12) "MyUndefClass"\n'
            },
            'registered autoloader string callable should be called with the class name when an undefined class is referenced': {
                code: util.heredoc(function () {/*<<<EOS
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
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: 'string(12) "MyUndefClass"\n'
            },
            'magic __autoload() function should not be called with the class name when an undefined class is referenced after the SPL stack has been enabled': {
                code: util.heredoc(function () {/*<<<EOS
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
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'prevents further autoload functions from being called once one has defined the class': {
                code: util.heredoc(function () {/*<<<EOS
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
                code: util.heredoc(function () {/*<<<EOS
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
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: 'MyClass'
            },
            'should be called when undefined class is used, erroring if class is still not defined by autoloader': {
                code: util.heredoc(function () {/*<<<EOS
<?php
spl_autoload_register(function ($class) {
    echo 'autoloading ' . $class;
});

$object = new TeSt;
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class 'TeSt' not found$/
                },
                // Note additional check for case preservation in class name string passed to autoloader
                expectedStderr: 'PHP Fatal error: Class \'TeSt\' not found',
                expectedStdout: 'autoloading TeSt'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
