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

describe('PHP Engine if statement integration', function () {
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
        'simple if statement with true condition that echoes a result': {
            code: '<?php if (true) { echo "hello"; } else { echo "goodbye"; }',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'hello'
        },
        'simple if statement with false condition that echoes a result': {
            code: '<?php if (false) { echo "hello"; } else { echo "goodbye"; }',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'goodbye'
        },
        'if statement with elseif when first conditional is true and second is false': {
            code: '<?php if (true) { echo "first"; } elseif (false) { echo "second"; }',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'first'
        },
        'if statement with elseif when first conditional is true and second is true': {
            code: '<?php if (true) { echo "first"; } elseif (true) { echo "second"; }',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'first'
        },
        'if statement with elseif when first conditional is false and second is true': {
            code: '<?php if (false) { echo "first"; } elseif (true) { echo "second"; }',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'second'
        },
        'if statement with elseif when first conditional is false and second is false': {
            code: '<?php if (false) { echo "first"; } elseif (false) { echo "second"; }',
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
