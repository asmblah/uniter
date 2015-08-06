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
    'phpcommon',
    '../../../tools',
    'js/util'
], function (
    engineTools,
    phpCommon,
    phpTools,
    util
) {
    'use strict';

    var PHPFatalError = phpCommon.PHPFatalError;

    describe('PHP Engine scope resolution operator "::" constant integratio', function () {
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
            'reading defined class constant from statically specified class name': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Stuff {
        const CATEGORY = 'Misc';
    }

    return Stuff::CATEGORY;
EOS
*/;}), // jshint ignore:line
                expectedResult: 'Misc',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'reading defined class constant from instance variable': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Stuff {
        const TEST = 'cmp';
    }

    $object = new Stuff;

    return $object::TEST;
EOS
*/;}), // jshint ignore:line
                expectedResult: 'cmp',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'attempting to read undefined class constant from statically specified class name': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    class Stuff {}

    return Stuff::THINGS;
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Undefined class constant 'THINGS'$/
                },
                expectedStderr: 'PHP Fatal error: Undefined class constant \'THINGS\'',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
