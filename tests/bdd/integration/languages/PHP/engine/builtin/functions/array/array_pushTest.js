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
    phpTools = require('../../../../tools');

describe('PHP Engine array_push() builtin function integration', function () {
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
        'pushing one string onto empty array': {
            code: nowdoc(function () {/*<<<EOS
<?php
$myArray = array();
$result = array_push($myArray, 'hello');
var_dump($myArray);
return $result;
EOS
*/;}), // jshint ignore:line
            expectedResult: 1, // Should return new length of array
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  string(5) "hello"
}

EOS
*/;}), // jshint ignore:line
        },
        'pushing one string and one number onto existing array': {
            code: nowdoc(function () {/*<<<EOS
<?php
$myArray = array('my-value');
$result = array_push($myArray, 'world', 123);
var_dump($myArray);
return $result;
EOS
*/;}), // jshint ignore:line
            expectedResult: 3, // Should return new length of array
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(3) {
  [0]=>
  string(8) "my-value"
  [1]=>
  string(5) "world"
  [2]=>
  int(123)
}

EOS
*/;}), // jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
