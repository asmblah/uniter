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
    DATA_TYPES = ['array', 'boolean', 'float', 'int'/*, 'null', 'object', 'string'*/],
    PHPFatalError = phpCommon.PHPFatalError;

describe('PHP Engine bitwise operators integration', function () {
    var engine;

    function check(scenario) {
        beforeEach(function () {
            engine = phpTools.createEngine(scenario.options);
        });

        engineTools.check(function () {
            return {
                engine: engine
            };
        }, scenario);
    }

    describe('unary operators', function () {
        _.each({
            'one\'s complement (bitwise negation) operator "~<val>"': {
                operator: '~',
                operand: {
                    'array': [{
                        operand: 'array()',
                        expectedException: {
                            instanceOf: PHPFatalError,
                            match: /^PHP Fatal error: Uncaught TypeError: Cannot perform bitwise not on array in \/path\/to\/my_module\.php on line 1$/
                        },
                        expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Cannot perform bitwise not on array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                        expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Cannot perform bitwise not on array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                    }],
                    'boolean': [{
                        operand: 'true',
                        expectedException: {
                            instanceOf: PHPFatalError,
                            match: /^PHP Fatal error: Uncaught TypeError: Cannot perform bitwise not on bool in \/path\/to\/my_module\.php on line 1$/
                        },
                        expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Cannot perform bitwise not on bool in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                        expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Cannot perform bitwise not on bool in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                    }, {
                        operand: 'false',
                        expectedException: {
                            instanceOf: PHPFatalError,
                            match: /^PHP Fatal error: Uncaught TypeError: Cannot perform bitwise not on bool in \/path\/to\/my_module\.php on line 1$/
                        },
                        expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Cannot perform bitwise not on bool in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                        expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Cannot perform bitwise not on bool in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                    }],
                    'float': [{
                        operand: '0.0',
                        expectedResult: -1
                    }, {
                        operand: '0.8',
                        expectedResult: -1
                    }, {
                        operand: '1.0',
                        expectedResult: -2
                    }, {
                        operand: '4.4',
                        expectedResult: -5
                    }],
                    'int': [{
                        operand: '0',
                        expectedResult: -1
                    }, {
                        operand: '1',
                        expectedResult: -2
                    }, {
                        operand: '4',
                        expectedResult: -5
                    }]
                }
            }
        }, function (data, operatorDescription) {
            var operator = data.operator;

            describe('for the ' + operatorDescription, function () {
                _.each(DATA_TYPES, function (operandType) {
                    var operandDatas = data.operand[operandType];

                    _.each(operandDatas, function (operandData) {
                        var operand = operandData.operand;

                        describe('for ' + operator + operandType + '(' + operand + ')', function () {
                            var expression = operator + operand;

                            check({
                                code: '<?php return ' + expression + ';',
                                expectedResult: operandData.expectedResult,
                                expectedResultType: 'int',
                                expectedException: operandData.expectedException,
                                expectedStderr: operandData.expectedStderr || '',
                                expectedStdout: operandData.expectedStdout || ''
                            });
                        });
                    });
                });
            });
        });
    });

    describe('binary operators', function () {
        _.each({
            'bitwise left shift operator "<val> << <val>"': {
                operator: '<<',
                left: {
                    'array': {
                        right: {
                            'array': [{
                                left: 'array()',
                                right: 'array()',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: array << array in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: array << array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: array << array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'boolean': [{
                                left: 'array()',
                                right: 'false',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: array << bool in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: array << bool in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: array << bool in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'float': [{
                                left: 'array()',
                                right: '2.0',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: array << float in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: array << float in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: array << float in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'int': [{
                                left: 'array()',
                                right: '4',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: array << int in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: array << int in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: array << int in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }]
                        }
                    },
                    'boolean': {
                        right: {
                            'array': [{
                                left: 'true',
                                right: 'array()',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: bool << array in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: bool << array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: bool << array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'boolean': [{
                                left: 'true',
                                right: 'true',
                                expectedResult: 2
                            }, {
                                left: 'true',
                                right: 'false',
                                expectedResult: 1
                            }],
                            'float': [{
                                left: 'true',
                                right: '3.2',
                                expectedResult: 8
                            }, {
                                left: 'false',
                                right: '3.2',
                                expectedResult: 0
                            }],
                            'int': [{
                                left: 'true',
                                right: '3',
                                expectedResult: 8
                            }, {
                                left: 'false',
                                right: '2',
                                expectedResult: 0
                            }]
                        }
                    },
                    'float': {
                        right: {
                            'array': [{
                                left: '3.2',
                                right: 'array()',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: float << array in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: float << array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: float << array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'boolean': [{
                                left: '1.2',
                                right: 'true',
                                expectedResult: 2
                            }, {
                                left: '3.7',
                                right: 'false',
                                expectedResult: 3
                            }],
                            'float': [{
                                left: '0.0',
                                right: '0.0',
                                expectedResult: 0
                            }, {
                                left: '1.2',
                                right: '4.5',
                                expectedResult: 16
                            }],
                            'int': [{
                                left: '3.1',
                                right: '2',
                                expectedResult: 12
                            }]
                        }
                    },
                    'int': {
                        right: {
                            'array': [{
                                left: '2',
                                right: 'array()',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: int << array in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: int << array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: int << array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'boolean': [{
                                left: '5',
                                right: 'true',
                                expectedResult: 10
                            }, {
                                left: '4',
                                right: 'false',
                                expectedResult: 4
                            }],
                            'float': [{
                                left: '0',
                                right: '0.0',
                                expectedResult: 0
                            }, {
                                left: '4',
                                right: '3.7',
                                expectedResult: 32
                            }],
                            'int': [{
                                left: '0',
                                right: '0',
                                expectedResult: 0
                            }]
                        }
                    }
                }
            },
            'bitwise right shift operator "<val> >> <val>"': {
                operator: '>>',
                left: {
                    'array': {
                        right: {
                            'array': [{
                                left: 'array()',
                                right: 'array()',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: array >> array in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: array >> array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: array >> array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'boolean': [{
                                left: 'array()',
                                right: 'false',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: array >> bool in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: array >> bool in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: array >> bool in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'float': [{
                                left: 'array(1)',
                                right: '0.0',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: array >> float in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: array >> float in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: array >> float in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'int': [{
                                left: 'array()',
                                right: '4',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: array >> int in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: array >> int in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: array >> int in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }]
                        }
                    },
                    'boolean': {
                        right: {
                            'array': [{
                                left: 'true',
                                right: 'array()',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: bool >> array in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: bool >> array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: bool >> array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'boolean': [{
                                left: 'true',
                                right: 'true',
                                expectedResult: 0
                            }, {
                                left: 'true',
                                right: 'false',
                                expectedResult: 1
                            }],
                            'float': [{
                                left: 'true',
                                right: '3.2',
                                expectedResult: 0
                            }, {
                                left: 'false',
                                right: '3.2',
                                expectedResult: 0
                            }],
                            'int': [{
                                left: 'true',
                                right: '3',
                                expectedResult: 0
                            }, {
                                left: 'false',
                                right: '2',
                                expectedResult: 0
                            }]
                        }
                    },
                    'float': {
                        right: {
                            'array': [{
                                left: '3.2',
                                right: 'array()',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: float >> array in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: float >> array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: float >> array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'boolean': [{
                                left: '1.2',
                                right: 'true',
                                expectedResult: 0
                            }, {
                                left: '3.7',
                                right: 'false',
                                expectedResult: 3
                            }],
                            'float': [{
                                left: '0.0',
                                right: '0.0',
                                expectedResult: 0
                            }, {
                                left: '1.2',
                                right: '4.5',
                                expectedResult: 0
                            }],
                            'int': [{
                                left: '3.1',
                                right: '1',
                                expectedResult: 1
                            }]
                        }
                    },
                    'int': {
                        right: {
                            'array': [{
                                left: '2',
                                right: 'array()',
                                expectedException: {
                                    instanceOf: PHPFatalError,
                                    match: /^PHP Fatal error: Uncaught TypeError: Unsupported operand types: int >> array in \/path\/to\/my_module\.php on line 1$/
                                },
                                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught TypeError: Unsupported operand types: int >> array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), //jshint ignore:line
                                expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught TypeError: Unsupported operand types: int >> array in /path/to/my_module.php:1
Stack trace:
#0 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) //jshint ignore:line
                            }],
                            'boolean': [{
                                left: '5',
                                right: 'true',
                                expectedResult: 2
                            }, {
                                left: '4',
                                right: 'false',
                                expectedResult: 4
                            }],
                            'float': [{
                                left: '0',
                                right: '0.0',
                                expectedResult: 0
                            }, {
                                left: '4',
                                right: '1.2',
                                expectedResult: 2
                            }],
                            'int': [{
                                left: '0',
                                right: '0',
                                expectedResult: 0
                            }, {
                                left: '10',
                                right: '2',
                                expectedResult: 2
                            }]
                        }
                    }
                }
            }
        }, function (data, operatorDescription) {
            var operator = data.operator;

            describe('for the ' + operatorDescription, function () {
                _.each(DATA_TYPES, function (leftOperandType) {
                    _.each(DATA_TYPES, function (rightOperandType) {
                        var leftOperandData = data.left[leftOperandType],
                            rightOperandDatas = leftOperandData.right[rightOperandType];

                        _.each(rightOperandDatas, function (rightOperandData) {
                            var leftOperand = rightOperandData.left,
                                rightOperand = rightOperandData.right;

                            describe('for ' + leftOperandType + '(' + leftOperand + ') ' + operator + ' ' + rightOperandType + '(' + rightOperand + ')', function () {
                                var expression = leftOperand + operator + rightOperand;

                                check({
                                    code: '<?php return ' + expression + ';',
                                    expectedResult: rightOperandData.expectedResult,
                                    expectedResultType: 'int',
                                    expectedException: rightOperandData.expectedException,
                                    expectedStderr: rightOperandData.expectedStderr || '',
                                    expectedStdout: rightOperandData.expectedStdout || ''
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
