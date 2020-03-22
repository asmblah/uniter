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

describe('PHP Engine function bridge integration', function () {
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

    describe('exposing via global PHP variables', function () {
        _.each({
            'copying reference to JS object method as a function and calling standalone': {
                code: nowdoc(function () {/*<<<EOS
<?php
$aFunc = $tools->add;
return $aFunc(3, 2);
EOS
*/;}), // jshint ignore:line
                expose: {
                    'tools': {
                        add: function (num1, num2) {
                            return num1 + num2;
                        }
                    }
                },
                expectedResult: 5,
                expectedResultType: 'int',
                expectedStderr: '',
                expectedStdout: ''
            },
            'expose a JS function as a PHP global variable': {
                code: nowdoc(function () {/*<<<EOS
<?php
$three = 3;
return $add(4, $three);
EOS
*/;}), // jshint ignore:line
                expose: {
                    'add': function (num1, num2) {
                        return num1 + num2;
                    }
                },
                expectedResult: 7,
                expectedResultType: 'int',
                expectedStderr: '',
                expectedStdout: ''
            },
            'passing undefined variable to JS function exposed as PHP global variable': {
                code: nowdoc(function () {/*<<<EOS
<?php
return $getIt($result);
EOS
*/;}), // jshint ignore:line
                expose: {
                    'getIt': function (anArg) {
                        return anArg === null;
                    }
                },
                expectedResult: true,
                expectedResultType: 'boolean',
                // Notice should be displayed because JSObject-wrapped functions
                // always auto-unwrap any arguments, at which point the variable will be read
                expectedStderr: 'PHP Notice:  Undefined variable: result in /path/to/my_module.php on line 2\n',
                expectedStdout: '\nNotice: Undefined variable: result in /path/to/my_module.php on line 2\n'
            },
            'calling PHP closure referencing "this" object from JS land': {
                code: nowdoc(function () {/*<<<EOS
<?php
class Stuff {
    public function getIt() {
        return function () {
            return $this->value;
        };
    }
}

$stuff = new Stuff();

$setCallback($stuff->getIt());

return $getValue();
EOS
*/;}), // jshint ignore:line
                expose: function () {
                    var callback;

                    return {
                        getValue: function () {
                            return engine.createFFIResult(function () {
                                throw new Error('Should have been handled asynchronously');
                            }, function () {
                                return callback.call({value: 22});
                            });
                        },
                        setCallback: function (newCallback) {
                            callback = newCallback;
                        }
                    };
                },
                expectedResult: 22,
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
