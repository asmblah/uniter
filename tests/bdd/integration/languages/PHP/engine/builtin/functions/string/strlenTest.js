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

describe('PHP Engine strlen() builtin function integration', function () {
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
        'getting length of array': {
            code: '<?php return strlen(array());',
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught TypeError: strlen\(\): Argument #1 \(\$str\) must be of type string, array given in \/path\/to\/my_module.php:1 in \/path\/to\/my_module.php on line 1$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: strlen(): Argument #1 ($str) must be of type string, array given in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), // jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: strlen(): Argument #1 ($str) must be of type string, array given in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) // jshint ignore:line
        },
        'getting length of bool(true)': {
            code: '<?php return strlen(true);',
            expectedResult: 1,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of bool(false)': {
            code: '<?php return strlen(false);',
            expectedResult: 0,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of float 21.34': {
            code: '<?php $value = 21.34; return strlen($value);',
            expectedResult: 5,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of integer(4)': {
            code: '<?php $value = 4; return strlen($value);',
            expectedResult: 1,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of null': {
            code: '<?php return strlen(null);',
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught TypeError: strlen\(\): Argument #1 \(\$str\) must be of type string, null given in \/path\/to\/my_module.php:1 in \/path\/to\/my_module.php on line 1$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: strlen(): Argument #1 ($str) must be of type string, null given in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), // jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: strlen(): Argument #1 ($str) must be of type string, null given in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) // jshint ignore:line
        },
        'getting length of stdClass instance': {
            code: '<?php return strlen(new stdClass);',
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught TypeError: strlen\(\): Argument #1 \(\$str\) must be of type string, stdClass given in \/path\/to\/my_module.php:1 in \/path\/to\/my_module.php on line 1$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: strlen(): Argument #1 ($str) must be of type string, stdClass given in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), // jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: strlen(): Argument #1 ($str) must be of type string, stdClass given in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) // jshint ignore:line
        },
        'getting length of empty string': {
            code: '<?php $value = ""; return strlen($value);',
            expectedResult: 0,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'getting length of string "octopus"': {
            code: '<?php $value = "octopus"; return strlen($value);',
            expectedResult: 7,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
