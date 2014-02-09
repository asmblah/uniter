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

    describe('PHP Engine magic "__autoload" function statement integration', function () {
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
            'should throw a fatal error if magic __autoload function in global namespace does not take any arguments': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function __autoload() {}
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: __autoload\(\) must take exactly 1 argument$/
                },
                expectedStderr: 'PHP Fatal error: __autoload() must take exactly 1 argument',
                expectedStdout: ''
            },
            'should throw a fatal error if magic __autoload function with non-lower case in global namespace does not take any arguments': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function __autoLOAd() {}
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: __autoload\(\) must take exactly 1 argument$/
                },
                expectedStderr: 'PHP Fatal error: __autoload() must take exactly 1 argument',
                expectedStdout: ''
            },
            'should not throw a fatal error if magic __autoload function in a namespace does not take any arguments': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace MyNamespace;
    function __autoload() {}
EOS
*/) {}),
                expectedResult: null,
                // Note that no error is raised, as the function is not magic if not in the global namespace
                expectedStderr: '',
                expectedStdout: ''
            },
            'should not be called when no class or interface is used': {
                code: util.heredoc(function (/*<<<EOS
<?php
    function __autoload($class) {
        echo 'autoloading';
    }
EOS
*/) {}),
                expectedResult: null,
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
