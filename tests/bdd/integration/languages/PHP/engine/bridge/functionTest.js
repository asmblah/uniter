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
    '../tools',
    '../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine function bridge integration', function () {
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

        describe('exposing via global PHP variables', function () {
            util.each({
                'copying reference to JS object method as a function and calling standalone': {
                    code: util.heredoc(function () {/*<<<EOS
<?php
$aFunc = $tools->add;
return $aFunc(3, 2);
EOS
*/;}), // jshint ignore:line
                    expose: {
                        'tools': {
                            add: function (num1, num2) {
                                return num1 + num2;
                            }
                        }
                    },
                    expectedResult: 5,
                    expectedResultType: 'integer',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'expose a JS function as a PHP global variable': {
                    code: util.heredoc(function () {/*<<<EOS
<?php
$three = 3;
return $add(4, $three);
EOS
*/;}), // jshint ignore:line
                    expose: {
                        'add': function (num1, num2) {
                            return num1 + num2;
                        }
                    },
                    expectedResult: 7,
                    expectedResultType: 'integer',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'passing undefined variable to JS function exposed as PHP global variable': {
                    code: util.heredoc(function () {/*<<<EOS
<?php
return $getIt($result);
EOS
*/;}), // jshint ignore:line
                    expose: {
                        'getIt': function (anArg) {
                            return anArg === null;
                        }
                    },
                    expectedResult: true,
                    expectedResultType: 'boolean',
                    expectedStderr: '',
                    expectedStdout: ''
                }
            }, function (scenario, description) {
                describe(description, function () {
                    check(scenario);
                });
            });
        });
    });
});
