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

describe('PHP Engine constant expression integration', function () {
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
        'assigning undefined constant called "MY_CONST" to variable in global namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = MY_CONST;

    return $value;
EOS
*/;}), // jshint ignore:line
            // Undefined constant should be interpreted as bareword string literal
            expectedResult: 'MY_CONST',
            expectedResultType: 'string',
            expectedStderr: 'PHP Warning:  Use of undefined constant MY_CONST - assumed \'MY_CONST\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 2\n',
            expectedStdout: '\nWarning: Use of undefined constant MY_CONST - assumed \'MY_CONST\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 2\n'
        },
        'assigning undefined constant called "YOUR_CONST" to variable in global namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = YOUR_CONST;

    return $value;
EOS
*/;}), // jshint ignore:line
            // Undefined constant should be interpreted as bareword string literal
            expectedResult: 'YOUR_CONST',
            expectedResultType: 'string',
            expectedStderr: 'PHP Warning:  Use of undefined constant YOUR_CONST - assumed \'YOUR_CONST\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 2\n',
            expectedStdout: '\nWarning: Use of undefined constant YOUR_CONST - assumed \'YOUR_CONST\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 2\n'
        },
        'assigning undefined constant called "MY_CONST" to variable in a namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Us;

    $value = MY_CONST;

    return $value;
EOS
*/;}), // jshint ignore:line
            // Undefined constant should be interpreted as bareword string literal
            expectedResult: 'MY_CONST',
            expectedResultType: 'string',
            expectedStderr: 'PHP Warning:  Use of undefined constant MY_CONST - assumed \'MY_CONST\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 4\n',
            expectedStdout: '\nWarning: Use of undefined constant MY_CONST - assumed \'MY_CONST\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 4\n'
        },
        'undefined constant as default argument value when not called': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function test($value = UNDEF_CONST) {}
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            // No warning should be raised
            expectedStderr: '',
            expectedStdout: ''
        },
        'undefined constant as default argument value when called and used': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function test($value = UNDEF_CONST) {
        return $value;
    }

    return test();
EOS
*/;}), // jshint ignore:line
            // Undefined constant should be interpreted as bareword string literal
            expectedResult: 'UNDEF_CONST',
            expectedResultType: 'string',
            expectedStderr: 'PHP Warning:  Use of undefined constant UNDEF_CONST - assumed \'UNDEF_CONST\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 2\n',
            expectedStdout: '\nWarning: Use of undefined constant UNDEF_CONST - assumed \'UNDEF_CONST\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 2\n'
        },
        // Ensure we use .hasOwnProperty(...) checks internally
        'undefined constant called "constructor" as default argument value when called and used': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function test($value = constructor) {
        return $value;
    }

    return test();
EOS
*/;}), // jshint ignore:line
            // Undefined constant should be interpreted as bareword string literal
            expectedResult: 'constructor',
            expectedResultType: 'string',
            expectedStderr: 'PHP Warning:  Use of undefined constant constructor - assumed \'constructor\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 2\n',
            expectedStdout: '\nWarning: Use of undefined constant constructor - assumed \'constructor\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 2\n'
        },
        'undefined constant as default argument value when called but not used': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function test($value = UNDEF_CONST) {
        return $value;
    }

    return test('world');
EOS
*/;}), // jshint ignore:line
            expectedResult: 'world',
            expectedResultType: 'string',
            // No warning should be raised
            expectedStderr: '',
            expectedStdout: ''
        },
        'defined constant as default argument value should be read and not raise warning when called and used': {
            code: nowdoc(function () {/*<<<EOS
<?php
    define('MY_PLANET', 'Earth');

    function getPlanet($name = MY_PLANET) {
        return $name;
    }

    return getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            // No warning should be raised
            expectedStderr: '',
            expectedStdout: ''
        },
        'defined constant in namespace read from another namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Test;

    define('Test\NAME', 'Dan');

    namespace Fun;

    return \Test\NAME;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Dan',
            expectedResultType: 'string',
            // No warning should be raised
            expectedStderr: '',
            expectedStdout: ''
        },
        'defined constant in namespace read from another namespace via import': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Test;

    use My as Me;

    define('My\NAME', 'Dan');

    return Me\NAME;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Dan',
            expectedResultType: 'string',
            // No warning should be raised
            expectedStderr: '',
            expectedStdout: ''
        },
        'constant from global namespace should be used if not defined in current one, case-insensitive': {
            code: nowdoc(function () {/*<<<EOS
<?php
namespace Test;

define('PLANET', 'Earth', true);

return pLaNET;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'constant from global namespace should not be used if not defined in current one, case-sensitive': {
            code: nowdoc(function () {/*<<<EOS
<?php
namespace Test;

define('PLANET', 'Earth', false);

return pLaNET;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'pLaNET',
            expectedResultType: 'string',
            expectedStderr: 'PHP Warning:  Use of undefined constant pLaNET - assumed \'pLaNET\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 6\n',
            expectedStdout: '\nWarning: Use of undefined constant pLaNET - assumed \'pLaNET\' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 6\n'
        },
        'attempting to read undefined constant from global namespace with prefix': {
            code: nowdoc(function () {/*<<<EOS
<?php
    return \NAME;
EOS
*/;}), // jshint ignore:line
            // Note that when using namespaces, use of undefined constant is a fatal error not just a warning
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Undefined constant 'NAME' in \/path\/to\/my_module\.php on line 2/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Undefined constant 'NAME' in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Undefined constant 'NAME' in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}) //jshint ignore:line
        },
        'attempting to read undefined constant from another namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Fun;

    return My\Stuff\NAME;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Undefined constant 'Fun\\My\\Stuff\\NAME' in \/path\/to\/my_module\.php on line 4/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Undefined constant 'Fun\My\Stuff\NAME' in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Undefined constant 'Fun\My\Stuff\NAME' in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
