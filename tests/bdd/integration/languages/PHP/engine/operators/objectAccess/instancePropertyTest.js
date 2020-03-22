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

describe('PHP Engine object access operator "->" instance property integration', function () {
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
        'setting previously undefined property of object of stdClass': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $object = new stdClass;

    $object->aProperty = 21;

    var_dump($object);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (1) {
  ["aProperty"]=>
  int(21)
}

EOS
*/;}) // jshint ignore:line
        },
        'reading undefined property of object of stdClass': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $object = new stdClass;

    var_dump($object->anUndefinedProperty);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: 'PHP Notice:  Undefined property: stdClass::$anUndefinedProperty in /path/to/my_module.php on line 4\n',
            expectedStdout: '\nNotice: Undefined property: stdClass::$anUndefinedProperty in /path/to/my_module.php on line 4\nNULL\n'
        },
        'setting dynamically referenced property of object with expression for key': {
            code: nowdoc(function () {/*<<<EOS
<?php
    $object = new stdClass;
    $propPrefix = 'my';

    $object->{$propPrefix . 'Name'} = 'Fred';

    var_dump($object);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (1) {
  ["myName"]=>
  string(4) "Fred"
}

EOS
*/;}) // jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
