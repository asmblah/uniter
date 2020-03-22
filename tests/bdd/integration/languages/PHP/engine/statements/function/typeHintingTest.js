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

describe('PHP Engine function statement type hinting integration', function () {
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
        'passing array to method argument type hinted as array': {
            code: nowdoc(function () {/*<<<EOS
<?php
    function sum(array $numbers) {
        $total = 0;

        foreach ($numbers as $number) {
            $total = $total + $number;
        }

        return $total;
    }

    return sum(array(3, 5, 1));
EOS
*/;}), // jshint ignore:line
            expectedResult: 9,
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
