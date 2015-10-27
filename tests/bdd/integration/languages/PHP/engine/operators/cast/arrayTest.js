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

describe('PHP Engine array cast "(array) <value>" operator integration', function () {
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
        'cast of empty array to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) array());
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of populated array to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) array('a' => 7));
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  ["a"]=>
  int(7)
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of boolean true to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) true);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  bool(true)
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of boolean false to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) false);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  bool(false)
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of float 2.2 to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) 2.2);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  float(2.2)
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of integer 6 to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) 6);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  int(6)
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of null to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) null);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of empty stdClass instance to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) new stdClass);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of stdClass instance with one property to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $value = new stdClass;
    $value->prop = 6;

    var_dump((array) $value);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  ["prop"]=>
  int(6)
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of class instance with one public default property to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Test {
        public $name = "Dan";
    }

    var_dump((array) new Test);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  ["name"]=>
  string(3) "Dan"
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of empty string to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) '');
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  string(0) ""
}

EOS
*/;}) // jshint ignore:line
        },
        'cast of non-empty string to array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    var_dump((array) "Halcyon");
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  string(7) "Halcyon"
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
