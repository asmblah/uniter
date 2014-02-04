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

    describe('PHP Engine class statement "extends" integration', function () {
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
            'empty class that extends a previously defined empty class': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {}

    class Human extends Animal {}

    var_dump(new Human);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(Human)#1 (0) {
}

EOS
*/) {})
            },
            'calling inherited public method': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public function getAge() {
            return 24;
        }
    }

    class Human extends Animal {}

    $human = new Human;
    return $human->getAge();
EOS
*/) {}),
                expectedResult: 24,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'reading inherited public property': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        public $warmBlooded = true;
    }

    class Human extends Animal {}

    $human = new Human;
    return $human->warmBlooded;
EOS
*/) {}),
                expectedResult: true,
                expectedResultType: 'boolean',
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
