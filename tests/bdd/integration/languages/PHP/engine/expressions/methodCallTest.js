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
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine method call expression integration', function () {
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
            'call to statically referenced instance method returning value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Test {
        public function getIt() {
            return 7;
        }
    }

    $object = new Test;

    return $object->getIt();
EOS
*/) {}),
                expectedResult: 7,
                expectedStderr: '',
                expectedStdout: ''
            },
            'call to statically referenced instance method with argument and returning value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Test {
        public function addOne($number) {
            return $number + 1;
        }
    }

    $object = new Test;

    return $object->addOne(3);
EOS
*/) {}),
                expectedResult: 4,
                expectedStderr: '',
                expectedStdout: ''
            },
            'call to dynamically referenced instance method returning value': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Test {
        public function getIt() {
            return 6;
        }
    }

    $object = new Test;
    $methodName = 'getIt';

    return $object->$methodName();
EOS
*/) {}),
                expectedResult: 6,
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
