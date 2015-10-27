/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    engineTools = require('../tools'),
    nowdoc = require('nowdoc'),
    phpTools = require('../../tools');

describe('PHP Engine switch statement integration', function () {
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
        'empty switch statement with no cases': {
            code: nowdoc(function () {/*<<<EOS
<?php
    switch (null) {}

    echo 'done';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'done'
        },
        'switch statement with no cases - still check that expression is evaluated': {
            code: nowdoc(function () {/*<<<EOS
<?php
    switch ($a = 21) {}

    echo 'a is ' . $a;
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'a is 21'
        },
        'switch statement with one matched and one unmatched case': {
            code: nowdoc(function () {/*<<<EOS
<?php
    switch (7) {
    case 6:
        echo 'nope, six';
    case 7:
        echo 'yep, seven';
    }

    echo ' - done';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'yep, seven - done'
        },
        'switch statement with one matched (with break) and two unmatched cases': {
            code: nowdoc(function () {/*<<<EOS
<?php
    switch (7) {
    case 6:
        echo 'nope, six';
    case 7:
        echo 'yep, seven';
        break;
    case 8:
        echo 'nope, eight';
    }

    echo ' - done';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'yep, seven - done'
        },
        'switch statement with deliberate fallthrough': {
            code: nowdoc(function () {/*<<<EOS
<?php
    switch (7) {
    case 6:
        echo 'nope, six';
    case 7:
        echo 'yep, seven - ';
    case 8:
        echo 'yep, eight';
    }

    echo ' - done';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'yep, seven - yep, eight - done'
        },
        'nested switch with break should only break out of the inner switch': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $done = true;

    echo 'first';

    switch (4) {
    case 4:
        echo 'second';

        switch ($done) {
        case true:
            echo 'third';
            break;
        case false:
            echo 'fourth';
        }

        echo 'fifth';
    }

    echo 'sixth';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'firstsecondthirdfifthsixth'
        },
        'nested switch with continue should only "break" out of the inner switch (continue is identical to break)': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $done = true;

    echo 'first';

    switch (4) {
    case 4:
        echo 'second';

        switch ($done) {
        case true:
            echo 'third';
            continue;
        case false:
            echo 'fourth';
        }

        echo 'fifth';
    }

    echo 'sixth';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'firstsecondthirdfifthsixth'
        },
        'switch with one unmatched case and "default" case': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $done = true;

    echo 'first';

    switch (3) {
    case 4:
        echo 'second';

        break;
    default:
        echo 'third';
    }

    echo 'fourth';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'firstthirdfourth'
        },
        'switch with two unmatched cases but "default" case falling through to unmatched one': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $done = true;

    echo 'first';

    switch (3) {
    case 4:
        echo 'second';

        break;
    default:
    case 5:
        echo 'third';
    }

    echo 'fourth';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'firstthirdfourth'
        },
        'breaking out of nested switch and its parent with "break"': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $done = true;

    echo 'first';

    switch (2) {
    case 2:
        echo 'second';

        switch (3) {
        case 3:
            echo 'third';
            break 2;
        case 4:
            echo 'fourth';
        }

        echo 'fifth';

        break;
    }

    echo 'sixth';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'firstsecondthirdsixth'
        },
        'breaking out of nested switch and its parent with "continue"': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $done = true;

    echo 'first';

    switch (2) {
    case 2:
        echo 'second';

        switch (3) {
        case 3:
            echo 'third';
            continue 2;
        case 4:
            echo 'fourth';
        }

        echo 'fifth';

        break;
    }

    echo 'sixth';
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'firstsecondthirdsixth'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
