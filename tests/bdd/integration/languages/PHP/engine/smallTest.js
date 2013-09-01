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
    './tools',
    '../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine small program integration', function () {
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
                code: '',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<p>A test</p>',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: '<p>A test</p>'
            },
            {
                code: '<?php',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php ?>',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<strong><?php ?></strong>',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: '<strong></strong>'
            },
            {
                code: '<?php $xyz = 21;',
                // No result is returned, even though $xyz is set to 21
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php return 37;',
                expectedResult: 37,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $answer = 6; return $answer;',
                expectedResult: 6,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $product = 2 * 4; return $product;',
                expectedResult: 8,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                // Checks precedence handling of explicit parentheses, as "8 - (2 * 3)" will be 2 whereas "(8 - 2) * 3" will be 18
                code: '<?php $product = (8 - 2) * 3; return $product;',
                expectedResult: 18,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php return "hello";',
                expectedResult: 'hello',
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php return \'world\';',
                expectedResult: 'world',
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php return \'hello \' . \'world\';',
                expectedResult: 'hello world',
                expectedStderr: '',
                expectedStdout: ''
            },
            // Ternary with nested ternary in condition:
            // - Common gotcha for developers, as in other languages ?: is right-associative whereas in PHP it's left-associative
            // - Result would be "Banana", but if right-associative it would be "Orange"
            {
                code: '<?php $arg = "A"; return ($arg === "A") ? "Apple" : ($arg === "B") ? "Banana" : "Orange";',
                expectedResult: 'Banana',
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $arr = array(); return $arr;',
                expectedResultCallback: function (result) {
                    expect(result).to.be.an('array');
                    expect(result).to.be.empty;
                },
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $arr = array(3 + 4, "hello " . "fred"); return $arr;',
                expectedResultCallback: function (result) {
                    expect(result).to.be.an('array');
                    expect(result).to.deep.equal([7, 'hello fred']);
                },
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $names = array(array("Barry", "baz"), array("Arthur", "arty"), array("Marge", "madge")); return $names[1][0];',
                expectedResult: 'Arthur',
                expectedStderr: '',
                expectedStdout: ''
            }
        ], function (scenario) {
            check(scenario);
        });
    });
});
