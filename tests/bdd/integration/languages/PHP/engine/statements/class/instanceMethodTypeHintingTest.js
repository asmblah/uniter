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
    '../../tools',
    '../../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine class statement instance method type hinting integration', function () {
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
            'passing array to method argument type hinted as array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Math {
        public function sum(array $numbers) {
            $total = 0;

            foreach ($numbers as $number) {
                $total = $total + $number;
            }

            return $total;
        }
    }

    $math = new Math;

    return $math->sum(array(3, 5, 1));
EOS
*/) {}),
                expectedResult: 9,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
