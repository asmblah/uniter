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
    phpTools = require('../../tools');

describe('PHP Engine foreach statement integration', function () {
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
        'simple foreach statement over array with 3 values': {
            code: nowdoc(function () {/*<<<EOS
<?php
    foreach (array("hello", "goodbye") as $index => $word) {
        echo $index . " is " . $word . "\n";
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '0 is hello\n1 is goodbye\n'
        },
        'nested foreach statement': {
            code: nowdoc(function () {/*<<<EOS
<?php
    foreach (array("A", "B") as $index => $outer) {
        foreach (array("1", "2") as $inner) {
            echo $index . "(" . $outer . ") -> " . $inner . "\n";
        }
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
0(A) -> 1
0(A) -> 2
1(B) -> 1
1(B) -> 2

EOS
*/;}) // jshint ignore:line
        },
        'nested foreach statement over same array': {
            // Arrays must be copied for this to work correctly with internal pointer
            code: nowdoc(function () {/*<<<EOS
<?php
    $array = array("A", "B");

    foreach ($array as $index => $outer) {
        foreach ($array as $inner) {
            echo $index . "(" . $outer . ") -> " . $inner . "\n";
        }
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
0(A) -> A
0(A) -> B
1(B) -> A
1(B) -> B

EOS
*/;}) // jshint ignore:line
        },
        'ensure that array is not modified when value is not by reference': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $array = array('A', 'B');

    foreach ($array as $letter) {
        $letter = 'C';
    }

    return $array[0] . $array[1];
EOS
*/;}), // jshint ignore:line
            expectedResult: 'AB',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'ensure that array is modified when value is by reference': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $array = array('A', 'B');

    foreach ($array as &$letter) {
        $letter = 'C';
    }

    return $array[0] . $array[1];
EOS
*/;}), // jshint ignore:line
            expectedResult: 'CC',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'foreach statement over object with one public, visible property': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $object = new stdClass;

    $object->aProp = 4;

    foreach ($object as $prop => $value) {
        echo $prop . '=' . $value . ',';
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'aProp=4,'
        },
        'foreach statement over object with two public, visible properties': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $object = new stdClass;

    $object->oneProp = 5;
    $object->anotherProp = 6;

    foreach ($object as $prop => $value) {
        echo $prop . '=' . $value . ',';
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'oneProp=5,anotherProp=6,'
        },
        'unpacking array with list': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $array = array(
        array(2, 3),
        array(5, 7)
    );

    foreach ($array as list($first, $second)) {
        print $first . ':' . $second . ',';
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '2:3,5:7,'
        },
        'foreach over element of array stored in property': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $object = new stdClass;
    $object->array = array(array(1, 2), array(5, 6));

    foreach ($object->array[1] as $number) {
        print $number . ',';
    }
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '5,6,'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
