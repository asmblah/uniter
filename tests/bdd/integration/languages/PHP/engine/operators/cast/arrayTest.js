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
    '../../tools',
    '../../../tools',
    'js/util'/*,
    'languages/PHP/interpreter/Error/Fatal'*/
], function (
    engineTools,
    phpTools,
    util/*,
    PHPFatalError*/
) {
    'use strict';

    describe('PHP Engine array cast "(array) <value>" operator integration', function () {
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
            'cast of empty array to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) array());
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(0) {
}

EOS
*/) {})
            },
            'cast of populated array to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) array('a' => 7));
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  ["a"]=>
  int(7)
}

EOS
*/) {})
            },
            'cast of boolean true to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) true);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  bool(true)
}

EOS
*/) {})
            },
            'cast of boolean false to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) false);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  bool(false)
}

EOS
*/) {})
            },
            'cast of float 2.2 to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) 2.2);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  float(2.2)
}

EOS
*/) {})
            },
            'cast of integer 6 to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) 6);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  int(6)
}

EOS
*/) {})
            },
            'cast of null to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) null);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(0) {
}

EOS
*/) {})
            },
            'cast of empty stdClass instance to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) new stdClass);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(0) {
}

EOS
*/) {})
            },
            'cast of stdClass instance with one property to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = new stdClass;
    $value->prop = 6;

    var_dump((array) $value);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  ["prop"]=>
  int(6)
}

EOS
*/) {})
            },
            'cast of class instance with one public default property to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Test {
        public $name = "Dan";
    }

    var_dump((array) new Test);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  ["name"]=>
  string(3) "Dan"
}

EOS
*/) {})
            },
            'cast of empty string to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) '');
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  string(0) ""
}

EOS
*/) {})
            },
            'cast of non-empty string to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump((array) "Halcyon");
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
array(1) {
  [0]=>
  string(7) "Halcyon"
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
