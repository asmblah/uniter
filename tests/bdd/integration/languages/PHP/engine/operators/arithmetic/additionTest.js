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
    '../../../tools',
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    arithmeticTools,
    phpTools,
    util,
    PHPFatalError
) {
    'use strict';

    describe('PHP Engine addition operator integration', function () {
        function check(scenario) {
            arithmeticTools.check(function () {
                return {
                    engine: phpTools.createEngine(),
                    operator: '+'
                };
            }, scenario);
        }

        var left = {
                // NB: Addition of arrays is NOT commutative: order of operands matters.
                'array': {
                    right: {
                        'array': [{
                            left: 'array()',
                            right: 'array()',
                            expectedDump: util.heredoc(function (/*<<<EOS
array(0) {
}

EOS
*/) {})
                        }, {
                            left: 'array(1)',
                            right: 'array(1)',
                            expectedDump: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  int(1)
}

EOS
*/) {})
                        }, {
                            left: 'array(1 => 2)',
                            right: 'array(1 => 2)',
                            expectedDump: util.heredoc(function (/*<<<EOS
array(1) {
  [1]=>
  int(2)
}

EOS
*/) {})
                        }, {
                            left: 'array(1 => 2, 2 => 3)',
                            right: 'array(2 => 3, 1 => 2)',
                            expectedDump: util.heredoc(function (/*<<<EOS
array(2) {
  [1]=>
  int(2)
  [2]=>
  int(3)
}

EOS
*/) {}),
                            expectedInverseDump: util.heredoc(function (/*<<<EOS
array(2) {
  [2]=>
  int(3)
  [1]=>
  int(2)
}

EOS
*/) {})
                        }, {
                            left: 'array(1)',
                            right: 'array(2)',
                            expectedDump: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  int(1)
}

EOS
*/) {}),
                            expectedInverseDump: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  int(2)
}

EOS
*/) {})
                        }, {
                            left: 'array(1 => 1)',
                            right: 'array(1 => 2)',
                            expectedDump: util.heredoc(function (/*<<<EOS
array(1) {
  [1]=>
  int(1)
}

EOS
*/) {}),
                            expectedInverseDump: util.heredoc(function (/*<<<EOS
array(1) {
  [1]=>
  int(2)
}

EOS
*/) {})
                        }, {
                            left: 'array(1 => 2)',
                            right: 'array(2 => 2)',
                            expectedDump: util.heredoc(function (/*<<<EOS
array(2) {
  [1]=>
  int(2)
  [2]=>
  int(2)
}

EOS
*/) {}),
                            expectedInverseDump: util.heredoc(function (/*<<<EOS
array(2) {
  [2]=>
  int(2)
  [1]=>
  int(2)
}

EOS
*/) {})
                        }, {
                            left: 'array(1 => 2, 3 => 4)',
                            right: 'array(1 => 2)',
                            expectedDump: util.heredoc(function (/*<<<EOS
array(2) {
  [1]=>
  int(2)
  [3]=>
  int(4)
}

EOS
*/) {}),
                            expectedInverseDump: util.heredoc(function (/*<<<EOS
array(2) {
  [1]=>
  int(2)
  [3]=>
  int(4)
}

EOS
*/) {})
                        }],
                        'boolean': [{
                            left: 'array()',
                            right: 'false',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: 'PHP Fatal error: Unsupported operand types'
                        }, {
                            left: 'array(0)',
                            right: 'false',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: 'PHP Fatal error: Unsupported operand types'
                        }],
                        'float': [{
                            left: 'array()',
                            right: '1.0',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: 'PHP Fatal error: Unsupported operand types'
                        }],
                        'integer': [{
                            left: 'array()',
                            right: '1',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: 'PHP Fatal error: Unsupported operand types'
                        }],
                        'null': [{
                            left: 'array(0)',
                            right: 'null',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: 'PHP Fatal error: Unsupported operand types'
                        }],
                        'object': [{
                            left: 'array()',
                            right: 'new stdClass',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: util.heredoc(function (/*<<<EOS
PHP Notice: Object of class stdClass could not be converted to int
PHP Fatal error: Unsupported operand types
EOS
*/) {})
                        }, {
                            left: 'array(2)',
                            right: '(function () { class Planet {} return new Planet; }())',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            // Ensure correct class name is used in notice text
                            expectedStderr: util.heredoc(function (/*<<<EOS
PHP Notice: Object of class Planet could not be converted to int
PHP Fatal error: Unsupported operand types
EOS
*/) {})
                        }],
                        'string': [{
                            left: 'array()',
                            right: '""',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: 'PHP Fatal error: Unsupported operand types'
                        }]
                    }
                },
                'boolean': {
                    right: {
                        'boolean': [{
                            left: 'true',
                            right: 'true',
                            expectedResult: 2,
                            expectedResultType: 'integer'
                        }, {
                            left: 'true',
                            right: 'false',
                            expectedResult: 1,
                            expectedResultType: 'integer'
                        }, {
                            left: 'false',
                            right: 'true',
                            expectedResult: 1,
                            expectedResultType: 'integer'
                        }, {
                            left: 'false',
                            right: 'false',
                            expectedResult: 0,
                            expectedResultType: 'integer'
                        }],
                        'float': [{
                            left: 'true',
                            right: '0.0',
                            expectedResult: 1,
                            expectedResultType: 'float'
                        }, {
                            left: 'true',
                            right: '2.1',
                            expectedResult: 3.1,
                            expectedResultType: 'float'
                        }, {
                            left: 'false',
                            right: '0.0',
                            expectedResult: 0,
                            expectedResultType: 'float'
                        }, {
                            left: 'false',
                            right: '0.1',
                            expectedResult: 0.1,
                            expectedResultType: 'float'
                        }],
                        'integer': [{
                            left: 'true',
                            right: '0',
                            expectedResult: 1,
                            expectedResultType: 'integer'
                        }, {
                            left: 'true',
                            right: '2',
                            expectedResult: 3,
                            expectedResultType: 'integer'
                        }, {
                            left: 'false',
                            right: '0',
                            expectedResult: 0,
                            expectedResultType: 'integer'
                        }, {
                            left: 'false',
                            right: '3',
                            expectedResult: 3,
                            expectedResultType: 'integer'
                        }],
                        'null': [{
                            left: 'true',
                            right: 'null',
                            expectedResult: 1,
                            expectedResultType: 'integer'
                        }, {
                            left: 'false',
                            right: 'null',
                            expectedResult: 0,
                            expectedResultType: 'integer'
                        }],
                        'object': [{
                            left: 'true',
                            right: 'new stdClass',
                            expectedResult: 2,
                            expectedResultType: 'integer',
                            expectedStderr: util.heredoc(function (/*<<<EOS
PHP Notice: Object of class stdClass could not be converted to int

EOS
*/) {})
                        }, {
                            left: 'false',
                            right: 'new stdClass',
                            expectedResult: 1,
                            expectedResultType: 'integer',
                            expectedStderr: util.heredoc(function (/*<<<EOS
PHP Notice: Object of class stdClass could not be converted to int

EOS
*/) {})
                        }],
                        'string': [{
                            left: 'true',
                            right: '""',
                            expectedResult: 1,
                            expectedResultType: 'integer'
                        }, {
                            left: 'false',
                            right: '""',
                            expectedResult: 0,
                            expectedResultType: 'integer'
                        }, {
                            left: 'true',
                            right: '"world"',
                            expectedResult: 1,
                            expectedResultType: 'integer'
                        }, {
                            left: 'false',
                            right: '"world"',
                            expectedResult: 0,
                            expectedResultType: 'integer'
                        }, {
                            left: 'true',
                            right: '"4"',
                            expectedResult: 5,
                            expectedResultType: 'integer'
                        }, {
                            left: 'false',
                            right: '"3"',
                            expectedResult: 3,
                            expectedResultType: 'integer'
                        }, {
                            // Note that string with non-numeric prefix evaluates to zero
                            left: 'false',
                            right: '"a3"',
                            expectedResult: 0,
                            expectedResultType: 'integer'
                        }, {
                            // Note that string with non-numeric suffix is ignored
                            left: 'false',
                            right: '"3a"',
                            expectedResult: 3,
                            expectedResultType: 'integer'
                        }]
                    }
                },
                'float': {
                    right: {
                        'float': [{
                            left: '0.0',
                            right: '0.0',
                            expectedResult: 0,
                            expectedResultType: 'float'
                        }, {
                            left: '1.1',
                            right: '1.1',
                            expectedResult: 2.2,
                            expectedResultType: 'float'
                        }, {
                            left: '0.1',
                            right: '0.0',
                            expectedResult: 0.1,
                            expectedResultType: 'float'
                        }, {
                            left: '-0.0',
                            right: '0.0',
                            expectedResult: 0,
                            expectedResultType: 'float'
                        }],
                        'integer': [{
                            left: '0.0',
                            right: '0',
                            expectedResult: 0,
                            expectedResultType: 'float'
                        }, {
                            left: '1.0',
                            right: '1',
                            expectedResult: 2,
                            expectedResultType: 'float'
                        }, {
                            left: '0.1',
                            right: '0',
                            expectedResult: 0.1,
                            expectedResultType: 'float'
                        }],
                        'null': [{
                            left: '0.0',
                            right: 'null',
                            expectedResult: 0,
                            expectedResultType: 'float'
                        }, {
                            left: '1.0',
                            right: 'null',
                            expectedResult: 1,
                            expectedResultType: 'float'
                        }, {
                            left: '0.1',
                            right: 'null',
                            expectedResult: 0.1,
                            expectedResultType: 'float'
                        }, {
                            left: '-0.0',
                            right: 'null',
                            expectedResult: 0,
                            expectedResultType: 'float'
                        }],
                        'object': [{
                            left: '0.0',
                            right: 'new stdClass',
                            expectedResult: 1,
                            expectedResultType: 'float',
                            expectedStderr: util.heredoc(function (/*<<<EOS
PHP Notice: Object of class stdClass could not be converted to int

EOS
*/) {})
                        }, {
                            left: '0.1',
                            right: 'new stdClass',
                            expectedResult: 1.1,
                            expectedResultType: 'float',
                            expectedStderr: util.heredoc(function (/*<<<EOS
PHP Notice: Object of class stdClass could not be converted to int

EOS
*/) {})
                        }, {
                            left: '1.0',
                            right: 'new stdClass',
                            expectedResult: 2,
                            expectedResultType: 'float',
                            expectedStderr: util.heredoc(function (/*<<<EOS
PHP Notice: Object of class stdClass could not be converted to int

EOS
*/) {})
                        }],
                        'string': [{
                            left: '0.0',
                            right: '""',
                            expectedResult: 0,
                            expectedResultType: 'float'
                        }, {
                            left: '0.0',
                            right: '"0.1"',
                            expectedResult: 0.1,
                            expectedResultType: 'float'
                        }, {
                            left: '1.2',
                            right: '"1.2"',
                            expectedResult: 2.4,
                            expectedResultType: 'float'
                        }, {
                            left: '1.0',
                            right: '"1"',
                            expectedResult: 2,
                            expectedResultType: 'float'
                        }]
                    }
                },
                'integer': {
                    right: {
                        'integer': [{
                            left: '0',
                            right: '0',
                            expectedResult: 0,
                            expectedResultType: 'integer'
                        }, {
                            left: '1',
                            right: '1',
                            expectedResult: 2,
                            expectedResultType: 'integer'
                        }, {
                            left: '7',
                            right: '4',
                            expectedResult: 11,
                            expectedResultType: 'integer'
                        }, {
                            left: '-20',
                            right: '4',
                            expectedResult: -16,
                            expectedResultType: 'integer'
                        }],
                        'null': [/*{
                            left: '0',
                            right: 'null',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }, {
                            left: '1',
                            right: 'null',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }, {
                            // Negative and positive zero are equal
                            left: '-0',
                            right: 'null',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }*/],
                        'object': [/*{
                            left: '0',
                            right: 'new stdClass',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }, {
                            left: '1',
                            right: 'new stdClass',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }, {
                            left: '2',
                            right: 'new stdClass',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }*/],
                        'string': [/*{
                            left: '1',
                            right: '"1.0"',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }, {
                            left: '1',
                            right: '"1.2"',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }*/]
                    }
                },
                'null': {
                    right: {
                        'null': [/*{
                            left: 'null',
                            right: 'null',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }*/],
                        'object': [/*{
                            left: 'null',
                            right: 'new stdClass',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }*/],
                        'string': [/*{
                            left: 'null',
                            right: '""',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }, {
                            left: 'null',
                            right: '"null"',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }*/]
                    }
                },
                'object': {
                    right: {
                        'object': [/*{
                            left: 'new stdClass',
                            right: 'new stdClass',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }, {
                            left: '(function () { $o = new stdClass; $o->prop = 1; return $o; }())',
                            right: 'new stdClass',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }, {
                            left: '(function () { class FunTest {} return new FunTest; }())',
                            right: 'new stdClass',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }, {
                            setup: '$object = new stdClass;',
                            left: '$object',
                            right: '$object',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }*/],
                        'string': [/*{
                            left: 'new stdClass',
                            right: '""',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }*/]
                    }
                },
                'string': {
                    right: {
                        'string': [{
                            left: '"2"',
                            right: '"4"',
                            expectedResult: 6,
                            expectedResultType: 'integer'
                        }, {
                            left: '"2.2"',
                            right: '"4.2"',
                            expectedResult: 6.4,
                            expectedResultType: 'float'
                        }/*{
                            left: '"hello"',
                            right: '"hello"',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }, {
                            left: '"hello"',
                            right: '"world"',
                            expectedResult: false,
                            expectedResultType: 'boolean'
                        }, {
                            left: '""',
                            right: '""',
                            expectedResult: true,
                            expectedResultType: 'boolean'
                        }*/]
                    }
                }
            };

        check({
            left: left,
            operator: '+'
        });
    });
});
