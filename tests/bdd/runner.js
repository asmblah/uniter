/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, require */
define({
    cache: false,
    paths: {
        'bdd': '.',
        'js': '/../../js',
        'languages': '/../../languages',

        // FIXME!! (In Modular)
        'Modular': require.config().paths.Modular,

        'vendor': '/../../vendor'
    }
}, [
    'chai/chai',
    'modular',
    'require',
    'sinon/sinon',
    'sinon-chai/sinon-chai',
    'Mocha',

    // Init util.js
    'js/Uniter'
], function (
    chai,
    modular,
    require,
    sinon,
    sinonChai,
    Mocha
) {
    'use strict';

    var global = modular.util.global;

    chai.use(sinonChai);

    global.expect = chai.expect;
    global.sinon = sinon;

    return function (options, callback) {
        var mocha = new Mocha({
            'ui': 'bdd',
            'reporter': options.reporter || mocha.reporters.HTML,
            'globals': ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval']
        });

        // Expose Mocha functions in the global scope
        mocha.suite.emit('pre-require', global, null, mocha);

        require([
            'bdd/integration/languages/PHP/engine/bridge/arrayTest',
            'bdd/integration/languages/PHP/engine/bridge/booleanTest',
            'bdd/integration/languages/PHP/engine/bridge/methodTest',
            'bdd/integration/languages/PHP/engine/bridge/plainObjectTest',
            'bdd/integration/languages/PHP/engine/builtin/functions/array/currentTest',
            'bdd/integration/languages/PHP/engine/builtin/functions/array/nextTest',
            'bdd/integration/languages/PHP/engine/builtin/functions/variableHandling/var_dumpTest',
            'bdd/integration/languages/PHP/engine/constructs/doubleQuotedStringTest',
            'bdd/integration/languages/PHP/engine/constructs/issetTest',
            'bdd/integration/languages/PHP/engine/constructs/listTest',
            'bdd/integration/languages/PHP/engine/constructs/namespaceTest',
            'bdd/integration/languages/PHP/engine/constructs/singleQuotedStringTest',
            'bdd/integration/languages/PHP/engine/constructs/stringInterpolationTest',
            'bdd/integration/languages/PHP/engine/expressions/arrayLiteralTest',
            'bdd/integration/languages/PHP/engine/expressions/methodCallTest',
            'bdd/integration/languages/PHP/engine/expressions/printTest',
            'bdd/integration/languages/PHP/engine/operators/arrayAccessTest',
            'bdd/integration/languages/PHP/engine/operators/assignmentTest',
            'bdd/integration/languages/PHP/engine/operators/bitwiseTest',
            'bdd/integration/languages/PHP/engine/operators/newTest',
            'bdd/integration/languages/PHP/engine/operators/objectAccessTest',
            'bdd/integration/languages/PHP/engine/operators/ternaryTest',
            'bdd/integration/languages/PHP/engine/operators/updateTest',
            'bdd/integration/languages/PHP/engine/statements/classTest',
            'bdd/integration/languages/PHP/engine/statements/echoTest',
            'bdd/integration/languages/PHP/engine/statements/foreachTest',
            'bdd/integration/languages/PHP/engine/statements/functionTest',
            'bdd/integration/languages/PHP/engine/statements/ifTest',
            'bdd/integration/languages/PHP/engine/statements/returnTest',
            'bdd/integration/languages/PHP/engine/smallTest',
            'bdd/integration/languages/PHP/grammar/constructs/issetTest',
            'bdd/integration/languages/PHP/grammar/constructs/listTest',
            'bdd/integration/languages/PHP/grammar/constructs/namespaceTest',
            'bdd/integration/languages/PHP/grammar/constructs/singleQuotedStringTest',
            'bdd/integration/languages/PHP/grammar/constructs/stringInterpolationTest',
            'bdd/integration/languages/PHP/grammar/expressions/arrayLiteralTest',
            'bdd/integration/languages/PHP/grammar/expressions/functionCallTest',
            'bdd/integration/languages/PHP/grammar/expressions/methodCallTest',
            'bdd/integration/languages/PHP/grammar/expressions/nullTest',
            'bdd/integration/languages/PHP/grammar/expressions/printTest',
            'bdd/integration/languages/PHP/grammar/operators/arrayAccessTest',
            'bdd/integration/languages/PHP/grammar/operators/newTest',
            'bdd/integration/languages/PHP/grammar/operators/objectAccessTest',
            'bdd/integration/languages/PHP/grammar/statements/classTest',
            'bdd/integration/languages/PHP/grammar/statements/foreachTest',
            'bdd/integration/languages/PHP/grammar/statements/functionTest',
            'bdd/integration/languages/PHP/grammar/statements/ifTest',
            'bdd/integration/languages/PHP/grammar/smallTest',
            'bdd/integration/languages/PHP/interpreter/statements/foreachTest',
            'bdd/integration/languages/PHP/interpreter/statements/ifTest',
            'bdd/integration/languages/PHP/interpreter/smallTest',
            'bdd/unit/js/InterpreterTest',
            'bdd/unit/js/ParserTest',
            'bdd/unit/js/StreamTest',
            'bdd/unit/js/utilTest'
        ], function () {
            mocha.run(callback);
        });
    };
});
