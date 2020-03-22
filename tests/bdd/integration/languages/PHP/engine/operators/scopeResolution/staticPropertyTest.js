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

describe('PHP Engine scope resolution operator "::" static property integration', function () {
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
        'reading static property\'s initial value from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    return Animal::$planet;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'reading dynamically referenced static property\'s initial value from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    $propertyName = 'planet';

    return Animal::$$propertyName;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'attempting to read static property from array value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = array(1, 2);

    return $value::$prop;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class name must be a valid object or a string in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        'attempting to read static property from boolean value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = true;

    return $value::$prop;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class name must be a valid object or a string in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        'attempting to read static property from float value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = 4.1;

    return $value::$prop;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class name must be a valid object or a string in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        'attempting to read static property from integer value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = 7;

    return $value::$prop;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class name must be a valid object or a string in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        'attempting to read static property from null value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = null;

    return $value::$prop;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class name must be a valid object or a string in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class name must be a valid object or a string in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        'reading static property\'s initial value from class referenced via an instance': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    $animal = new Animal;

    return $animal::$planet;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'writing then reading static property from class referenced via an instance': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    $animal = new Animal;

    $animal::$planet = 'Mars';

    return $animal::$planet;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Mars',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'reading static property\'s initial value from class referenced via a string containing class name': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static $planet = 'Earth';
    }

    $myClassName = 'Animal';

    return $myClassName::$planet;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'attempting to read static property from string containing non-existent class name': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $myClassName = 'Person';

    return $myClassName::$planet;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'Person' not found in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'Person' not found in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class 'Person' not found in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        'attempting to read undefined static property from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth {}

    return Earth::$legLength;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Access to undeclared static property: Earth::\$legLength in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Access to undeclared static property: Earth::$legLength in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Access to undeclared static property: Earth::$legLength in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        // Ensure we use .hasOwnProperty(...) checks internally
        'attempting to read undefined static property called "constructor" from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth {}

    return Earth::$constructor;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Access to undeclared static property: Earth::\$constructor in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Access to undeclared static property: Earth::$constructor in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Access to undeclared static property: Earth::$constructor in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        'storing reference in static property': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Human {
        static $planet;
    }

    Human::$planet =& $world;

    $world = 'Earth';

    return Human::$planet;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
