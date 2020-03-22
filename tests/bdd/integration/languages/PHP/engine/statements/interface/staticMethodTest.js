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
    phpCommon = require('phpcommon'),
    phpTools = require('../../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

describe('PHP Engine interface statement static method integration', function () {
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
        'attempting to define an static method with a body for an interface': {
            code: nowdoc(function () {/*<<<EOS
<?php
    interface Mine {
        private static function getYours() {
            return true;
        }
    }
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Interface function Mine::getYours\(\) cannot contain body in \/path\/to\/my_module\.php on line 3$/
            },
            expectedStderr: 'PHP Fatal error:  Interface function Mine::getYours() cannot contain body in /path/to/my_module.php on line 3\n',
            expectedStdout: '\nFatal error: Interface function Mine::getYours() cannot contain body in /path/to/my_module.php on line 3\n'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
