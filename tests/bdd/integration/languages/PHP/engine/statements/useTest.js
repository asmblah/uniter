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
    '../tools',
    '../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine use statement integration', function () {
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
            'simple use for aliasing standard "stdClass" class when in global namespace scope': {
                code: util.heredoc(function (/*<<<EOS
<?php
    use stdClass as EmptyClass;

    var_dump(new EmptyClass);

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(stdClass)#1 (0) {
}

EOS
*/) {})
            },
            'simple use for aliasing standard "stdClass" class when in a specific namespace scope': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace Uniter\Tool;

    use stdClass as EmptyClass;

    var_dump(new EmptyClass);

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(stdClass)#1 (0) {
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
