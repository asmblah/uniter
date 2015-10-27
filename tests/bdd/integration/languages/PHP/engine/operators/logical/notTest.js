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

describe('PHP Engine logical Not "! <value>" operator integration', function () {
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
        'logical Not of empty array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!array());
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(true)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of populated array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!array('a' => 7));
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(false)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of boolean true': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!true);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(false)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of boolean false': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!false);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(true)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of float 0.0': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!0.0);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(true)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of float 2.2': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!2.2);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(false)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of integer 0': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!0);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(true)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of integer 6': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!6);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(false)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of null': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!null);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(true)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of empty stdClass instance': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!new stdClass);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(false)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of stdClass instance with one property': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = new stdClass;
    $value->prop = 6;

    var_dump(!$value);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(false)

EOS
*/;}) // jshint ignore:line
        },
        'logical Not of class instance with one public default property': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public $name = "Dan";
    }

    var_dump(!new Test);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(false)

EOS
*/;}) // jshint ignore:line
        },
        'cast of empty string to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!'');
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(true)

EOS
*/;}) // jshint ignore:line
        },
        'cast of non-empty string to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump(!'Halcyon');
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
bool(false)

EOS
*/;}) // jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
