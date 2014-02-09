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

    describe('PHP Engine function call operator integration', function () {
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
            'calling function in global namespace with prefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function printIt() {
        echo 'it';
    }

    \printIt();
EOS
*/) {}),
                expectedStderr: '',
                expectedStdout: 'it'
            },
            'calling function in another deep namespace with prefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace MyStuff\Tools;

    function printIt() {
        echo 'it';
    }

    namespace MyProgram;

    \MyStuff\Tools\printIt();
EOS
*/) {}),
                expectedStderr: '',
                expectedStdout: 'it'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
