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

describe('PHP Engine magic "__autoload" function statement integration', function () {
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
        'should throw a fatal error if magic __autoload function in global namespace does not take any arguments': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function __autoload() {}
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: __autoload\(\) must take exactly 1 argument in \/path\/to\/my_module\.php on line 2$/
            },
            expectedStderr: 'PHP Fatal error:  __autoload() must take exactly 1 argument in /path/to/my_module.php on line 2\n',
            expectedStdout: '\nFatal error: __autoload() must take exactly 1 argument in /path/to/my_module.php on line 2\n'
        },
        'should throw a fatal error if magic __autoload function with non-lower case in global namespace does not take any arguments': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function __autoLOAd() {}
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: __autoload\(\) must take exactly 1 argument in \/path\/to\/my_module\.php on line 2$/
            },
            expectedStderr: 'PHP Fatal error:  __autoload() must take exactly 1 argument in /path/to/my_module.php on line 2\n',
            expectedStdout: '\nFatal error: __autoload() must take exactly 1 argument in /path/to/my_module.php on line 2\n'
        },
        'should not throw a fatal error if magic __autoload function in a namespace does not take any arguments': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace MyNamespace;
    function __autoload() {}
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            // Note that no error is raised, as the function is not magic if not in the global namespace
            expectedStderr: '',
            expectedStdout: ''
        },
        'should not be called when no class or interface is used': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function __autoload($class) {
        echo 'autoloading';
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: ''
        },
        'should not be called when class used in global namespace is already defined': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function __autoload($class) {
        echo 'autoloading';
    }

    class Test {}

    $object = new Test;
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: ''
        },
        'should be called when undefined class is used, erroring if class is still not defined by autoloader': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function __autoload($class) {
        echo 'autoloading ' . $class;
    }

    $object = new TeSt;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'TeSt' not found in \/path\/to\/my_module\.php on line 6$/
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
        },
        'should be called when undefined class is used in a namespace, erroring if class is still not defined by autoloader': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function __autoload($class) {
        echo 'autoloading ' . $class;
    }

    namespace My\Library;

    $object = new TeSt;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'My\\Library\\TeSt' not found in \/path\/to\/my_module\.php on line 8$/
            },
            // Note additional check for case preservation in class name string passed to autoloader
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'My\Library\TeSt' not found in /path/to/my_module.php:8
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 8

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS
autoloading My\Library\TeSt
Fatal error: Uncaught Error: Class 'My\Library\TeSt' not found in /path/to/my_module.php:8
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 8

EOS
*/;}) //jshint ignore:line
        },
        'should be called when undefined class is used, not erroring if class is then defined with same case by autoloader': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function __autoload($class) {
        class Test {}

        echo 'autoloaded ' . $class;
    }

    $object = new Test;
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'autoloaded Test'
        },
        'should be called when undefined class is used, not erroring if class is then defined with different case by autoloader': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function __autoload($class) {
        class MyTESTClass {}

        echo 'autoloaded ' . $class;
    }

    $object = new Mytestclass;
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'autoloaded Mytestclass'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
