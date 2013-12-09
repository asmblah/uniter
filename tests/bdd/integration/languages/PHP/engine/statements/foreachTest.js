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

    describe('PHP Engine foreach statement integration', function () {
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

        util.each([
            {
                // Simple foreach statement over array with 3 values
                code: util.heredoc(function (/*<<<EOS
<?php
    foreach (array("hello", "goodbye") as $index => $word) {
        echo $index . " is " . $word . "\n";
    }
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: '0 is hello\n1 is goodbye\n'
            }, {
                // Nested foreach statement
                code: util.heredoc(function (/*<<<EOS
<?php
    foreach (array("A", "B") as $index => $outer) {
        foreach (array("1", "2") as $inner) {
            echo $index . "(" . $outer . ") -> " . $inner . "\n";
        }
    }
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
0(A) -> 1
0(A) -> 2
1(B) -> 1
1(B) -> 2

EOS
*/) {})
            }
        ], function (scenario) {
            check(scenario);
        });
    });
});
