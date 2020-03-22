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
    phpTools = require('../../../../tools');

describe('PHP Engine next() builtin function integration', function () {
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
                expectedResult: null,
                expectedStderr: 'PHP Warning:  next() expects parameter 1 to be array, int given in /path/to/my_module.php on line 4\n',
                expectedStdout: '\nWarning: next() expects parameter 1 to be array, int given in /path/to/my_module.php on line 4\n'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
