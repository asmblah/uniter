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

describe('PHP Engine array bridge integration', function () {
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

    describe('exposing as global PHP variables', function () {
        _.each({
            'array with one scalar element': {
                code: nowdoc(function () {/*<<<EOS
<?php
    return $names[0];
EOS
*/;}), // jshint ignore:line
                expose: {
                    'names': ['Fred']
                },
                expectedResult: 'Fred',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'array with one plain object property': {
                code: nowdoc(function () {/*<<<EOS
<?php
    return $orders[0]->amount;
EOS
*/;}), // jshint ignore:line
                expose: {
                    'orders': [{
                        toForceObjectCast: function () {},
                        'amount': 28
                    }]
                },
                expectedResult: 28,
                expectedResultType: 'int',
                expectedStderr: '',
                expectedStdout: ''
            }
        }, function (scenario) {
            check(scenario);
        });
    });
});
