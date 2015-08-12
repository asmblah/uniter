/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('lodash'),
    engineTools = require('../tools'),
    nowdoc = require('nowdoc'),
    phpCommon = require('phpcommon'),
    phpTools = require('../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

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

    _.each({
        'throwing newly created instance of Exception (unprefixed class path)': {
            code: nowdoc(function () {/*<<<EOS
<?php
    throw new Exception;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught exception 'Exception'$/
            },
            expectedStderr: 'PHP Fatal error: Uncaught exception \'Exception\'',
            expectedStdout: ''
        },
        'throwing newly created instance of Exception (prefixed class path)': {
            code: nowdoc(function () {/*<<<EOS
<?php
    throw new \Exception;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught exception 'Exception'$/
            },
            expectedStderr: 'PHP Fatal error: Uncaught exception \'Exception\'',
            expectedStdout: ''
        },
        'throwing newly created instance of Exception child class (unprefixed class path)': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class MyException extends Exception {}

    throw new MyException;
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught exception 'MyException'$/
            },
            expectedStderr: 'PHP Fatal error: Uncaught exception \'MyException\'',
            expectedStdout: ''
        },
        'throwing instance of Exception stored in variable': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $exception = new Exception;

    throw $exception;
EOS
*/;}), // jshint ignore:line
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
