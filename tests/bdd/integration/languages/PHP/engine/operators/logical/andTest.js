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

describe('PHP Engine logical And "<value> && <value>" operator integration', function () {
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
        'logical And of true and true': {
            code: nowdoc(function () {/*<<<EOS
<?php
return true && true;
EOS
*/;}), // jshint ignore:line
            expectedResult: true,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: ''
        },
        'logical And of false and false': {
            code: nowdoc(function () {/*<<<EOS
<?php
return false && false;
EOS
*/;}), // jshint ignore:line
            expectedResult: false,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: ''
        },
        'logical And of true and false': {
            code: nowdoc(function () {/*<<<EOS
<?php
return true && false;
EOS
*/;}), // jshint ignore:line
            expectedResult: false,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: ''
        },
        'logical And of zero and true': {
            code: nowdoc(function () {/*<<<EOS
<?php
return 0 && true;
EOS
*/;}), // jshint ignore:line
            expectedResult: false,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: ''
        },
        'logical And of 1 and 4': {
            code: nowdoc(function () {/*<<<EOS
<?php
return 1 && 4;
EOS
*/;}), // jshint ignore:line
            expectedResult: true,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: ''
        },
        'logical And of falsy and truthy values': {
            code: nowdoc(function () {/*<<<EOS
<?php
function falsy() {
    print 'falsy';
    return false;
}
function truthy() {
    print 'truthy';
    return true;
}
return falsy() && truthy();
EOS
*/;}), // jshint ignore:line
            expectedResult: false,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: 'falsy'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
