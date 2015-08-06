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
    'phpcommon',
    '../../tools',
    'js/util'
], function (
    engineTools,
    phpCommon,
    phpTools,
    util
) {
    'use strict';

    var PHPFatalError = phpCommon.PHPFatalError;

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
                expectedStderr: 'PHP Notice: Undefined variable: a\n',
                expectedStdout: ''
            },
            'make sure variables defined in outer scopes are not defined in the inner one': {
                code: '<?php $a = 1; function doSomething() { echo $a; } doSomething();',
                expectedResult: null,
                expectedStderr: 'PHP Notice: Undefined variable: a\n',
                expectedStdout: ''
            },
            // Test for pre-hoisting
            'calling a function before its definition outside of any blocks eg. conditionals': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    return add1(7);

    function add1($number) {
        return $number + 1;
    }
EOS
*/;}), // jshint ignore:line
                expectedResult: 8,
                expectedStderr: '',
                expectedStdout: ''
            },
            'calling a function before its definition where definition is inside of a conditional': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    return add1(7);

    if (true) {
        function add1($number) {
            return $number + 1;
        }
    }
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function add1\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function add1()',
                expectedStdout: ''
            },
            'calling a function before its definition where definition is inside of a function': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    function declareFunc() {
        secondFunc();

        function secondFunc() {}
    }

    declareFunc();
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function secondFunc\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function secondFunc()',
                expectedStdout: ''
            },
            'calling a function before its definition where definition is inside of a while loop': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    $a = 1;

    while ($a--) {
        doSomething();

        function doSomething () {}
    }
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function doSomething\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function doSomething()',
                expectedStdout: ''
            },
            'calling a function before its definition where definition is inside of a foreach loop': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    $items = array(1);

    foreach ($items as $item) {
        doSomething();

        function doSomething () {}
    }
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function doSomething\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function doSomething()',
                expectedStdout: ''
            },
            'using the name "tools" for a function argument': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    function getResult($tools) {
        return $tools->result;
    }

    $tools = new stdClass;
    $tools->result = 7;

    return getResult($tools);
EOS
*/;}), // jshint ignore:line
                expectedResult: 7,
                expectedStderr: '',
                expectedStdout: ''
            },
            'function declarations inside conditionals should not be hoisted within the block': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    if (true) {
        doSomething();

        function doSomething() {}
    }
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function doSomething\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function doSomething()',
                expectedStdout: ''
            },
            'attempting to call undefined function in the global namespace with same name as in current': {
                code: util.heredoc(function () {/*<<<EOS
<?php
namespace My\Stuff;
function my_func() {}

\my_func();
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined function my_func\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined function my_func()',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
