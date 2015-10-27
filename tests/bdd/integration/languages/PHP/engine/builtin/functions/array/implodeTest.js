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

describe('PHP Engine implode() builtin function integration', function () {
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
        'imploding an empty array just returns an empty string': {
            code: nowdoc(function () {/*<<<EOS
<?php
$myArray = array();
return implode(':', $myArray);
EOS
*/;}), // jshint ignore:line
            expectedResult: '',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'imploding an array with ($glue, $pieces)': {
            code: nowdoc(function () {/*<<<EOS
<?php
$myArray = array('a', 'b', 'c');
return implode(':', $myArray);
EOS
*/;}), // jshint ignore:line
            expectedResult: 'a:b:c',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'imploding an associative array': {
            code: nowdoc(function () {/*<<<EOS
<?php
$a = array("a" => "b", "c" => "d", "e");
return implode(":", $a);
EOS
*/;}), // jshint ignore:line
            expectedResult: 'b:d:e',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'imploding an array with a string and a stringifiable object': {
            code: nowdoc(function () {/*<<<EOS
<?php
class MyClass {
    public function __toString() {
        return 'my-object';
    }
}
$myArray = array('hello', new MyClass());
return implode('->', $myArray);
EOS
*/;}), // jshint ignore:line
            expectedResult: 'hello->my-object',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        '(backwards-compatibility) imploding an array with ($pieces, $glue)': {
            code: nowdoc(function () {/*<<<EOS
<?php
$myArray = array('d', 'e', 'f');
return implode($myArray, '-');
EOS
*/;}), // jshint ignore:line
            expectedResult: 'd-e-f',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
