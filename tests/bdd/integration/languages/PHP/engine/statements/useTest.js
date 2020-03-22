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
    phpCommon = require('phpcommon'),
    phpTools = require('../../tools'),
    PHPFatalError = phpCommon.PHPFatalError;

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

    _.each({
        'simple use for aliasing standard "stdClass" class when in global namespace scope': {
            code: nowdoc(function () {/*<<<EOS
<?php
    use stdClass as EmptyClass;

    var_dump(new EmptyClass);

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'simple use for aliasing standard "stdClass" class when in a specific namespace scope using unprefixed path': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Uniter\Tool;

    use stdClass as EmptyClass;

    var_dump(new EmptyClass);

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'use for aliasing class from another namespace when in a specific namespace scope using unprefixed path': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Catalogue\Tool;

    class Drill {}

    namespace Tradesman\Certified\Electrician;

    use Catalogue\Tool\Drill as CatalogueDrill;

    var_dump(new CatalogueDrill);

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Catalogue\Tool\Drill)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'use for aliasing entire other namespace when in a specific namespace scope using unprefixed path': {
            code: nowdoc(function () {/*<<<EOS
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
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Catalogue\Tool\Drill)#1 (0) {
}
object(Catalogue\Tool\Wrench\Torque)#2 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'simple use for aliasing standard "stdClass" class when in a specific namespace scope using prefixed path': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Uniter\Tool;

    use \stdClass as EmptyClass;

    var_dump(new EmptyClass);

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(stdClass)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'use for importing another namespace (with implicit alias name) using prefixed path': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Uniter\Tool;
    class Drill {}

    namespace House\Garage;
    use \Uniter\Tool;

    var_dump(new Tool\Drill);

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Uniter\Tool\Drill)#1 (0) {
}

EOS
*/;}) // jshint ignore:line
        },
        'use for importing another namespace (with implicit alias name) using unprefixed path': {
            code: nowdoc(function () {/*<<<EOS
<?php
    namespace Uniter\Tool;
    class Drill {}
    function getType() { echo 'A tool'; }

    namespace House\Garage;
    use Uniter\Tool;

    var_dump(new Tool\Drill);
    Tool\getType();

EOS
*/;}), // jshint ignore:line
            expectedResult: null,
            expectedStderr: '',
            expectedStdout: nowdoc(function () {/*<<<EOS
object(Uniter\Tool\Drill)#1 (0) {
}
A tool
EOS
*/;}) // jshint ignore:line
        },
        'multiple identical use statements': {
            code: nowdoc(function () {/*<<<EOS
<?php
    use Uniter\Tool\Stuff;
    use Uniter\Tool\Stuff;

EOS
*/;}), // jshint ignore:line
            expectedException: {
                instanceOf: PHPFatalError,
                match: /^PHP Fatal error: Cannot use Uniter\\Tool\\Stuff as Stuff because the name is already in use in \/path\/to\/my_module\.php on line 3$/
            },
            expectedStderr: 'PHP Fatal error:  Cannot use Uniter\\Tool\\Stuff as Stuff because the name is already in use in /path/to/my_module.php on line 3\n',
            expectedStdout: '\nFatal error: Cannot use Uniter\\Tool\\Stuff as Stuff because the name is already in use in /path/to/my_module.php on line 3\n'
        }
    }, function (scenario, description) {
        describe(description, function () {
            check(scenario);
        });
    });
});
