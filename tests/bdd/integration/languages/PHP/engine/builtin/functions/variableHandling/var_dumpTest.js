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

        util.each([
            {
                value: 'array()',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(0) {
}

EOS
*/) {})
            },
            {
                value: 'array(7)',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  int(7)
}

EOS
*/) {})
            },
            {
                value: 'array(4 => "a")',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [4]=>
  string(1) "a"
}

EOS
*/) {})
            },
            {
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
            {
                value: 'true',
                expectedStdout: 'bool(true)\n'
            },
            {
                value: 'false',
                expectedStdout: 'bool(false)\n'
            },
            {
                value: '2.2',
                expectedStdout: 'float(2.2)\n'
            },
            {
                value: '3',
                expectedStdout: 'int(3)\n'
            },
            {
                value: 'null',
                expectedStdout: 'NULL\n'
            },
            {
                value: 'new stdClass',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(stdClass)#1 (0) {
}

EOS
*/) {})
            },
            {
                value: 'new stdClass; $value->prop = 1',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(stdClass)#1 (1) {
  ["prop"]=>
  int(1)
}

EOS
*/) {})
            },
            {
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
            {
                value: '"world"',
                expectedStdout: 'string(5) "world"\n'
            }
        ], function (scenario) {
            check({
                code: '<?php $value = ' + scenario.value + '; var_dump($value);',
                expectedStderr: scenario.expectedStderr || '',
                expectedStdout: scenario.expectedStdout
            });
        });
    });
});
