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
            'jumping over unused label': {
                code: util.heredoc(function (/*<<<EOS
<?php
    goto second;

first:
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
            },
            'jumping out of if statement': {
                code: util.heredoc(function (/*<<<EOS
<?php
    echo 'first';

    if (true) {
        echo 'second';
        goto end;
        echo 'third';
    }

    echo 'fourth';

end:
    echo 'fifth';
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'firstsecondfifth'
            },
            'jumping out of first if statement to echo inside second if': {
                code: util.heredoc(function (/*<<<EOS
<?php
    echo 'first';

    if (true) {
        echo 'second';
        goto sixth;
        echo 'third';
    }

    echo 'fourth';

    if (0) {
        echo 'fifth';
sixth:
        echo 'sixth';
    }

    echo 'seventh';
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'firstsecondsixthseventh'
            },
            'jumping into nested if': {
                code: util.heredoc(function (/*<<<EOS
<?php
    echo 'first';
    goto end;

    echo 'second';

    if (0) {
        echo 'third';
        if (0) {
            echo 'fourth';
end:
            echo 'fifth';
        }
        echo 'sixth';
    }

    echo 'seventh';
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'firstfifthsixthseventh'
            },
            'invalid jump into while loop': {
                code: util.heredoc(function (/*<<<EOS
<?php
    goto invalid;

    while (0) {
invalid:
    }
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: 'goto' into loop or switch statement is disallowed$/
                },
                expectedStderr: 'PHP Fatal error: \'goto\' into loop or switch statement is disallowed',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
