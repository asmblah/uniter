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

describe('PHP Engine "self" keyword construct integration', function () {
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
        // Ensure we don't allow keyword 'self' to be used with variable classes
        'attempting to read static property from current class via keyword "self" as variable class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth {
        private static $type = 'planet';

        public static function getType() {
            $thisClass = 'self';

            return $thisClass::$type;
        }
    }

    return Earth::getType();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'self' not found in \/path\/to\/my_module\.php on line 8$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'self' not found in /path/to/my_module.php:8
Stack trace:
#0 /path/to/my_module.php(12): Earth::getType()
#1 {main}
  thrown in /path/to/my_module.php on line 8

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class 'self' not found in /path/to/my_module.php:8
Stack trace:
#0 /path/to/my_module.php(12): Earth::getType()
#1 {main}
  thrown in /path/to/my_module.php on line 8

EOS
*/;}) //jshint ignore:line
        },
        'reading static property from current class via keyword "self"': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth {
        private static $hasHumans = true;

        public static function hasHumans() {
            return self::$hasHumans;
        }
    }

    class Mars {
        private static $hasHumans = false;

        public static function hasHumans() {
            return self::$hasHumans;
        }
    }

    return array(Earth::hasHumans(), Mars::hasHumans());
EOS
*/;}), // jshint ignore:line
            expectedResult: [true, false],
            expectedResultDeep: true,
            expectedResultType: 'array',
            expectedStderr: '',
            expectedStdout: ''
        },
        'reading static property from current class via keyword "self" inside namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
namespace My\Test\App;

class Earth {
    private static $type = 'planet';

    public static function getType() {
        return self::$type;
    }
}

return Earth::getType();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'planet',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'attempting to access "self::" when no class scope is active': {
            code: nowdoc(function () {/*<<<EOS
<?php
    echo self::$something;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Cannot access self:: when no class scope is active in \/path\/to\/my_module\.php on line 2$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Cannot access self:: when no class scope is active in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Cannot access self:: when no class scope is active in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}) //jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
