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

describe('PHP Engine array literal expression integration', function () {
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
        'empty array': {
            code: '<?php var_dump(array());',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'array with one auto-indexed element': {
            code: '<?php var_dump(array(2));',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [0]=>
  int(2)
}

EOS
*/;}) // jshint ignore:line
        },
        'array with one explicitly-indexed element': {
            code: '<?php var_dump(array(7 => 4));',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(1) {
  [7]=>
  int(4)
}

EOS
*/;}) // jshint ignore:line
        },
        'array with one explicitly-indexed element used as base for next implicitly-indexed element': {
            code: '<?php var_dump(array(7 => "a", "b"));',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
array(2) {
  [7]=>
  string(1) "a"
  [8]=>
  string(1) "b"
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
