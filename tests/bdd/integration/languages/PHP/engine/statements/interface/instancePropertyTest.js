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

describe('PHP Engine interface statement instance property integration', function () {
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
        'attempting to define an instance property for an interface': {
            code: nowdoc(function () {/*<<<EOS
<?php
    interface Mine {
        private $yours = false;
    }
EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Interfaces may not include member variables in \/path\/to\/my_module\.php on line 3$/
            },
            expectedStderr: 'PHP Fatal error:  Interfaces may not include member variables in /path/to/my_module.php on line 3\n',
            expectedStdout: '\nFatal error: Interfaces may not include member variables in /path/to/my_module.php on line 3\n'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
