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

describe('PHP Engine __FILE__ magic constant expression integration', function () {
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
        'capturing current file from initial program code': {
            code: nowdoc(function () {/*<<<EOS
<?php echo __FILE__;

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '/path/to/my_module.php'
        },
        'capturing current file in required module': {
            code: nowdoc(function () {/*<<<EOS
<?php
    require_once 'get_file.php';

EOS
*/;}), // jshint ignore:line
            options: {
                include: function (path, promise) {
                    promise.resolve(nowdoc(function () {/*<<<EOS
<?php

    echo __FILE__;

EOS
*/;})); // jshint ignore:line
                }
            },
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'get_file.php'
        },
        // Ensure the state is not shared between main program and required module
        'capturing current file in main program before and after required module': {
            code: nowdoc(function () {/*<<<EOS
<?php
    echo __FILE__ . PHP_EOL;
    require_once 'get_file.php';
    echo __FILE__ . PHP_EOL;

EOS
*/;}), // jshint ignore:line
            options: {
                include: function (path, promise) {
                    promise.resolve(nowdoc(function () {/*<<<EOS
<?php

    echo __FILE__ . PHP_EOL;

EOS
*/;})); // jshint ignore:line
                }
            },
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: '/path/to/my_module.php\nget_file.php\n/path/to/my_module.php\n'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
