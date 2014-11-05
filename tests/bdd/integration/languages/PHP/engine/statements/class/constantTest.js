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
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

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

        util.each({
            'defining class constant with string value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Stuff {
        const CATEGORY = 'Misc';
    }

    return Stuff::CATEGORY;
EOS
*/) {}),
                expectedResult: 'Misc',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'defining class constant with integer value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Stuff {
        const RANDOM = 3546;
    }

    return Stuff::RANDOM;
EOS
*/) {}),
                expectedResult: 3546,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'reading class constant from a child class': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Parent {
        const MYVAL = 4;
    }

    class Child extends Parent {}

    return Child::MYVAL;
EOS
*/) {}),
                expectedResult: 4,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'overriding class constant in child class': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Parent {
        const MYVAL = 4;
    }

    class Child extends Parent {
        const MYVAL = 7;
    }

    return Child::MYVAL;
EOS
*/) {}),
                expectedResult: 7,
                expectedResultType: 'integer',
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
