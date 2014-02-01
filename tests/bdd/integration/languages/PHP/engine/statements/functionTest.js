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
                expectedStderr: 'PHP Notice: Undefined variable: a',
                expectedStdout: ''
            },
            'make sure variables defined in outer scopes are not defined in the inner one': {
                code: '<?php $a = 1; function doSomething() { echo $a; } doSomething();',
                expectedResult: null,
                expectedStderr: 'PHP Notice: Undefined variable: a',
                expectedStdout: ''
            },
            // Test for pre-hoisting
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
            },
            'calling a function before its definition where definition is inside of a function': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function declareFunc() {
        secondFunc();

        function secondFunc() {}
    }

    declareFunc();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function secondFunc\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function secondFunc()',
                expectedStdout: ''
            },
            'calling a function before its definition where definition is inside of a while loop': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $a = 1;

    while ($a--) {
        doSomething();

        function doSomething () {}
    }
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function doSomething\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function doSomething()',
                expectedStdout: ''
            },
            'calling a function before its definition where definition is inside of a foreach loop': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $items = array(1);

    foreach ($items as $item) {
        doSomething();

        function doSomething () {}
    }
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function doSomething\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function doSomething()',
                expectedStdout: ''
            },
            'using the name "tools" for a function argument': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function getResult($tools) {
        return $tools->result;
    }

    $tools = new stdClass;
    $tools->result = 7;

    return getResult($tools);
EOS
*/) {}),
                expectedResult: 7,
                expectedStderr: '',
                expectedStdout: ''
            },
            'function declarations inside conditionals should not be hoisted within the block': {
                code: util.heredoc(function (/*<<<EOS
<?php
    if (true) {
        doSomething();

        function doSomething() {}
    }
EOS
*/) {}),
                expectedStderr: 'PHP Fatal error: Call to undefined function doSomething()',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
