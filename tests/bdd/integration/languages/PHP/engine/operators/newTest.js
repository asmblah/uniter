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

    describe('PHP Engine "new <class>" operator integration', function () {
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
            'creating instance of class with no argument brackets': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Test {}

    $object = new Test;

    var_dump($object);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/) {})
            },
            'creating instance of class with argument brackets but no arguments': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Test {}

    $object = new Test();

    var_dump($object);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(Test)#1 (0) {
}

EOS
*/) {})
            },
            'creating instance of class that does not exist with no argument brackets': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $object = new IDontExist;

    var_dump($object);
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Class \'IDontExist\' not found$/
                },
                expectedStderr: 'PHP Fatal error: Class \'IDontExist\' not found',
                expectedStdout: ''
            }
        }, function (scenario) {
            check(scenario);
        });
    });
});
