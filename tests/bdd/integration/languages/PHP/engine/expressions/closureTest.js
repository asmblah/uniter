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

describe('PHP Engine closure expression integration', function () {
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
        'empty closure in void context, not called': {
            code: '<?php function () {};',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: ''
        },
        'closure that would print a string but is in void context, not called': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function () {
        echo 'nope';
    };

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: ''
        },
        'self-executed closure that just prints a string, no parentheses': {
            code: nowdoc(function () {/*<<<EOS
<?php
    (function () {
        echo 'good';
    })();

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'good'
        },
        'self-executed closure that prints the string passed to it, no parentheses': {
            code: nowdoc(function () {/*<<<EOS
<?php
    (function ($message) {
        echo $message;
    })('welcome!');

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'welcome!'
        },
        'self-executed closure that prints the bound var and the string passed to it, no parentheses': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $prefix = 'Hello and ';

    (function ($message) use ($prefix) {
        echo $prefix . $message;
    })('welcome!');

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'Hello and welcome!'
        },
        // Check that when passed by value, original variable in parent scope is not modified
        'self-executed closure that modifies its local copy of the bound var (by value), no parentheses': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $result = 4;

    (function () use ($result) {
        $result = 7;
    })();

    return $result;

EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedStderr: '',
            expectedStdout: ''
        },
        // Check that when passed by reference, original variable in parent scope is modified
        'self-executed closure that modifies the bound var (by reference), no parentheses': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $result = 4;

    (function () use (&$result) {
        $result = 7;
    })();

    return $result;

EOS
*/;}), // jshint ignore:line
            expectedResult: 7,
            expectedStderr: '',
            expectedStdout: ''
        },
        // Check that when passed by reference, original variable in parent scope is modified
        'self-executed closure that modifies the parameter var (by reference)': {
            code: nowdoc(function () {/*<<<EOS
<?php
    (function (&$arg) {
        $arg = 7;
    })($result);

    return $result;

EOS
*/;}), // jshint ignore:line
            expectedResult: 7,
            expectedStderr: '',
            expectedStdout: ''
        },
        'calling closure referencing $this': {
            code: nowdoc(function () {/*<<<EOS
<?php
class Stuff {
    public $value;

    public function getIt() {
        return function () {
            return $this->value;
        };
    }
}

$stuff = new Stuff();
$stuff->value = 21;

$callback = $stuff->getIt();

return $callback();
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
