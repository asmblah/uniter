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

describe('PHP Engine while statement integration', function () {
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
        'while loop with bool(false) condition - should never execute body statements': {
            code: nowdoc(function () {/*<<<EOS
<?php
    while (false) {
        echo 1;
        echo 2;
    }

    echo 'Done.';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'Done.'
        },
        'while loop with counter to only execute 2 times': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $a = 0;

    while ($a < 2) {
        echo $a++ . ',';
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '0,1,'
        },
        'while loop with non-boolean falsy value - countdown from 2 to 0': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $a = 2;

    while ($a) {
        echo $a-- . ',';
    }
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
