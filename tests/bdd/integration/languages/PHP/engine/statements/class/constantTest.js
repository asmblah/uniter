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
    engineTools = require('../../tools'),
    nowdoc = require('nowdoc'),
    phpTools = require('../../../tools');

describe('PHP Engine class statement constant integration', function () {
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
        'defining class constant with string value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Stuff {
        const CATEGORY = 'Misc';
    }

    return Stuff::CATEGORY;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Misc',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'defining class constant with integer value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Stuff {
        const RANDOM = 3546;
    }

    return Stuff::RANDOM;
EOS
*/;}), // jshint ignore:line
            expectedResult: 3546,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'reading class constant from a child class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Parent {
        const MYVAL = 4;
    }

    class Child extends Parent {}

    return Child::MYVAL;
EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'overriding class constant in child class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Parent {
        const MYVAL = 4;
    }

    class Child extends Parent {
        const MYVAL = 7;
    }

    return Child::MYVAL;
EOS
*/;}), // jshint ignore:line
            expectedResult: 7,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
