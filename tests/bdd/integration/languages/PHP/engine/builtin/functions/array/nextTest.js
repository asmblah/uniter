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
    '../../../tools',
    '../../../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

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
            util.each({
                'advancing internal pointer of array and receiving value back': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    $array = array('a', 'b', 'c');

    // Advance to next element then return its value
    return next($array);
EOS
*/) {}),
                    expectedResult: 'b',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'advancing internal pointer of array then reading value with current()': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    $array = array(1, 2, 3);

    // Advance to next element
    next($array);

    return current($array);
EOS
*/) {}),
                    expectedResult: 2,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'advancing internal pointer of array past end and receiving value back': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    $array = array('z');

    // Advance to next element then return its value
    return next($array);
EOS
*/) {}),
                    expectedResult: false,
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'trying to advance internal pointer of variable containing integer': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    $notAnArray = 3;

    return next($notAnArray);
EOS
*/) {}),
                    expectedResult: null,
                    expectedStderr: 'PHP Warning: next() expects parameter 1 to be array, integer given\n',
                    expectedStdout: ''
                }
            }, function (scenario, description) {
                describe(description, function () {
                    check(scenario);
                });
            });
        });
    });
});
