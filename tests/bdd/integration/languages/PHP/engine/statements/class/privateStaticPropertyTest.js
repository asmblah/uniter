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
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    engineTools,
    phpTools,
    util,
    PHPFatalError
) {
    'use strict';

    describe('PHP Engine class statement private static property integration', function () {
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
            'reading private static property from instance method': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';

        public function getPlanet() {
            return self::$planet;
        }
    }

    return (new Animal())->getPlanet();
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'reading private static property from static method': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';

        public static function getPlanet() {
            return self::$planet;
        }
    }

    return Animal::getPlanet();
EOS
*/) {}),
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'trying to read private static property from outside class': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';
    }

    return (new Animal())::$planet;
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Cannot access private property Animal::\$planet$/
                },
                expectedStderr: 'PHP Fatal error: Cannot access private property Animal::$planet',
                expectedStdout: ''
            },
            'trying to read private static property from instance method of another, unrelated class': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';
    }

    class Wall {
        public function getPlanet() {
            return Animal::$planet;
        }
    }

    return (new Wall())->getPlanet();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Cannot access private property Animal::\$planet$/
                },
                expectedStderr: 'PHP Fatal error: Cannot access private property Animal::$planet',
                expectedStdout: ''
            },
            'trying to read private static property from instance method of derived class': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Animal {
        private static $planet = 'Earth';
    }

    class Chicken extends Animal {
        public function getPlanet() {
            return Animal::$planet;
        }
    }

    return (new Chicken())->getPlanet();
EOS
*/) {}),
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Cannot access private property Animal::\$planet$/
                },
                expectedStderr: 'PHP Fatal error: Cannot access private property Animal::$planet',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
