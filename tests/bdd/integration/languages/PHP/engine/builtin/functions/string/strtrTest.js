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

describe('PHP Engine strtr() builtin function integration', function () {
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
        '3-argument form': {
            code: nowdoc(function () {/*<<<EOS
<?php
$msg = 'Hello from abc!';

return strtr($msg, 'abcd', 'efgh');
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Hello from efg!',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        '3-argument form with longer $from ignores extra characters in $to': {
            code: nowdoc(function () {/*<<<EOS
<?php
$msg = 'Hello from abc!';

return strtr($msg, 'abcdefgh', 'ijk');
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Hello from ijk!',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        '2-argument form': {
            code: nowdoc(function () {/*<<<EOS
<?php
$msg = 'Hello from abc, abc!';

return strtr($msg, array('ello' => 'i', 'b' => 'z'));
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Hi from azc, azc!',
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
