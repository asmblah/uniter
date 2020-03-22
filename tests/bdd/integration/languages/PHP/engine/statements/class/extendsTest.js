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

    _.each({
        'empty class that extends a previously defined empty class': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {}

    class Human extends Animal {}

    var_dump(new Human);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Human)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'calling inherited public method as instance method': {
            code: nowdoc(function () {/*<<<EOS
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
*/;}), // jshint ignore:line
            expectedResult: 24,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'calling inherited public method as static method': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public function getAge() {
            return 24;
        }
    }

    class Human extends Animal {}

    return Human::getAge();
EOS
*/;}), // jshint ignore:line
            expectedResult: 24,
            expectedResultType: 'int',
            // Note that the method's actual owner class Animal is referred to
            expectedStderr: 'PHP Strict standards:  Non-static method Animal::getAge() should not be called statically in /path/to/my_module.php on line 10\n',
            expectedStdout: '\nStrict standards: Non-static method Animal::getAge() should not be called statically in /path/to/my_module.php on line 10\n'
        },
        'reading inherited public property': {
            code: nowdoc(function () {/*<<<EOS
<?php
    class Animal {
        public $warmBlooded = true;
    }

    class Human extends Animal {}

    $human = new Human;
    return $human->warmBlooded;
EOS
*/;}), // jshint ignore:line
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
