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
    '../../../tools',
    '../../../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine var_dump() builtin function integration', function () {
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
            'empty array': {
                value: 'array()',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(0) {
}

EOS
*/) {})
            },
            'array with one element with implicit key': {
                value: 'array(7)',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  int(7)
}

EOS
*/) {})
            },
            'array with one element with explicit key': {
                value: 'array(4 => "a")',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [4]=>
  string(1) "a"
}

EOS
*/) {})
            },
            'array with one element with explicit key for subarray value': {
                value: 'array(5 => array(6, 7))',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [5]=>
  array(2) {
    [0]=>
    int(6)
    [1]=>
    int(7)
  }
}

EOS
*/) {})
            },
            'boolean true': {
                value: 'true',
                expectedStdout: 'bool(true)\n'
            },
            'boolean false': {
                value: 'false',
                expectedStdout: 'bool(false)\n'
            },
            'float': {
                value: '2.2',
                expectedStdout: 'float(2.2)\n'
            },
            'integer': {
                value: '3',
                expectedStdout: 'int(3)\n'
            },
            'null': {
                value: 'null',
                expectedStdout: 'NULL\n'
            },
            'empty stdClass instance': {
                value: 'new stdClass',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(stdClass)#1 (0) {
}

EOS
*/) {})
            },
            'stdClass instance with one property': {
                value: 'new stdClass; $value->prop = 1',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(stdClass)#1 (1) {
  ["prop"]=>
  int(1)
}

EOS
*/) {})
            },
            'stdClass instance with one property containing another stdClass instance': {
                value: 'new stdClass; $value->sub = new stdClass; $value->sub->prop = 1',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(stdClass)#1 (1) {
  ["sub"]=>
  object(stdClass)#2 (1) {
    ["prop"]=>
    int(1)
  }
}

EOS
*/) {})
            },
            'string': {
                value: '"world"',
                expectedStdout: 'string(5) "world"\n'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check({
                    code: '<?php $value = ' + scenario.value + '; var_dump($value);',
                    expectedStderr: scenario.expectedStderr || '',
                    expectedStdout: scenario.expectedStdout
                });
            });
        });
    });
});
