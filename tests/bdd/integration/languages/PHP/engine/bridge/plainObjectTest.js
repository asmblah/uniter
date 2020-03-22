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

describe('PHP Engine plain object bridge integration', function () {
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
            'plain object with one scalar string property': {
                code: nowdoc(function () {/*<<<EOS
<?php
    return $me->name;
EOS
*/;}), // jshint ignore:line
                expose: {
                    'me': {
                        toForceObjectCast: function () {},
                        name: 'Dan'
                    }
                },
                expectedResult: 'Dan',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'plain object with one scalar integer property': {
                code: nowdoc(function () {/*<<<EOS
<?php
    return $me->age;
EOS
*/;}), // jshint ignore:line
                expose: {
                    'me': {
                        toForceObjectCast: function () {},
                        age: 23
                    }
                },
                expectedResult: 23,
                expectedResultType: 'int',
                expectedStderr: '',
                expectedStdout: ''
            },
            'plain object with one array property': {
                code: nowdoc(function () {/*<<<EOS
<?php
    return $order->payments[0];
EOS
*/;}), // jshint ignore:line
                expose: {
                    'order': {
                        toForceObjectCast: function () {},
                        'payments': [10, 20]
                    }
                },
                expectedResult: 10,
                expectedResultType: 'int',
                expectedStderr: '',
                expectedStdout: ''
            },
            'plain object with circular reference': {
                code: nowdoc(function () {/*<<<EOS
<?php
    return $order->payments[1];
EOS
*/;}), // jshint ignore:line
                expose: function () {
                    var order = {
                            toForceObjectCast: function () {},
                            'payments': [10, 20]
                        };

                    order.myself = order;

                    return {
                        'order': order
                    };
                },
                expectedResult: 20,
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
});
