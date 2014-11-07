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

        util.each({
            'creating instance of class that implements empty interface': {
                code: util.heredoc(function (/*<<<EOS
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
*/) {}),
                expectedResult: 'ok',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'reading constant from interface implemented by class, where interface occurs after class in module': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Earth implements Planet {}

    interface Planet {
        const SHAPE = 'sphere';
    }

    return Earth::SHAPE;
EOS
*/) {}),
                expectedResult: 'sphere',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'reading constant from second interface implemented by class, where interface occurs after class in module': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Earth implements Habitable, Planet {}

    interface Habitable {}

    interface Planet {
        const SHAPE = 'sphere';
    }

    return Earth::SHAPE;
EOS
*/) {}),
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
});
