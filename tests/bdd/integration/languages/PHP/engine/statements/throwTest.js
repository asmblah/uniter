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
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    engineTools,
    phpTools,
    util,
    PHPFatalError
) {
    'use strict';

    describe('PHP Engine throw statement integration', function () {
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
            'throwing newly created instance of Exception (unprefixed class path)': {
                code: util.heredoc(function (/*<<<EOS
<?php
    throw new Exception;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Uncaught exception 'Exception'$/
                },
                expectedStderr: 'PHP Fatal error: Uncaught exception \'Exception\'',
                expectedStdout: ''
            },
            'throwing newly created instance of Exception (prefixed class path)': {
                code: util.heredoc(function (/*<<<EOS
<?php
    throw new \Exception;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Uncaught exception 'Exception'$/
                },
                expectedStderr: 'PHP Fatal error: Uncaught exception \'Exception\'',
                expectedStdout: ''
            },
            'throwing newly created instance of Exception child class (unprefixed class path)': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class MyException extends Exception {}

    throw new MyException;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Uncaught exception 'MyException'$/
                },
                expectedStderr: 'PHP Fatal error: Uncaught exception \'MyException\'',
                expectedStdout: ''
            },
            'throwing instance of Exception stored in variable': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $exception = new Exception;

    throw $exception;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Uncaught exception 'Exception'$/
                },
                expectedStderr: 'PHP Fatal error: Uncaught exception \'Exception\'',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
