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

    describe('PHP Engine __LINE__ magic constant expression integration', function () {
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
            'capturing line number when opening tag and __LINE__ are both on first line': {
                code: util.heredoc(function (/*<<<EOS
<?php echo __LINE__;

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: '1'
            },
            'capturing line number when opening tag is on first but __LINE__ is on second line': {
                code: util.heredoc(function (/*<<<EOS
<?php
    echo __LINE__;

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: '2'
            },
            'capturing line number in required module': {
                code: util.heredoc(function (/*<<<EOS
<?php
    require_once 'get_line.php';

EOS
*/) {}),
                options: {
                    include: function (path, promise) {
                        promise.resolve(util.heredoc(function (/*<<<EOS
<?php

    echo __LINE__;

EOS
*/) {}));
                    }
                },
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: '3'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
