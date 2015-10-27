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

describe('PHP Engine set_include_path() builtin function integration', function () {
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
        'updates the include path': {
            code: nowdoc(function () {/*<<<EOS
<?php
set_include_path('my/first/path:my/second/path');

return get_include_path();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'my/first/path:my/second/path',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'returns the previous include path': {
            code: nowdoc(function () {/*<<<EOS
<?php
set_include_path('my/first/path');
return set_include_path('my/second/path');
EOS
*/;}), // jshint ignore:line
            expectedResult: 'my/first/path',
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
