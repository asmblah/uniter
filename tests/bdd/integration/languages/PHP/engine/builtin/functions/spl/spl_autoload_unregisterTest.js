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
    engineTools = require('../../../tools'),
    nowdoc = require('nowdoc'),
    phpTools = require('../../../../tools');

describe('PHP Engine spl_autoload_unregister() builtin function integration', function () {
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
        'returns true when function has been registered': {
            code: nowdoc(function () {/*<<<EOS
<?php
function myAutoloader($className) {
}
spl_autoload_register('myAutoloader');
return spl_autoload_unregister('myAutoloader');
EOS
*/;}), // jshint ignore:line
            expectedResult: true,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: ''
        },
        'returns false when function has not been registered': {
            code: nowdoc(function () {/*<<<EOS
<?php
function myAutoloader($className) {
}
return spl_autoload_unregister('myAutoloader');
EOS
*/;}), // jshint ignore:line
            expectedResult: false,
            expectedResultType: 'boolean',
            expectedStderr: '',
            expectedStdout: ''
        },
        'still allows the previous autoload function to be called': {
            code: nowdoc(function () {/*<<<EOS
<?php
function firstAutoloader($className) {
    class MyClass {}
    print 'First: ' . $className;
}
spl_autoload_register('firstAutoloader');
function secondAutoloader($className) {
    class MyClass {}
    print 'Second: ' . $className;
}
spl_autoload_register('secondAutoloader');
spl_autoload_unregister('secondAutoloader');

new MyClass();
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: 'First: MyClass'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
