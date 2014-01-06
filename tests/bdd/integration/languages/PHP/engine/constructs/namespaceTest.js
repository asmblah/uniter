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

    describe('PHP Engine namespace {...} construct integration', function () {
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
            'referring to class in same sub-namespace but using var_dump(...) from global namespace (with fallback; no prefix)': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace SubWhere;

    class Me {}

    $me = new Me;

    var_dump($me);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(SubWhere\Me)#1 (0) {
}

EOS
*/) {})
            },
            'multiple namespace statements, referring to classes from within each namespace': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace There;

    class You {}

    $you = new You;
    var_dump($you);

    namespace Here;

    class Me {}

    $me = new Me;
    var_dump($me);
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(There\You)#1 (0) {
}
object(Here\Me)#2 (0) {
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
