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
    phpTools = require('../../tools');

describe('PHP Engine do...while statement integration', function () {
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
        'do...while loop with bool(false) condition - should execute body statements once': {
            code: nowdoc(function () {/*<<<EOS
<?php
    do {
        echo 1;
        echo 2;
    } while (false);

    echo 'Done.';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '12Done.'
        },
        'do...while loop with bool(false) condition and with no braces around body - should execute body statement once': {
            code: nowdoc(function () {/*<<<EOS
<?php
    do echo 1; while (false);

    echo 'Done.';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '1Done.'
        },
        'do...while loop with counter to only execute 2 times': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $a = 0;

    do {
        echo $a++ . ',';
    } while ($a < 2);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '0,1,'
        },
        'do...while loop with non-boolean falsy value - countdown from 2 to 0': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $a = 2;

    do {
        echo $a-- . ',';
    } while ($a);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '2,1,'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
