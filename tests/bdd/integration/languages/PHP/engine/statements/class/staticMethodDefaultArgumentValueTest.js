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
    engineTools = require('../../tools'),
    nowdoc = require('nowdoc'),
    phpTools = require('../../../tools');

describe('PHP Engine class statement static method default argument value integration', function () {
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
        'argument with no type hint but a default value of null called with a string': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public static function dumpIt($value = null) {
            var_dump($value);
        }
    }

    Test::dumpIt('world');
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
string(5) "world"

EOS
*/;}) // jshint ignore:line
        },
        'argument with no type hint but a default value of null called with no arguments': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public static function dumpIt($value = null) {
            var_dump($value);
        }
    }

    Test::dumpIt();
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
NULL

EOS
*/;}) // jshint ignore:line
        },
        'argument with no type hint but a default value of empty array called with no arguments': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public static function dumpIt($value = array()) {
            var_dump($value);
        }
    }

    Test::dumpIt();
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(0) {
}

EOS
*/;}) // jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
