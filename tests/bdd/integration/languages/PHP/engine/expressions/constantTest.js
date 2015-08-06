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

        util.each({
            'assigning undefined constant called "MY_CONST" to variable in global namespace': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    $value = MY_CONST;

    return $value;
EOS
*/;}), // jshint ignore:line
                // Undefined constant should be interpreted as bareword string literal
                expectedResult: 'MY_CONST',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant MY_CONST - assumed \'MY_CONST\'\n',
                expectedStdout: ''
            },
            'assigning undefined constant called "YOUR_CONST" to variable in global namespace': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    $value = YOUR_CONST;

    return $value;
EOS
*/;}), // jshint ignore:line
                // Undefined constant should be interpreted as bareword string literal
                expectedResult: 'YOUR_CONST',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant YOUR_CONST - assumed \'YOUR_CONST\'\n',
                expectedStdout: ''
            },
            'assigning undefined constant called "MY_CONST" to variable in a namespace': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    namespace Us;

    $value = MY_CONST;

    return $value;
EOS
*/;}), // jshint ignore:line
                // Undefined constant should be interpreted as bareword string literal
                expectedResult: 'MY_CONST',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant MY_CONST - assumed \'MY_CONST\'\n',
                expectedStdout: ''
            },
            'undefined constant as default argument value when not called': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    function test($value = UNDEF_CONST) {}
EOS
*/;}), // jshint ignore:line
                expectedResult: null,
                // No notice should be raised
                expectedStderr: '',
                expectedStdout: ''
            },
            'undefined constant as default argument value when called and used': {
                code: util.heredoc(function () {/*<<<EOS
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
                expectedStderr: 'PHP Notice: Use of undefined constant UNDEF_CONST - assumed \'UNDEF_CONST\'\n',
                expectedStdout: ''
            },
            // Ensure we use .hasOwnProperty(...) checks internally
            'undefined constant called "constructor" as default argument value when called and used': {
                code: util.heredoc(function () {/*<<<EOS
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
                expectedStderr: 'PHP Notice: Use of undefined constant constructor - assumed \'constructor\'\n',
                expectedStdout: ''
            },
            'undefined constant as default argument value when called but not used': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    function test($value = UNDEF_CONST) {
        return $value;
    }

    return test('world');
EOS
*/;}), // jshint ignore:line
                expectedResult: 'world',
                expectedResultType: 'string',
                // No notice should be raised
                expectedStderr: '',
                expectedStdout: ''
            },
            'defined constant as default argument value should be read and not raise warning when called and used': {
                code: util.heredoc(function () {/*<<<EOS
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
                // No notice should be raised
                expectedStderr: '',
                expectedStdout: ''
            },
            'defined constant in namespace read from another namespace': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    namespace Test;

    define('Test\NAME', 'Dan');

    namespace Fun;

    return \Test\NAME;
EOS
*/;}), // jshint ignore:line
                expectedResult: 'Dan',
                expectedResultType: 'string',
                // No notice should be raised
                expectedStderr: '',
                expectedStdout: ''
            },
            'defined constant in namespace read from another namespace via import': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    namespace Test;

    use My as Me;

    define('My\NAME', 'Dan');

    return Me\NAME;
EOS
*/;}), // jshint ignore:line
                expectedResult: 'Dan',
                expectedResultType: 'string',
                // No notice should be raised
                expectedStderr: '',
                expectedStdout: ''
            },
            'constant from global namespace should be used if not defined in current one, case-insensitive': {
                code: util.heredoc(function () {/*<<<EOS
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
                code: util.heredoc(function () {/*<<<EOS
<?php
namespace Test;

define('PLANET', 'Earth', false);

return pLaNET;
EOS
*/;}), // jshint ignore:line
                expectedResult: 'pLaNET',
                expectedResultType: 'string',
                expectedStderr: 'PHP Notice: Use of undefined constant pLaNET - assumed \'pLaNET\'\n',
                expectedStdout: ''
            },
            'attempting to read undefined constant from global namespace with prefix': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    return \NAME;
EOS
*/;}), // jshint ignore:line
                // Note that when using namespaces, use of undefined constant is a fatal error not just a notice
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Undefined constant 'NAME'$/
                },
                expectedStderr: 'PHP Fatal error: Undefined constant \'NAME\'',
                expectedStdout: ''
            },
            'attempting to read undefined constant from another namespace': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    namespace Fun;

    return My\Stuff\NAME;
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Undefined constant 'Fun\\My\\Stuff\\NAME'$/
                },
                expectedStderr: 'PHP Fatal error: Undefined constant \'Fun\\My\\Stuff\\NAME\'',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
