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

describe('PHP Engine filesystem builtin constants integration', function () {
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

    describe('DIRECTORY_SEPARATOR', function () {
        _.each({
            'should be a forward-slash': {
                code: '<?php return DIRECTORY_SEPARATOR;',
                expectedResult: '/',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'should be case-sensitive': {
                code: '<?php return Directory_Separator;',
                expectedResult: 'Directory_Separator',
                expectedResultType: 'string',
                expectedStderr: nowdoc(function () {/*<<<EOS
PHP Warning:  Use of undefined constant Directory_Separator - assumed 'Directory_Separator' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 1

EOS
*/;}), // jshint ignore:line
                expectedStdout: nowdoc(function () {/*<<<EOS

Warning: Use of undefined constant Directory_Separator - assumed 'Directory_Separator' (this will throw an Error in a future version of PHP) in /path/to/my_module.php on line 1

EOS
*/;}) // jshint ignore:line
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
