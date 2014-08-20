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
    'js/util'
], function (
    engineTools,
    phpTools,
    util
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
                code: util.heredoc(function (/*<<<EOS
<?php
    spl_autoload_register(function ($className) {
        var_dump($className);
    });

    return 27;
EOS
*/) {}),
                expectedResult: 27,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'registered autoloader function should not be called when a previously defined class is referenced': {
                code: util.heredoc(function (/*<<<EOS
<?php
    spl_autoload_register(function ($className) {
        var_dump($className);
    });

    class MyClass {}
    $object = new MyClass;

    return 27;
EOS
*/) {}),
                expectedResult: 27,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'registered autoloader function should be called with the class name when an undefined class is referenced': {
                code: util.heredoc(function (/*<<<EOS
<?php
    spl_autoload_register(function ($className) {
        var_dump($className);

        class MyUndefClass {}
    });

    $object = new MyUndefClass;

    return 27;
EOS
*/) {}),
                expectedResult: 27,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: 'string(12) "MyUndefClass"\n'
            },
            'registered autoloader string callable should be called with the class name when an undefined class is referenced': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function myAutoloader($className) {
        var_dump($className);

        class MyUndefClass {}
    }

    spl_autoload_register('myAutoloader');

    $object = new MyUndefClass;

    return 27;
EOS
*/) {}),
                expectedResult: 27,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: 'string(12) "MyUndefClass"\n'
            },
            'magic __autoload() function should not be called with the class name when an undefined class is referenced after the SPL stack has been enabled': {
                code: util.heredoc(function (/*<<<EOS
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
*/) {}),
                expectedResult: 31,
                expectedResultType: 'integer',
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
