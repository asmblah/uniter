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
    '../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

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

        util.each({
            'while loop with bool(false) condition - should never execute body statements': {
                code: util.heredoc(function (/*<<<EOS
<?php
    while (false) {
        echo 1;
        echo 2;
    }

    echo 'Done.';
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'Done.'
            },
            'while loop with counter to only execute 2 times': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $a = 0;

    while ($a < 2) {
        echo $a++ . ',';
    }
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: '0,1,'
            },
            'while loop with non-boolean falsy value - countdown from 2 to 0': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $a = 2;

    while ($a) {
        echo $a-- . ',';
    }
EOS
*/) {}),
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
});
