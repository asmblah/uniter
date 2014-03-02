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
    'js/Exception'
], function (
    engineTools,
    phpTools,
    util,
    Exception
) {
    'use strict';

    describe('PHP Engine include(...) expression integration', function () {
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
            'including a file where include transport resolves promise with empty string': {
                code: util.heredoc(function (/*<<<EOS
<?php
    include 'test_file.php';

EOS
*/) {}),
                options: {
                    include: function (path, promise) {
                        promise.resolve('');
                    }
                },
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            'including a file where no include transport is specified': {
                code: util.heredoc(function (/*<<<EOS
<?php
    include 'test_file.php';

EOS
*/) {}),
                expectedException: {
                    instanceOf: Exception,
                    match: /^include\(\) :: No "include" transport is available for loading the module\.$/
                },
                expectedStderr: '',
                expectedStdout: ''
            },
            'including a file where include transport resolves promise with code that just contains inline HTML': {
                code: util.heredoc(function (/*<<<EOS
<?php
    include 'print_hello_world.php';

EOS
*/) {}),
                options: {
                    include: function (path, promise) {
                        // Note that the path is passed back for testing
                        promise.resolve('hello world from ' + path + '!');
                    }
                },
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'hello world from print_hello_world.php!'
            },
            'including a file where include transport resolves promise with code that contains PHP code to echo a string': {
                code: util.heredoc(function (/*<<<EOS
<?php
    include 'print_hello.php';

EOS
*/) {}),
                options: {
                    include: function (path, promise) {
                        // Note that the path is passed back for testing
                        promise.resolve('<?php echo "hello from ' + path + '!";');
                    }
                },
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'hello from print_hello.php!'
            },
            'including a file where include transport resolves promise with code that returns a string': {
                code: util.heredoc(function (/*<<<EOS
<?php
    print 'and ' . (include 'print_hello.php') . '!';

EOS
*/) {}),
                options: {
                    include: function (path, promise) {
                        // Note that the path is passed back for testing
                        promise.resolve('<?php return "welcome back";');
                    }
                },
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'and welcome back!'
            },
            'including a file where include transport rejects promise to indicate module "i_do_not_exist.php" cannot be loaded': {
                code: util.heredoc(function (/*<<<EOS
<?php
    print 'and ' . (include 'i_do_not_exist.php') . '!';

    echo 'Done';
EOS
*/) {}),
                options: {
                    include: function (path, promise) {
                        promise.reject();
                    }
                },
                expectedResult: null,
                expectedStderr: util.heredoc(function (/*<<<EOS
PHP Warning: include(i_do_not_exist.php): failed to open stream: No such file or directory
PHP Warning: include(): Failed opening 'i_do_not_exist.php' for inclusion

EOS
*/) {}),
                expectedStdout: 'and !Done'
            },
            'including a file where include transport rejects promise to indicate module "i_also_do_not_exist.php" cannot be loaded': {
                code: util.heredoc(function (/*<<<EOS
<?php
    print 'and ' . (include 'i_also_do_not_exist.php') . '!';

    echo 'Done';
EOS
*/) {}),
                options: {
                    include: function (path, promise) {
                        promise.reject();
                    }
                },
                expectedResult: null,
                expectedStderr: util.heredoc(function (/*<<<EOS
PHP Warning: include(i_also_do_not_exist.php): failed to open stream: No such file or directory
PHP Warning: include(): Failed opening 'i_also_do_not_exist.php' for inclusion

EOS
*/) {}),
                // Note that the 'Done' echo following the include must be executed, this is only a warning
                expectedStdout: 'and !Done'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
