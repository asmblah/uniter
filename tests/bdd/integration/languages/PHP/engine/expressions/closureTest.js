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
            },
            'self-executed closure that prints the bound var and the string passed to it, no parentheses': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $prefix = 'Hello and ';

    function ($message) use ($prefix) {
        echo $prefix . $message;
    }('welcome!');

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'Hello and welcome!'
            },
            // Check that when passed by value, original variable in parent scope is not modified
            'self-executed closure that modifies its local copy of the bound var (by value), no parentheses': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $result = 4;

    function () use ($result) {
        $result = 7;
    }();

    return $result;

EOS
*/) {}),
                expectedResult: 4,
                expectedStderr: '',
                expectedStdout: ''
            },
            // Check that when passed by reference, original variable in parent scope is modified
            'self-executed closure that modifies the bound var (by reference), no parentheses': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $result = 4;

    function () use (&$result) {
        $result = 7;
    }();

    return $result;

EOS
*/) {}),
                expectedResult: 7,
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
