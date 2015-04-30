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

    describe('PHP Engine "new <class>" operator integration', function () {
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
            'creating instance of class with no argument brackets': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Test {}

    $object = new Test;

    var_dump($object);
EOS
*/;}), // jshint ignore:line
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function () {/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
            },
            'creating instance of class from other namespace with no argument brackets': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    namespace You;
    class Test {}

    namespace Me;
    $object = new \You\Test;

    var_dump($object);
EOS
*/;}), // jshint ignore:line
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function () {/*<<<EOS
object(You\Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
            },
            'creating instance of class with argument brackets but no arguments': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Test {}

    $object = new Test();

    var_dump($object);
EOS
*/;}), // jshint ignore:line
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function () {/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
            },
            'creating instance of class that does not exist with no argument brackets': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    $object = new IDontExist;

    var_dump($object);
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class \'IDontExist\' not found$/
                },
                expectedStderr: 'PHP Fatal error: Class \'IDontExist\' not found',
                expectedStdout: ''
            },
            'creating instance of class that does not exist in namespace with no argument brackets': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    $object = new \Creator\Autoload\ClassLoader;

    var_dump($object);
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class 'Creator\\Autoload\\ClassLoader' not found$/
                },
                expectedStderr: 'PHP Fatal error: Class \'Creator\\Autoload\\ClassLoader\' not found',
                expectedStdout: ''
            },
            'creating instance of class using variable class': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Test {}

    $className = 'Test';
    $object = new $className();

    var_dump($object);
EOS
*/;}), // jshint ignore:line
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function () {/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
            },
            'class name should be case insensitive': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Test {}

    $object = new tEst();

    var_dump($object);
EOS
*/;}), // jshint ignore:line
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function () {/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
