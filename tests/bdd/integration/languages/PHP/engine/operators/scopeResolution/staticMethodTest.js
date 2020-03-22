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

describe('PHP Engine scope resolution operator "::" static method integration', function () {
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
        'calling static method from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    return Animal::getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'calling dynamically referenced static method from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $methodName = 'getPlanet';

    return Animal::$methodName();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'attempting to call static method from array value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = array(1, 2);

    return $value::getIt();
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
        'attempting to call static method from boolean value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = true;

    return $value::getIt();
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
        'attempting to call static method from float value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = 4.1;

    return $value::getIt();
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
        'attempting to call static method from integer value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = 7;

    return $value::getIt();
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
        'attempting to call static method from null value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = null;

    return $value::getIt();
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
        'calling static method from class referenced via an instance': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $animal = new Animal;

    return $animal::getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'calling static method from class referenced via a string containing class name': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public static function getPlanet() {
            return 'Earth';
        }
    }

    $myClassName = 'Animal';

    return $myClassName::getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'attempting to call static method from string containing non-existent class name': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $myClassName = 'Person';

    return $myClassName::getIt();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'Person' not found in \/path\/to\/my_module\.php on line 4/
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
        'attempting to call undefined static method from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth {}

    return Earth::getLegLength();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Call to undefined method Earth::getLegLength\(\) in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined method Earth::getLegLength() in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined method Earth::getLegLength() in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        // Ensure we use .hasOwnProperty(...) checks internally
        'attempting to call undefined static method called "constructor" from class referenced statically': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth {}

    return Earth::constructor();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Call to undefined method Earth::constructor\(\) in \/path\/to\/my_module\.php on line 4$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined method Earth::constructor() in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined method Earth::constructor() in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) //jshint ignore:line
        },
        'calling instance method as static method from class referenced via an instance': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public function getPlanet() {
            return 'Earth';
        }
    }

    return Animal::getPlanet();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Earth',
            expectedResultType: 'string',
            expectedStderr: 'PHP Strict standards:  Non-static method Animal::getPlanet() should not be called statically in /path/to/my_module.php on line 8\n',
            expectedStdout: '\nStrict standards: Non-static method Animal::getPlanet() should not be called statically in /path/to/my_module.php on line 8\n'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
