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
            'simple use for aliasing standard "stdClass" class when in a specific namespace scope using unprefixed path': {
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
            },
            'use for aliasing class from another namespace when in a specific namespace scope using unprefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace Catalogue\Tool;

    class Drill {}

    namespace Tradesman\Certified\Electrician;

    use Catalogue\Tool\Drill as CatalogueDrill;

    var_dump(new CatalogueDrill);

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(Catalogue\Tool\Drill)#1 (0) {
}

EOS
*/) {})
            },
            'use for aliasing entire other namespace when in a specific namespace scope using unprefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace Catalogue\Tool;
    class Drill {}

    namespace Catalogue\Tool\Wrench;
    class Torque {}

    namespace Tradesman\Certified\Electrician;

    use Catalogue\Tool as CatalogueTool;

    var_dump(new CatalogueTool\Drill);
    var_dump(new CatalogueTool\Wrench\Torque);

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(Catalogue\Tool\Drill)#1 (0) {
}
object(Catalogue\Tool\Wrench\Torque)#2 (0) {
}

EOS
*/) {})
            },
            'simple use for aliasing standard "stdClass" class when in a specific namespace scope using prefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace Uniter\Tool;

    use \stdClass as EmptyClass;

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
            'use for importing another namespace (with implicit alias name) using prefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace Uniter\Tool;
    class Drill {}

    namespace House\Garage;
    use \Uniter\Tool;

    var_dump(new Tool\Drill);

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(Uniter\Tool\Drill)#1 (0) {
}

EOS
*/) {})
            },
            'use for importing another namespace (with implicit alias name) using unprefixed path': {
                code: util.heredoc(function (/*<<<EOS
<?php
    namespace Uniter\Tool;
    class Drill {}
    function getType() { echo 'A tool'; }

    namespace House\Garage;
    use Uniter\Tool;

    var_dump(new Tool\Drill);
    Tool\getType();

EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: util.heredoc(function (/*<<<EOS
object(Uniter\Tool\Drill)#1 (0) {
}
A tool
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
