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

describe('PHP Engine require_once(...) expression integration', function () {
    var engine;

    function check(scenario) {
        beforeEach(function () {
            engine = phpTools.createEngine(scenario.options);
        });

        engineTools.check(function () {
            return {
                engine: engine
            };
        }, scenario);
    }

    _.each({
        'requiring a file where include transport resolves promise with empty string': {
            code: nowdoc(function () {/*<<<EOS
<?php
    require_once 'test_file.php';

EOS
*/;}), // jshint ignore:line
            options: {
                include: function (path, promise) {
                    promise.resolve('');
                }
            },
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: ''
        },
        'require closure argument': {
            code: nowdoc(function () {/*<<<EOS
<?php
    spl_autoload_register(function ($class) {
        require_once $class;

        class MyClass {}
    });

    new MyClass();
EOS
*/;}), // jshint ignore:line
            options: {
                include: function (path, promise) {
                    promise.resolve('');
                }
            },
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: ''
        },
        'requiring a file where no include transport is specified': {
            code: nowdoc(function () {/*<<<EOS
<?php
    require_once 'test_file.php';

EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: require_once\(\): Failed opening 'test_file.php' for inclusion in \/path\/to\/my_module\.php on line 2$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Warning:  require_once(test_file.php): failed to open stream: load(test_file.php) :: No "include" transport option is available for loading the module in /path/to/my_module.php on line 2
PHP Fatal error:  require_once(): Failed opening 'test_file.php' for inclusion in /path/to/my_module.php on line 2

EOS
*/;}), // jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Warning: require_once(test_file.php): failed to open stream: load(test_file.php) :: No "include" transport option is available for loading the module in /path/to/my_module.php on line 2

Fatal error: require_once(): Failed opening 'test_file.php' for inclusion in /path/to/my_module.php on line 2

EOS
*/;}) // jshint ignore:line
        },
        'requiring a file where include transport resolves promise with code that just contains inline HTML': {
            code: nowdoc(function () {/*<<<EOS
<?php
    require_once 'print_hello_world.php';

EOS
*/;}), // jshint ignore:line
            options: {
                include: function (path, promise) {
                    // Note that the path is passed back for testing
                    promise.resolve('hello world from ' + path + '!');
                }
            },
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'hello world from print_hello_world.php!'
        },
        'requiring a file where include transport resolves promise with code that contains PHP code to echo a string': {
            code: nowdoc(function () {/*<<<EOS
<?php
    require_once 'print_hello.php';

EOS
*/;}), // jshint ignore:line
            options: {
                include: function (path, promise) {
                    // Note that the path is passed back for testing
                    promise.resolve('<?php echo "hello from ' + path + '!";');
                }
            },
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'hello from print_hello.php!'
        },
        'requiring a file where include transport resolves promise with code that returns a string': {
            code: nowdoc(function () {/*<<<EOS
<?php
    print 'and ' . (require_once 'print_hello.php') . '!';

EOS
*/;}), // jshint ignore:line
            options: {
                include: function (path, promise) {
                    // Note that the path is passed back for testing
                    promise.resolve('<?php return "welcome back";');
                }
            },
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'and welcome back!'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
