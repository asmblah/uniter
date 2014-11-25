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

    describe('PHP Engine preg_match() builtin function integration', function () {
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
            'simple match of single character literal regex with string': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $result = preg_match('/a/i', 'a', $matches);

    var_dump($matches);

    return $result;
EOS
*/) {}),
                expectedResult: 1,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  string(1) "a"
}

EOS
*/) {})
            },
            'simple match of single character literal regex with string, with $matches not specified': {
                code: util.heredoc(function (/*<<<EOS
<?php
    return preg_match('/a/i', 'a');
EOS
*/) {}),
                expectedResult: 1,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'simple match of single character literal regex with non-matching string': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $result = preg_match('/a/i', 'b', $matches);

    var_dump($matches);

    return $result;
EOS
*/) {}),
                expectedResult: 0,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(0) {
}

EOS
*/) {})
            },
            'simple match of regex with anchors and literals with capturing groups': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $result = preg_match('/^(a)b(c)$/', 'abc', $matches);

    var_dump($matches);

    return $result;
EOS
*/) {}),
                expectedResult: 1,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(3) {
  [0]=>
  string(3) "abc"
  [1]=>
  string(1) "a"
  [2]=>
  string(1) "c"
}

EOS
*/) {})
            },
            'simple match of regex with literal in named capturing group': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $result = preg_match('/^(?<res>a)b$/', 'ab', $matches);

    var_dump($matches);

    return $result;
EOS
*/) {}),
                expectedResult: 1,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(3) {
  [0]=>
  string(2) "ab"
  ["res"]=>
  string(1) "a"
  [1]=>
  string(1) "a"
}

EOS
*/) {})
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
