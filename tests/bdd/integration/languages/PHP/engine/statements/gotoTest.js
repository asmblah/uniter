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
            'jumping out of nested if': {
                code: util.heredoc(function (/*<<<EOS
<?php
    echo 'first';

    if (true) {
        echo 'second';
        if (true) {
            echo 'third';
goto end;
            echo 'fourth';
        }
        echo 'fifth';
    }

    echo 'sixth';

end:
    echo 'seventh';
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'firstsecondthirdseventh'
            },
            'jumping out of nested if into nested if': {
                code: util.heredoc(function (/*<<<EOS
<?php
    echo 'first';

    if (true) {
        echo 'second';
        if (true) {
            echo 'third';
goto end;
            echo 'fourth';
        }
        echo 'fifth';
    }

    echo 'sixth';

    if (false) {
        echo 'seventh';
        if (false) {
            echo 'eighth';
end:
            echo 'ninth';
        }
        echo 'tenth';
    }

    echo 'eleventh';
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'firstsecondthirdninthtentheleventh'
            },
            'jumping backward into if': {
                code: util.heredoc(function (/*<<<EOS
<?php
    echo 'first';

    if (0) {
        echo 'second';
backward:
        echo 'third';
        return;
        echo 'fourth';
    }

    echo 'fifth';
    goto backward;
    echo 'sixth';
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'firstfifththird'
            },
            'jumping backward from if into previous if': {
                code: util.heredoc(function (/*<<<EOS
<?php
    echo 'first';

    if (0) {
        echo 'second';
backward:
        echo 'third';
        return;
        echo 'fourth';
    }

    echo 'fifth';
    if (true) {
        echo 'sixth';
        goto backward;
        echo 'seventh';
    }
    echo 'eighth';
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'firstfifthsixththird'
            },
            'reusing label name inside function': {
                code: util.heredoc(function (/*<<<EOS
<?php
    echo 'first';

    function doIt() {
        echo 'second';
        goto myLabel;
        echo 'third';
myLabel:
        echo 'fourth';
    }

    echo 'fifth';
    doIt();
    echo 'sixth';

    goto myLabel;
    echo 'seventh';
myLabel:
    echo 'eighth';

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'firstfifthsecondfourthsixtheighth'
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
