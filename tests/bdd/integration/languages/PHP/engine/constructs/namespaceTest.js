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
    engineTools = require('../tools'),
    nowdoc = require('nowdoc'),
    phpTools = require('../../tools');

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

    _.each({
        'referring to class in same sub-namespace but using var_dump(...) from global namespace (with fallback; no prefix)': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace SubWhere;

    class Me {}

    $me = new Me;

    var_dump($me);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(SubWhere\Me)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'multiple namespace statements, referring to classes from within each namespace': {
            code: nowdoc(function () {/*<<<EOS
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
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(There\You)#1 (0) {
}
object(Here\Me)#2 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'referring to class in sub-namespace from non-global namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace MyTop\MyMiddle;

    class MyTest {}

    namespace MyTop;

    var_dump(new MyMiddle\MyTest);
EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(MyTop\MyMiddle\MyTest)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'return from non-global namespace': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace There;

    return 7;
EOS
*/;}), // jshint ignore:line
            expectedResult: 7,
            expectedResultType: 'int',
            expectedStderr: '',
            expectedStdout: ''
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
