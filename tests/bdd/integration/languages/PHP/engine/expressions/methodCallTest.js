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
            },
            'call to undefined method of object when class is in global namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Test {}

    $object = new Test;

    var_dump($object->iDontExist());
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined method Test::iDontExist\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined method Test::iDontExist()',
                expectedStdout: ''
            },
            'call to undefined method of object when class is in a namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace MyStuff;

    class Test {}

    $object = new Test;

    var_dump($object->iDontExist());
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Call to undefined method MyStuff\\Test::iDontExist\(\)$/
                },
                expectedStderr: 'PHP Fatal error: Call to undefined method MyStuff\\Test::iDontExist()',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
