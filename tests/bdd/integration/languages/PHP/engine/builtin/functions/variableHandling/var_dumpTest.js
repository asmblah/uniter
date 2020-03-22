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
    engineTools = require('../../../tools'),
    nowdoc = require('nowdoc'),
    phpCommon = require('phpcommon'),
    phpTools = require('../../../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

describe('PHP Engine var_dump() builtin function integration', function () {
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
        'when given no arguments': {
            code: '<?php return var_dump();',
            expectedResult: null,
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Warning:  var_dump() expects at least 1 parameter, 0 given in /path/to/my_module.php on line 1

EOS
*/;}), // jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Warning: var_dump() expects at least 1 parameter, 0 given in /path/to/my_module.php on line 1

EOS
*/;}) // jshint ignore:line
        },
        'attempting to dump property of undefined variable': {
            code: nowdoc(function () {/*<<<EOS
<?php
var_dump($undefinedVar->prop);
echo 'Done';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Notice:  Undefined variable: undefinedVar in /path/to/my_module.php on line 2
PHP Notice:  Trying to get property of non-object in /path/to/my_module.php on line 2

EOS
*/;}), // jshint ignore:line
            // Note that the 'Done' echo following the dump must be executed, this is only a notice
            expectedStdout: nowdoc(function () {/*<<<EOS

Notice: Undefined variable: undefinedVar in /path/to/my_module.php on line 2

Notice: Trying to get property of non-object in /path/to/my_module.php on line 2
NULL
Done
EOS
*/;}) // jshint ignore:line
        },
        'attempting to dump result of undefined variable method call': {
            code: nowdoc(function () {/*<<<EOS
<?php
var_dump($undefinedVar->myMethod());
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught Error: Call to a member function myMethod\(\) on null in \/path\/to\/my_module\.php on line 2$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Notice:  Undefined variable: undefinedVar in /path/to/my_module.php on line 2
PHP Fatal error:  Uncaught Error: Call to a member function myMethod() on null in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}), // jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Notice: Undefined variable: undefinedVar in /path/to/my_module.php on line 2

Fatal error: Uncaught Error: Call to a member function myMethod() on null in /path/to/my_module.php:2
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 2

EOS
*/;}) // jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });

    describe('when given one argument', function () {
        _.each({
            'empty array': {
                value: 'array()',
                expectedStdout: nowdoc(function () {/*<<<EOS
array(0) {
}

EOS
*/;}) // jshint ignore:line
            },
            'array with one element with implicit key': {
                value: 'array(7)',
                expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  int(7)
}

EOS
*/;}) // jshint ignore:line
            },
            'array with one element with explicit key': {
                value: 'array(4 => "a")',
                expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [4]=>
  string(1) "a"
}

EOS
*/;}) // jshint ignore:line
            },
            'array with one element with explicit key for subarray value': {
                value: 'array(5 => array(6, 7))',
                expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [5]=>
  array(2) {
    [0]=>
    int(6)
    [1]=>
    int(7)
  }
}

EOS
*/;}) // jshint ignore:line
            },
            'boolean true': {
                value: 'true',
                expectedStdout: 'bool(true)\n'
            },
            'boolean false': {
                value: 'false',
                expectedStdout: 'bool(false)\n'
            },
            'float': {
                value: '2.2',
                expectedStdout: 'float(2.2)\n'
            },
            'int': {
                value: '3',
                expectedStdout: 'int(3)\n'
            },
            'null': {
                value: 'null',
                expectedStdout: 'NULL\n'
            },
            'empty stdClass instance': {
                value: 'new stdClass',
                expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
            },
            'stdClass instance with one property': {
                value: 'new stdClass; $value->prop = 1',
                expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (1) {
  ["prop"]=>
  int(1)
}

EOS
*/;}) // jshint ignore:line
            },
            'stdClass instance with one property containing another stdClass instance': {
                value: 'new stdClass; $value->sub = new stdClass; $value->sub->prop = 1',
                expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (1) {
  ["sub"]=>
  object(stdClass)#2 (1) {
    ["prop"]=>
    int(1)
  }
}

EOS
*/;}) // jshint ignore:line
            },
            'string': {
                value: '"world"',
                expectedStdout: 'string(5) "world"\n'
            },
            'stdClass instance with one property referring to itself': {
                value: 'new stdClass; $value->me = $value',
                expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (1) {
  ["me"]=>
  *RECURSION*
}

EOS
*/;}) // jshint ignore:line
            },
            'array assigned to an element of itself - should be a copy, so no recursion': {
                value: 'array(); $value[0] = $value',
                expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  array(0) {
  }
}

EOS
*/;}) // jshint ignore:line
            },
            'array element with reference to variable': {
                value: 'array(); $where = "Here"; $value[0] =& $where; $where = "There"',
                expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  &string(5) "There"
}

EOS
*/;}) // jshint ignore:line
            },
            'reference to variable containing array assigned to an element of itself - should not be a copy, so recurses': {
                value: 'array(); $value[0] =& $value',
                expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  &array(1) {
    [0]=>
    *RECURSION*
  }
}

EOS
*/;}) // jshint ignore:line
            },
            'reference to variable containing object assigned to a property of itself': {
                value: 'new stdClass; $value->prop =& $value',
                expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (1) {
  ["prop"]=>
  *RECURSION*
}

EOS
*/;}) // jshint ignore:line
            },
            'circular reference from array -> object -> array': {
                value: 'array(); $object = new stdClass; $value[0] =& $object; $object->prop =& $value',
                expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  &object(stdClass)#1 (1) {
    ["prop"]=>
    &array(1) {
      [0]=>
      *RECURSION*
    }
  }
}

EOS
*/;}) // jshint ignore:line
            }
        }, function (scenario, description) {
            describe(description, function () {
                check({
                    code: '<?php $value = ' + scenario.value + '; var_dump($value);',
                    expectedStderr: scenario.expectedStderr || '',
                    expectedStdout: scenario.expectedStdout
                });
            });
        });
    });
});
