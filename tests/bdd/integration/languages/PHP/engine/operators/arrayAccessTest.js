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
    phpTools = require('../../tools'),
    DATA_TYPES = ['array', 'boolean', 'float', 'int'/*, 'null', 'object', 'string'*/];

describe('PHP Engine array access/dereference ($array[...]) operator integration', function () {
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
        'array access/dereference operator "<val>[<val>]"': {
            left: {
                'array': {
                    right: {
                        'array': [{
                            left: 'array()',
                            right: 'array()',
                            expectedResult: null,
                            expectedResultType: 'null',
                            expectedStderr: 'PHP Warning:  Illegal offset type in /path/to/my_module.php on line 1\n',
                            expectedStdout: '\nWarning: Illegal offset type in /path/to/my_module.php on line 1\n'
                        }],
                        'boolean': [{
                            left: 'array()',
                            right: 'false',
                            expectedResult: null,
                            expectedResultType: 'null',
                            expectedStderr: 'PHP Notice:  Undefined offset: 0 in /path/to/my_module.php on line 1\n',
                            expectedStdout: '\nNotice: Undefined offset: 0 in /path/to/my_module.php on line 1\n'
                        }, {
                            left: 'array(2)',
                            right: 'false',
                            expectedResult: 2,
                            expectedResultType: 'int'
                        }, {
                            left: 'array()',
                            right: 'true',
                            expectedResult: null,
                            expectedResultType: 'null',
                            expectedStderr: 'PHP Notice:  Undefined offset: 1 in /path/to/my_module.php on line 1\n',
                            expectedStdout: '\nNotice: Undefined offset: 1 in /path/to/my_module.php on line 1\n'
                        }, {
                            left: 'array(2)',
                            right: 'true',
                            expectedResult: null,
                            expectedResultType: 'null',
                            expectedStderr: 'PHP Notice:  Undefined offset: 1 in /path/to/my_module.php on line 1\n',
                            expectedStdout: '\nNotice: Undefined offset: 1 in /path/to/my_module.php on line 1\n'
                        }],
                        'float': [{
                            left: 'array()',
                            right: '2.0',
                            expectedResult: null,
                            expectedResultType: 'null',
                            expectedStderr: 'PHP Notice:  Undefined offset: 2 in /path/to/my_module.php on line 1\n',
                            expectedStdout: '\nNotice: Undefined offset: 2 in /path/to/my_module.php on line 1\n'
                        }, {
                            left: 'array(1)',
                            right: '4.2',
                            expectedResult: null,
                            expectedResultType: 'null',
                            expectedStderr: 'PHP Notice:  Undefined offset: 4 in /path/to/my_module.php on line 1\n',
                            expectedStdout: '\nNotice: Undefined offset: 4 in /path/to/my_module.php on line 1\n'
                        }, {
                            left: 'array(1)',
                            right: '5.8',
                            expectedResult: null,
                            expectedResultType: 'null',
                            // Note that float is coerced to 5, not 6 as it is truncated
                            expectedStderr: 'PHP Notice:  Undefined offset: 5 in /path/to/my_module.php on line 1\n',
                            expectedStdout: '\nNotice: Undefined offset: 5 in /path/to/my_module.php on line 1\n'
                        }],
                        'int': [{
                            left: 'array()',
                            right: '4',
                            expectedResult: null,
                            expectedResultType: 'null',
                            expectedStderr: 'PHP Notice:  Undefined offset: 4 in /path/to/my_module.php on line 1\n',
                            expectedStdout: '\nNotice: Undefined offset: 4 in /path/to/my_module.php on line 1\n'
                        }, {
                            left: 'array(1)',
                            right: '0',
                            expectedResult: 1,
                            expectedResultType: 'int'
                        }]
                    }
                },
                'boolean': {
                    right: {
                        'array': [{
                            left: 'true',
                            right: 'array()',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: 'false',
                            right: 'array()',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }],
                        'boolean': [{
                            left: 'true',
                            right: 'true',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: 'true',
                            right: 'false',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }],
                        'float': [{
                            left: 'true',
                            right: '3.2',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: 'false',
                            right: '3.2',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }],
                        'int': [{
                            left: 'true',
                            right: '3',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: 'false',
                            right: '2',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }]
                    }
                },
                'float': {
                    right: {
                        'array': [{
                            left: '3.2',
                            right: 'array()',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: '2.7',
                            right: 'array(7)',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }],
                        'boolean': [{
                            left: '1.2',
                            right: 'true',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: '3.7',
                            right: 'false',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }],
                        'float': [{
                            left: '0.0',
                            right: '0.0',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: '1.2',
                            right: '4.5',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }],
                        'int': [{
                            left: '3.1',
                            right: '2',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }]
                    }
                },
                'int': {
                    right: {
                        'array': [{
                            left: '2',
                            right: 'array()',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: '2',
                            right: 'array(3)',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }],
                        'boolean': [{
                            left: '5',
                            right: 'true',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: '4',
                            right: 'false',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }],
                        'float': [{
                            left: '0',
                            right: '0.0',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }, {
                            left: '4',
                            right: '3.7',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }],
                        'int': [{
                            left: '0',
                            right: '0',
                            // Note that no warning or notice is displayed
                            expectedResult: null,
                            expectedResultType: 'null'
                        }]
                    }
                }
            }
        }
    }, function (data, operatorDescription) {
        describe('for the ' + operatorDescription, function () {
            _.each(DATA_TYPES, function (leftOperandType) {
                _.each(DATA_TYPES, function (rightOperandType) {
                    var leftOperandData = data.left[leftOperandType],
                        rightOperandDatas = leftOperandData.right[rightOperandType];

                    _.each(rightOperandDatas, function (rightOperandData) {
                        var leftOperand = rightOperandData.left,
                            rightOperand = rightOperandData.right;

                        describe('for ' + leftOperandType + '(' + leftOperand + ')[' + rightOperandType + '(' + rightOperand + ')]', function () {
                            var expression = leftOperand + '[' + rightOperand + ']';

                            check({
                                code: '<?php return ' + expression + ';',
                                expectedResult: rightOperandData.expectedResult,
                                expectedResultType: rightOperandData.expectedResultType,
                                expectedStderr: rightOperandData.expectedStderr || '',
                                expectedStdout: rightOperandData.expectedStdout || ''
                            });
                        });
                    });
                });
            });
        });
    });

    _.each({
        'array access of object property': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $object = new stdClass;

    $object->prop = array(4);

    return $object->prop[0];
EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'array access of function call result': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function getArray() {
        return array('a', 'b');
    }

    return getArray()[1];
EOS
*/;}), // jshint ignore:line
            expectedResult: 'b',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'array access with key in variable': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $array = array(2, 5, 6);
    $key = 1;

    return $array[$key];
EOS
*/;}), // jshint ignore:line
            expectedResult: 5,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'pushing integer onto existing array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $array = array(2, 5, 6);
    $array[] = 21;

    return $array[3];
EOS
*/;}), // jshint ignore:line
            expectedResult: 21,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
