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
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    engineTools,
    phpTools,
    util,
    PHPFatalError
) {
    'use strict';

    describe('PHP Engine interface statement constant integration', function () {
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
            'defining interface constant with string value': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    interface Stuff {
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
            'defining interface constant with integer value': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    interface Stuff {
        const RANDOM = 3546;
    }

    return Stuff::RANDOM;
EOS
*/;}), // jshint ignore:line
                expectedResult: 3546,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'defining interface constant referencing another using "self::"': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    interface Stuff {
        const FIRST = 5;
        const SECOND = self::FIRST;
    }

    return Stuff::SECOND;
EOS
*/;}), // jshint ignore:line
                expectedResult: 5,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'reading interface constant from a child interface': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    interface Parent {
        const MYVAL = 4;
    }

    interface Child extends Parent {}

    return Child::MYVAL;
EOS
*/;}), // jshint ignore:line
                expectedResult: 4,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'attempting to define an instance variable for an interface': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    interface Mine {
        private $yours = false;
    }
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Interfaces may not include member variables$/
                },
                expectedStderr: 'PHP Fatal error: Interfaces may not include member variables',
                expectedStdout: ''
            },
            'attempting to define a static variable for an interface': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    interface Mine {
        private static $yours = false;
    }
EOS
*/;}), // jshint ignore:line
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Interfaces may not include member variables$/
                },
                expectedStderr: 'PHP Fatal error: Interfaces may not include member variables',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
