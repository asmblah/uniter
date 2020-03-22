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

describe('PHP Engine interface statement constant integration', function () {
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
        'defining interface constant with string value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    interface Stuff {
        const CATEGORY = 'Misc';
    }

    return Stuff::CATEGORY;
EOS
*/;}), // jshint ignore:line
            expectedResult: 'Misc',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'defining interface constant with integer value': {
            code: nowdoc(function () {/*<<<EOS
<?php
    interface Stuff {
        const RANDOM = 3546;
    }

    return Stuff::RANDOM;
EOS
*/;}), // jshint ignore:line
            expectedResult: 3546,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'defining interface constant referencing another using "self::"': {
            code: nowdoc(function () {/*<<<EOS
<?php
    interface Stuff {
        const FIRST = 5;
        const SECOND = self::FIRST;
    }

    return Stuff::SECOND;
EOS
*/;}), // jshint ignore:line
            expectedResult: 5,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'reading interface constant from a child interface': {
            code: nowdoc(function () {/*<<<EOS
<?php
    interface Parent {
        const MYVAL = 4;
    }

    interface Child extends Parent {}

    return Child::MYVAL;
EOS
*/;}), // jshint ignore:line
            expectedResult: 4,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'attempting to define an instance variable for an interface': {
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
        },
        'attempting to define a static variable for an interface': {
            code: nowdoc(function () {/*<<<EOS
<?php
    interface Mine {
        private static $yours = false;
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
