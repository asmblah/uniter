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
    phpCommon = require('phpcommon'),
    phpTools = require('../../../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

describe('PHP Engine str_replace() builtin function integration', function () {
    var engine;

    function check(scenario) {
        beforeEach(function () {
            engine = phpTools.createEngine(scenario.options);
        });

        engineTools.check(function () {
            return {
                engine: engine
            };
        }, scenario);
    }

    _.each({
        'simple replace of string with string': {
            code: '<?php return str_replace("a", "x", "abc");',
            expectedResult: 'xbc',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'replace of array with string': {
            code: '<?php return str_replace(array("a", "c"), "x", "abc");',
            expectedResult: 'xbx',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'replace of array with array': {
            code: '<?php return str_replace(array("a", "c"), array("x", "y"), "abc");',
            expectedResult: 'xby',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'replace of array with array when using variables': {
            code: '<?php $a = "a"; $c = "c"; $x = "x"; $y = "y"; $abc = "abc"; return str_replace(array($a, $c), array($x, $y), $abc);',
            expectedResult: 'xby',
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'replace of array with array, when some replacements are missing': {
            code: '<?php return str_replace(array("a", "b"), array("x"), "abc");',
            expectedResult: 'xc', // `b` is simply discarded
            expectedResultType: 'string',
            expectedStderr: '',
            expectedStdout: ''
        },
        'recording replacement count when string,string and matches 3 times': {
            code: '<?php str_replace("a", "x", "aaabb", $count); return $count;',
            expectedResult: 3,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'recording replacement count when array,array and matches 4 times': {
            code: '<?php str_replace(array("a"), array("x"), "aaaabb", $count); return $count;',
            expectedResult: 4,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        },
        'passing no arguments': {
            code: '<?php return str_replace();',
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Uncaught ArgumentCountError: str_replace\(\) expects at least 3 arguments, 0 given in \/path\/to\/my_module.php on line 1$/
            },
            expectedStderr: nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught ArgumentCountError: str_replace() expects at least 3 arguments, 0 given in /path/to/my_module.php:1
Stack trace:
#0 /path/to/my_module.php(1): str_replace()
#1 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}), // jshint ignore:line
            expectedStdout: nowdoc(function () {/*<<<EOS

Fatal error: Uncaught ArgumentCountError: str_replace() expects at least 3 arguments, 0 given in /path/to/my_module.php:1
Stack trace:
#0 /path/to/my_module.php(1): str_replace()
#1 {main}
  thrown in /path/to/my_module.php on line 1

EOS
*/;}) // jshint ignore:line
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
