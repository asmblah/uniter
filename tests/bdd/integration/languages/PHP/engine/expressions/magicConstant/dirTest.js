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

describe('PHP Engine __DIR__ magic constant expression integration', function () {
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
        'capturing current file\'s directory from initial program code': {
            code: nowdoc(function () {/*<<<EOS
<?php echo __DIR__;

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '/path/to'
        },
        'capturing current file\'s directory in required module': {
            code: nowdoc(function () {/*<<<EOS
<?php
    require_once 'vendor/producer/get_dir.php';

EOS
*/;}), // jshint ignore:line
            options: {
                include: function (path, promise) {
                    promise.resolve(nowdoc(function () {/*<<<EOS
<?php

    echo __DIR__;

EOS
*/;})); // jshint ignore:line
                }
            },
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'vendor/producer'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
