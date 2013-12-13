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
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    engineTools,
    phpTools,
    util,
    PHPFatalError
) {
    'use strict';

    describe('PHP Engine function definition statement integration', function () {
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
            'simple function call': {
                code: '<?php function show($string) { echo $string; } show("hello!");',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'hello!'
            },
            'make sure variables defined in inner scopes are not defined in the outer one': {
                code: '<?php function doSomething() { $a = 1; } echo $a;',
                expectedResult: null,
                expectedStderr: 'PHP Notice: Undefined variable: $a',
                expectedStdout: ''
            },
            'make sure variables defined in outer scopes are not defined in the inner one': {
                code: '<?php $a = 1; function doSomething() { echo $a; } doSomething();',
                expectedResult: null,
                expectedStderr: 'PHP Notice: Undefined variable: $a',
                expectedStdout: ''
            },
            'calling a function before its definition outside of any blocks eg. conditionals': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return add1(7);

    function add1($number) {
        return $number + 1;
    }
EOS
*/) {}),
                expectedResult: 8,
                expectedStderr: '',
                expectedStdout: ''
            },
            'calling a function before its definition where definition is inside of a conditional': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return add1(7);

    if (true) {
        function add1($number) {
            return $number + 1;
        }
    }
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function add1\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function add1()',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
