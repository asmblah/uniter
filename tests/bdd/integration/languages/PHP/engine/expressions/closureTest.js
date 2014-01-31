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

    describe('PHP Engine closure expression integration', function () {
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
            'empty closure in void context, not called': {
                code: '<?php function () {};',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            'closure that would print a string but is in void context, not called': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function () {
        echo 'nope';
    };

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            'self-executed closure that just prints a string, no parentheses': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function () {
        echo 'good';
    }();

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'good'
            },
            'self-executed closure that prints the string passed to it, no parentheses': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function ($message) {
        echo $message;
    }('welcome!');

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'welcome!'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
