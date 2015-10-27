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

describe('PHP Engine __LINE__ magic constant expression integration', function () {
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
        'capturing line number when opening tag and __LINE__ are both on first line': {
            code: nowdoc(function () {/*<<<EOS
<?php echo __LINE__;

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '1'
        },
        'capturing line number when opening tag is on first but __LINE__ is on second line': {
            code: nowdoc(function () {/*<<<EOS
<?php
    echo __LINE__;

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '2'
        },
        'capturing line number in required module': {
            code: nowdoc(function () {/*<<<EOS
<?php
    require_once 'get_line.php';

EOS
*/;}), // jshint ignore:line
            options: {
                include: function (path, promise) {
                    promise.resolve(nowdoc(function () {/*<<<EOS
<?php

    echo __LINE__;

EOS
*/;})); // jshint ignore:line
                }
            },
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '3'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
