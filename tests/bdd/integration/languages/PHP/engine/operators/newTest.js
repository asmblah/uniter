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

    _.each({
        'creating instance of class with no argument brackets': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {}

    $object = new Test;

    var_dump($object);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'creating instance of class from other namespace with no argument brackets': {
            code: nowdoc(function () {/*<<<EOS
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
            expectedStdout: nowdoc(function () {/*<<<EOS
object(You\Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'creating instance of class with argument brackets but no arguments': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {}

    $object = new Test();

    var_dump($object);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'creating instance of class that does not exist with no argument brackets': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $object = new IDontExist;

    var_dump($object);
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'IDontExist' not found in \/path\/to\/my_module\.php on line 2$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'IDontExist' not found in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class 'IDontExist' not found in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}) //jshint ignore:line
        },
        'creating instance of class that does not exist in namespace with no argument brackets': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $object = new \Creator\Autoload\ClassLoader;

    var_dump($object);
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'Creator\\Autoload\\ClassLoader' not found in \/path\/to\/my_module\.php on line 2/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'Creator\Autoload\ClassLoader' not found in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class 'Creator\Autoload\ClassLoader' not found in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}) //jshint ignore:line
        },
        'creating instance of class using variable class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {}

    $className = 'Test';
    $object = new $className();

    var_dump($object);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'class name should be case insensitive': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {}

    $object = new tEst();

    var_dump($object);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
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
