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
    util/*,
    PHPFatalError*/
) {
    'use strict';

    describe('PHP Engine goto statement integration', function () {
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
            'jumping over first echo to second': {
                code: util.heredoc(function (/*<<<EOS
<?php
    goto second;
    echo 'first';

second:
    echo 'second';
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'second'
            },
            'jumping over first echo to second inside if with falsy condition': {
                code: util.heredoc(function (/*<<<EOS
<?php
    goto second;
    echo 'first';

    if (0) {
second:
        echo 'second';
    }
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'second'
            },
            'jumping over first echo to third inside if with falsy condition': {
                code: util.heredoc(function (/*<<<EOS
<?php
    goto second;
    echo 'first';

    if (0) {
        echo 'second';
second:
        echo 'third';
    }
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'third'
            },
            'jumping over first if statement to echo inside second if with falsy condition': {
                code: util.heredoc(function (/*<<<EOS
<?php
    goto end;
    echo 'first';

    if (true) {
        echo 'second';
    }

    if (0) {
        echo 'third';
end:
        echo 'fourth';
    }
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'fourth'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
