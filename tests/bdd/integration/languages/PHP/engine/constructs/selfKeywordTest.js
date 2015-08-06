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
    'phpcommon',
    '../../tools',
    'js/util'
], function (
    engineTools,
    phpCommon,
    phpTools,
    util
) {
    'use strict';

    var PHPFatalError = phpCommon.PHPFatalError;

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

        util.each({
            // Ensure we don't allow keyword 'self' to be used with variable classes
            'attempting to read static property from current class via keyword "self" as variable class': {
                code: util.heredoc(function () {/*<<<EOS
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
                    match: /^PHP Fatal error: Class 'self' not found$/
                },
                expectedStderr: 'PHP Fatal error: Class \'self\' not found',
                expectedStdout: ''
            },
            'reading static property from current class via keyword "self"': {
                code: util.heredoc(function () {/*<<<EOS
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
                code: util.heredoc(function () {/*<<<EOS
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
                code: util.heredoc(function () {/*<<<EOS
<?php
    echo self::$something;
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Cannot access self:: when no class scope is active$/
                },
                expectedStderr: 'PHP Fatal error: Cannot access self:: when no class scope is active',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
