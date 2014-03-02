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
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine logical Not "! <value>" operator integration', function () {
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
            'logical Not of empty array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!array());
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(true)

EOS
*/) {})
            },
            'logical Not of populated array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!array('a' => 7));
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(false)

EOS
*/) {})
            },
            'logical Not of boolean true': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!true);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(false)

EOS
*/) {})
            },
            'logical Not of boolean false': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!false);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(true)

EOS
*/) {})
            },
            'logical Not of float 0.0': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!0.0);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(true)

EOS
*/) {})
            },
            'logical Not of float 2.2': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!2.2);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(false)

EOS
*/) {})
            },
            'logical Not of integer 0': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!0);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(true)

EOS
*/) {})
            },
            'logical Not of integer 6': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!6);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(false)

EOS
*/) {})
            },
            'logical Not of null': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!null);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(true)

EOS
*/) {})
            },
            'logical Not of empty stdClass instance': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!new stdClass);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(false)

EOS
*/) {})
            },
            'logical Not of stdClass instance with one property': {
                code: util.heredoc(function (/*<<<EOS
<?php
    $value = new stdClass;
    $value->prop = 6;

    var_dump(!$value);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(false)

EOS
*/) {})
            },
            'logical Not of class instance with one public default property': {
                code: util.heredoc(function (/*<<<EOS
<?php
    class Test {
        public $name = "Dan";
    }

    var_dump(!new Test);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(false)

EOS
*/) {})
            },
            'cast of empty string to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!'');
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(true)

EOS
*/) {})
            },
            'cast of non-empty string to array': {
                code: util.heredoc(function (/*<<<EOS
<?php
    var_dump(!'Halcyon');
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
bool(false)

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
