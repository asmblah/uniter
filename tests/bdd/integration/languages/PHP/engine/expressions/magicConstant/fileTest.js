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

    describe('PHP Engine __FILE__ magic constant expression integration', function () {
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
            'capturing current file from initial program code': {
                code: util.heredoc(function (/*<<<EOS
<?php echo __FILE__;

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: '(program)'
            },
            'capturing current file in required module': {
                code: util.heredoc(function (/*<<<EOS
<?php
    require_once 'get_file.php';

EOS
*/) {}),
                options: {
                    include: function (path, promise) {
                        promise.resolve(util.heredoc(function (/*<<<EOS
<?php

    echo __FILE__;

EOS
*/) {}));
                    }
                },
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'get_file.php'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
