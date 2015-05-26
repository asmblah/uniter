/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    '../../tools',
    '../../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

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

        util.each({
            'logical And of true and true': {
                code: util.heredoc(function () {/*<<<EOS
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
                code: util.heredoc(function () {/*<<<EOS
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
                code: util.heredoc(function () {/*<<<EOS
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
                code: util.heredoc(function () {/*<<<EOS
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
                code: util.heredoc(function () {/*<<<EOS
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
                code: util.heredoc(function () {/*<<<EOS
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
});
