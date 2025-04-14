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

describe('PHP Engine next() builtin function integration', function () {
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

    describe('outside foreach (...) {...}', function () {
        _.each({
            'advancing internal pointer of array and receiving value back': {
                code: nowdoc(function () {/*<<<EOS
<?php
    $array = array('a', 'b', 'c');

    // Advance to next element then return its value
    return next($array);
EOS
*/;}), // jshint ignore:line
                expectedResult: 'b',
                expectedStderr: '',
                expectedStdout: ''
            },
            'advancing internal pointer of array then reading value with current()': {
                code: nowdoc(function () {/*<<<EOS
<?php
    $array = array(1, 2, 3);

    // Advance to next element
    next($array);

    return current($array);
EOS
*/;}), // jshint ignore:line
                expectedResult: 2,
                expectedStderr: '',
                expectedStdout: ''
            },
            'advancing internal pointer of array past end and receiving value back': {
                code: nowdoc(function () {/*<<<EOS
<?php
    $array = array('z');

    // Advance to next element then return its value
    return next($array);
EOS
*/;}), // jshint ignore:line
                expectedResult: false,
                expectedStderr: '',
                expectedStdout: ''
            },
            'trying to advance internal pointer of variable containing integer': {
                code: nowdoc(function () {/*<<<EOS
<?php
    $notAnArray = 3;

    return next($notAnArray);
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    // TODO: Note that this differs from PHP 8.1's output, where "|object" is not included
                    //       as passing objects is now deprecated.
                    match: /^PHP Fatal error: Uncaught TypeError: next\(\): Argument #1 \(\$array\) must be of type object\|array, int given in \/path\/to\/my_module.php:4 in \/path\/to\/my_module.php on line 4$/
                },
                // Note that the reference implementation will include a frame for the next() call here,
                // whereas Uniter specifically excludes them to match the behaviour elsewhere
                // (e.g. when passing an argument of invalid type to strlen(...)), i.e. it is inconsistent.
                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: next(): Argument #1 ($array) must be of type object|array, int given in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}), // jshint ignore:line
                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: next(): Argument #1 ($array) must be of type object|array, int given in /path/to/my_module.php:4
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 4

EOS
*/;}) // jshint ignore:line
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
