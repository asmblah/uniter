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
    phpCommon = require('phpcommon'),
    phpTools = require('../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

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

    _.each({
        'simple function call': {
            code: '<?php function show($string) { echo $string; } show("hello!");',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'hello!'
        },
        'make sure variables defined in inner scopes are not defined in the outer one': {
            code: '<?php function doSomething() { $a = 1; } echo $a;',
            expectedResult: null,
            expectedStderr: 'PHP Notice:  Undefined variable: a in /path/to/my_module.php on line 1\n',
            expectedStdout: '\nNotice: Undefined variable: a in /path/to/my_module.php on line 1\n'
        },
        'make sure variables defined in outer scopes are not defined in the inner one': {
            code: '<?php $a = 1; function doSomething() { echo $a; } doSomething();',
            expectedResult: null,
            expectedStderr: 'PHP Notice:  Undefined variable: a in /path/to/my_module.php on line 1\n',
            expectedStdout: '\nNotice: Undefined variable: a in /path/to/my_module.php on line 1\n'
        },
        // Test for pre-hoisting
        'calling a function before its definition outside of any blocks eg. conditionals': {
            code: nowdoc(function () {/*<<<EOS
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
            code: nowdoc(function () {/*<<<EOS
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
                match: /^PHP Fatal error: Uncaught Error: Call to undefined function add1\(\) in \/path\/to\/my_module\.php on line 2$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function add1() in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function add1() in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}) //jshint ignore:line
        },
        'calling a function before its definition where definition is inside of a function': {
            code: nowdoc(function () {/*<<<EOS
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
                match: /^PHP Fatal error: Uncaught Error: Call to undefined function secondFunc\(\) in \/path\/to\/my_module\.php on line 3$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function secondFunc() in /path/to/my_module.php:3
Stack trace:
#0 /path/to/my_module.php(8): declareFunc()
#1 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function secondFunc() in /path/to/my_module.php:3
Stack trace:
#0 /path/to/my_module.php(8): declareFunc()
#1 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}) //jshint ignore:line
        },
        'calling a function before its definition where definition is inside of a while loop': {
            code: nowdoc(function () {/*<<<EOS
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
                match: /^PHP Fatal error: Uncaught Error: Call to undefined function doSomething\(\) in \/path\/to\/my_module\.php on line 5$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function doSomething() in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function doSomething() in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}) //jshint ignore:line
        },
        'calling a function before its definition where definition is inside of a foreach loop': {
            code: nowdoc(function () {/*<<<EOS
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
                match: /^PHP Fatal error: Uncaught Error: Call to undefined function doSomething\(\) in \/path\/to\/my_module\.php on line 5$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function doSomething() in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function doSomething() in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}) //jshint ignore:line
        },
        'using the name "tools" for a function argument': {
            code: nowdoc(function () {/*<<<EOS
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
            code: nowdoc(function () {/*<<<EOS
<?php
    if (true) {
        doSomething();

        function doSomething() {}
    }
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Call to undefined function doSomething\(\) in \/path\/to\/my_module\.php on line 3$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function doSomething() in /path/to/my_module.php:3
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function doSomething() in /path/to/my_module.php:3
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}) //jshint ignore:line
        },
        'attempting to call undefined function in the global namespace with same name as in current': {
            code: nowdoc(function () {/*<<<EOS
<?php
namespace My\Stuff;
function my_func() {}

\my_func();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Call to undefined function my_func\(\) in \/path\/to\/my_module\.php on line 5$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function my_func() in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function my_func() in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}) //jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
