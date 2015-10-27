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

describe('PHP Engine boolean bridge integration', function () {
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

    describe('exposing as global PHP variables', function () {
        _.each({
            'true': {
                code: nowdoc(function () {/*<<<EOS
<?php
    return $theBoolean;
EOS
*/;}), // jshint ignore:line
                expose: {
                    'theBoolean': true
                },
                expectedResult: true,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            },
            'false': {
                code: nowdoc(function () {/*<<<EOS
<?php
    return $theBoolean;
EOS
*/;}), // jshint ignore:line
                expose: {
                    'theBoolean': false
                },
                expectedResult: false,
                expectedResultType: 'boolean',
                expectedStderr: '',
                expectedStdout: ''
            }
        }, function (scenario) {
            check(scenario);
        });
    });
});
