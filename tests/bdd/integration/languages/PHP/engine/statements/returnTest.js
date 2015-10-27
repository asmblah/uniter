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
    phpTools = require('../../tools');

describe('PHP Engine return statement integration', function () {
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

    _.each([
        {
            // Simple function call returning a number
            code: '<?php function get_seven() { return 7; } echo get_seven();',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '7'
        }
    ], function (scenario) {
        check(scenario);
    });
});
