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

describe('PHP Engine class statement interface "implements" integration', function () {
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
        'creating instance of class that implements empty interface': {
            code: nowdoc(function () {/*<<<EOS
<?php
    interface DoesNothing {}

    class Thing implements DoesNothing {
        public function getOK() {
            return 'ok';
        }
    }

    $object = new Thing();

    return $object->getOK();
EOS
*/;}), // jshint ignore:line
            expectedResult: 'ok',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'reading constant from interface implemented by class, where interface occurs after class in module': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth implements Planet {}

    interface Planet {
        const SHAPE = 'sphere';
    }

    return Earth::SHAPE;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'sphere',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'reading constant from second interface implemented by class, where interface occurs after class in module': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Earth implements Habitable, Planet {}

    interface Habitable {}

    interface Planet {
        const SHAPE = 'sphere';
    }

    return Earth::SHAPE;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'sphere',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
