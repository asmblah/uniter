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

describe('PHP Engine class statement integration', function () {
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
        'class that does not extend or implement': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {}

    $object = new Test();

    var_dump($object);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        // Test for pre-hoisting
        'instantiating a class before its definition outside of any blocks eg. conditionals': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(new FunTime);

    class FunTime {}
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(FunTime)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'instantiating a class before its definition where definition is inside of a conditional': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(new FunTime);

    if (true) {
        class FunTime {}
    }
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'FunTime' not found in \/path\/to\/my_module\.php on line 2/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'FunTime' not found in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class 'FunTime' not found in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}) //jshint ignore:line
        },
        'instantiating a class before its definition where definition is inside of a function': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function doDeclare() {
        var_dump(new FunTime);

        class FunTime {}
    }

    doDeclare();
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'FunTime' not found in \/path\/to\/my_module\.php on line 3/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'FunTime' not found in /path/to/my_module.php:3
Stack trace:
#0 /path/to/my_module.php(8): doDeclare()
#1 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class 'FunTime' not found in /path/to/my_module.php:3
Stack trace:
#0 /path/to/my_module.php(8): doDeclare()
#1 {main}
  thrown in /path/to/my_module.php on line 3

EOS
*/;}) //jshint ignore:line
        },
        'instantiating a class before its definition where definition is inside of a while loop': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $a = 1;

    while ($a--) {
        var_dump(new FunTime);

        class FunTime {}
    }
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'FunTime' not found in \/path\/to\/my_module\.php on line 5/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'FunTime' not found in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class 'FunTime' not found in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}) //jshint ignore:line
        },
        'instantiating a class before its definition where definition is inside of a foreach loop': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $items = array(1);

    foreach ($items as $item) {
        var_dump(new FunTime);

        class FunTime {}
    }
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Class 'FunTime' not found in \/path\/to\/my_module\.php on line 5/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Class 'FunTime' not found in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}), //jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Class 'FunTime' not found in /path/to/my_module.php:5
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 5

EOS
*/;}) //jshint ignore:line
        },
        'class with one public property': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class OnePub {
        public $prop = 'ok';
    }

    var_dump(new OnePub);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(OnePub)#1 (1) {
  ["prop"]=>
  string(2) "ok"
}

EOS
*/;}) // jshint ignore:line
        },
        'class with one public method': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public function doIt() {
            echo 21;
        }
    }

    $object = new Test();
    $object->doIt();
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
21
EOS
*/;}) // jshint ignore:line
        },
        'class with one public method using $this variable': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public function dumpMe() {
            var_dump($this);
        }
    }

    $object = new Test();
    $object->dumpMe();
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'class with magic __construct(...) method (PHP5-style constructor)': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Person {
        public $name;

        public function __construct($name) {
            $this->name = $name;
        }
    }

    $me = new Person('Dan');
    return $me->name;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Dan',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'class with PHP4-style constructor': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Person {
        public $name;

        public function Person($name) {
            $this->name = $name;
        }
    }

    $you = new Person('Fred');
    return $you->name;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Fred',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        // No errors when both used in this order: second method is just treated as a normal method
        'instantiating class with PHP5-style constructor followed by PHP4-style': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public function __construct() {
            echo 1;
        }

        public function Test() {
            echo 2;
        }
    }

    new Test();
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '1'
        },
        'instantiating class with PHP4-style constructor followed by PHP5-style': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public function Test() {
            echo 1;
        }

        public function __construct() {
            echo 2;
        }
    }

    new Test();
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: 'PHP Strict standards:  Redefining already defined constructor for class Test in /path/to/my_module.php on line 2\n',
            expectedStdout: '\nStrict standards: Redefining already defined constructor for class Test in /path/to/my_module.php on line 2\n2'
        },
        'unused class with PHP4-style constructor followed by PHP5-style': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public function Test() {
            echo 1;
        }

        public function __construct() {
            echo 2;
        }
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: 'PHP Strict standards:  Redefining already defined constructor for class Test in /path/to/my_module.php on line 2\n',
            expectedStdout: '\nStrict standards: Redefining already defined constructor for class Test in /path/to/my_module.php on line 2\n'
        },
        'class with magic __invoke(...) method': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class CallableClass {
        public function __invoke() {
            echo 'in here';

            return 7;
        }
    }

    $object = new CallableClass();
    return $object();
EOS
*/;}), // jshint ignore:line
            expectedResult: 7,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: 'in here'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
