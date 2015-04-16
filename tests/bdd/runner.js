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
    'chai',
    'require',
    'sinon',
    'sinon-chai',
    'mocha'
], function (
    chai,
    require,
    sinon,
    sinonChai,
    Mocha
) {
    'use strict';

    var global = /*jshint evil: true */new Function('return this;')()/*jshint evil: false */;

    chai.use(sinonChai);

    global.expect = chai.expect;
    global.sinon = sinon;

    return function (options, callback) {
        var mocha = new Mocha({
            'ui': 'bdd',
            'reporter': options.reporter || mocha.reporters.HTML,
            'globals': ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval']
        });

        if (options.grep) {
            mocha.grep(new RegExp(options.grep));
        }

        // Expose Mocha functions in the global scope
        mocha.suite.emit('pre-require', global, null, mocha);

        require([
            'bdd/integration/languages/PHP/engine/bridge/arrayTest',
            'bdd/integration/languages/PHP/engine/bridge/booleanTest',
            'bdd/integration/languages/PHP/engine/bridge/methodTest',
            'bdd/integration/languages/PHP/engine/bridge/plainObjectTest',
            'bdd/integration/languages/PHP/engine/builtin/functions/array/currentTest',
            'bdd/integration/languages/PHP/engine/builtin/functions/array/nextTest',
            'bdd/integration/languages/PHP/engine/builtin/functions/constant/defineTest',
            'bdd/integration/languages/PHP/engine/builtin/functions/spl/spl_autoload_registerTest',
            'bdd/integration/languages/PHP/engine/builtin/functions/string/strlenTest',
            'bdd/integration/languages/PHP/engine/builtin/functions/variableHandling/var_dumpTest',
            'bdd/integration/languages/PHP/engine/constructs/doubleQuotedStringTest',
            'bdd/integration/languages/PHP/engine/constructs/issetTest',
            'bdd/integration/languages/PHP/engine/constructs/listTest',
            'bdd/integration/languages/PHP/engine/constructs/namespaceTest',
            'bdd/integration/languages/PHP/engine/constructs/selfKeywordTest',
            'bdd/integration/languages/PHP/engine/constructs/singleQuotedStringTest',
            'bdd/integration/languages/PHP/engine/constructs/stringInterpolationTest',
            'bdd/integration/languages/PHP/engine/expressions/closure/defaultArgumentValueTest',
            'bdd/integration/languages/PHP/engine/expressions/magicConstant/dirTest',
            'bdd/integration/languages/PHP/engine/expressions/magicConstant/fileTest',
            'bdd/integration/languages/PHP/engine/expressions/magicConstant/lineTest',
            'bdd/integration/languages/PHP/engine/expressions/arrayLiteralTest',
            'bdd/integration/languages/PHP/engine/expressions/closureTest',
            'bdd/integration/languages/PHP/engine/expressions/constantTest',
            'bdd/integration/languages/PHP/engine/expressions/includeTest',
            'bdd/integration/languages/PHP/engine/expressions/printTest',
            'bdd/integration/languages/PHP/engine/expressions/requireOnceTest',
            'bdd/integration/languages/PHP/engine/expressions/requireTest',
            'bdd/integration/languages/PHP/engine/operators/arithmetic/additionTest',
            'bdd/integration/languages/PHP/engine/operators/cast/arrayTest',
            'bdd/integration/languages/PHP/engine/operators/comparison/looseEqualityTest',
            'bdd/integration/languages/PHP/engine/operators/comparison/strictEqualityTest',
            'bdd/integration/languages/PHP/engine/operators/logical/notTest',
            'bdd/integration/languages/PHP/engine/operators/objectAccess/instanceMethodTest',
            'bdd/integration/languages/PHP/engine/operators/objectAccess/instancePropertyTest',
            'bdd/integration/languages/PHP/engine/operators/scopeResolution/constantTest',
            'bdd/integration/languages/PHP/engine/operators/scopeResolution/staticMethodTest',
            'bdd/integration/languages/PHP/engine/operators/scopeResolution/staticPropertyTest',
            'bdd/integration/languages/PHP/engine/operators/arrayAccessTest',
            'bdd/integration/languages/PHP/engine/operators/assignmentTest',
            'bdd/integration/languages/PHP/engine/operators/bitwiseTest',
            'bdd/integration/languages/PHP/engine/operators/functionCallTest',
            'bdd/integration/languages/PHP/engine/operators/newTest',
            'bdd/integration/languages/PHP/engine/operators/ternaryTest',
            'bdd/integration/languages/PHP/engine/operators/updateTest',
            'bdd/integration/languages/PHP/engine/syntax/errorTest',
            'bdd/integration/languages/PHP/engine/statements/class/constantTest',
            'bdd/integration/languages/PHP/engine/statements/class/extendsTest',
            'bdd/integration/languages/PHP/engine/statements/class/implementsTest',
            'bdd/integration/languages/PHP/engine/statements/class/privateStaticPropertyTest',
            'bdd/integration/languages/PHP/engine/statements/class/protectedStaticPropertyTest',
            'bdd/integration/languages/PHP/engine/statements/class/publicStaticPropertyTest',
            'bdd/integration/languages/PHP/engine/statements/class/instanceMethodDefaultArgumentValueTest',
            'bdd/integration/languages/PHP/engine/statements/class/instanceMethodTypeHintingTest',
            'bdd/integration/languages/PHP/engine/statements/class/staticMethodDefaultArgumentValueTest',
            'bdd/integration/languages/PHP/engine/statements/class/staticMethodTypeHintingTest',
            'bdd/integration/languages/PHP/engine/statements/function/autoloadTest',
            'bdd/integration/languages/PHP/engine/statements/function/defaultArgumentValueTest',
            'bdd/integration/languages/PHP/engine/statements/function/typeHintingTest',
            'bdd/integration/languages/PHP/engine/statements/interface/constantTest',
            'bdd/integration/languages/PHP/engine/statements/interface/instanceMethodTest',
            'bdd/integration/languages/PHP/engine/statements/interface/instancePropertyTest',
            'bdd/integration/languages/PHP/engine/statements/interface/staticMethodTest',
            'bdd/integration/languages/PHP/engine/statements/interface/staticPropertyTest',
            'bdd/integration/languages/PHP/engine/statements/classTest',
            'bdd/integration/languages/PHP/engine/statements/doWhileTest',
            'bdd/integration/languages/PHP/engine/statements/echoTest',
            'bdd/integration/languages/PHP/engine/statements/forTest',
            'bdd/integration/languages/PHP/engine/statements/foreachTest',
            'bdd/integration/languages/PHP/engine/statements/functionTest',
            'bdd/integration/languages/PHP/engine/statements/gotoTest',
            'bdd/integration/languages/PHP/engine/statements/ifTest',
            'bdd/integration/languages/PHP/engine/statements/returnTest',
            'bdd/integration/languages/PHP/engine/statements/switchTest',
            'bdd/integration/languages/PHP/engine/statements/throwTest',
            'bdd/integration/languages/PHP/engine/statements/useTest',
            'bdd/integration/languages/PHP/engine/statements/whileTest',
            'bdd/integration/languages/PHP/engine/smallTest',
            'bdd/integration/languages/PHP/grammar/constructs/issetTest',
            'bdd/integration/languages/PHP/grammar/constructs/listTest',
            'bdd/integration/languages/PHP/grammar/constructs/namespaceTest',
            'bdd/integration/languages/PHP/grammar/constructs/selfKeywordTest',
            'bdd/integration/languages/PHP/grammar/constructs/singleQuotedStringTest',
            'bdd/integration/languages/PHP/grammar/constructs/stringInterpolationTest',
            'bdd/integration/languages/PHP/grammar/expressions/closure/defaultArgumentValueTest',
            'bdd/integration/languages/PHP/grammar/expressions/magicConstant/dirTest',
            'bdd/integration/languages/PHP/grammar/expressions/magicConstant/fileTest',
            'bdd/integration/languages/PHP/grammar/expressions/magicConstant/lineTest',
            'bdd/integration/languages/PHP/grammar/expressions/arrayLiteralTest',
            'bdd/integration/languages/PHP/grammar/expressions/closureTest',
            'bdd/integration/languages/PHP/grammar/expressions/constantTest',
            'bdd/integration/languages/PHP/grammar/expressions/functionCallTest',
            'bdd/integration/languages/PHP/grammar/expressions/includeTest',
            'bdd/integration/languages/PHP/grammar/expressions/nullTest',
            'bdd/integration/languages/PHP/grammar/expressions/printTest',
            'bdd/integration/languages/PHP/grammar/expressions/requireOnceTest',
            'bdd/integration/languages/PHP/grammar/expressions/requireTest',
            'bdd/integration/languages/PHP/grammar/operators/cast/arrayTest',
            'bdd/integration/languages/PHP/grammar/operators/logical/notTest',
            'bdd/integration/languages/PHP/grammar/operators/objectAccess/instanceMethodTest',
            'bdd/integration/languages/PHP/grammar/operators/objectAccess/instancePropertyTest',
            'bdd/integration/languages/PHP/grammar/operators/scopeResolution/constantTest',
            'bdd/integration/languages/PHP/grammar/operators/scopeResolution/staticMethodTest',
            'bdd/integration/languages/PHP/grammar/operators/scopeResolution/staticPropertyTest',
            'bdd/integration/languages/PHP/grammar/operators/arrayAccessTest',
            'bdd/integration/languages/PHP/grammar/operators/comparisonTest',
            'bdd/integration/languages/PHP/grammar/operators/newTest',
            'bdd/integration/languages/PHP/grammar/statements/class/constantTest',
            'bdd/integration/languages/PHP/grammar/statements/class/extendsTest',
            'bdd/integration/languages/PHP/grammar/statements/class/implementsTest',
            'bdd/integration/languages/PHP/grammar/statements/class/instanceMethodDefaultArgumentValueTest',
            'bdd/integration/languages/PHP/grammar/statements/class/instanceMethodTypeHintingTest',
            'bdd/integration/languages/PHP/grammar/statements/class/staticMethodDefaultArgumentValueTest',
            'bdd/integration/languages/PHP/grammar/statements/class/staticMethodTest',
            'bdd/integration/languages/PHP/grammar/statements/class/staticMethodTypeHintingTest',
            'bdd/integration/languages/PHP/grammar/statements/class/staticPropertyTest',
            'bdd/integration/languages/PHP/grammar/statements/function/defaultArgumentValueTest',
            'bdd/integration/languages/PHP/grammar/statements/function/typeHintingTest',
            'bdd/integration/languages/PHP/grammar/statements/interface/constantTest',
            'bdd/integration/languages/PHP/grammar/statements/interface/extendsTest',
            'bdd/integration/languages/PHP/grammar/statements/interface/instanceMethodTest',
            'bdd/integration/languages/PHP/grammar/statements/interface/instanceMethodDefaultArgumentValueTest',
            'bdd/integration/languages/PHP/grammar/statements/interface/instanceMethodTypeHintingTest',
            'bdd/integration/languages/PHP/grammar/statements/interface/staticMethodDefaultArgumentValueTest',
            'bdd/integration/languages/PHP/grammar/statements/interface/staticMethodTest',
            'bdd/integration/languages/PHP/grammar/statements/interface/staticMethodTypeHintingTest',
            'bdd/integration/languages/PHP/grammar/statements/classTest',
            'bdd/integration/languages/PHP/grammar/statements/doWhileTest',
            'bdd/integration/languages/PHP/grammar/statements/foreachTest',
            'bdd/integration/languages/PHP/grammar/statements/forTest',
            'bdd/integration/languages/PHP/grammar/statements/functionTest',
            'bdd/integration/languages/PHP/grammar/statements/gotoTest',
            'bdd/integration/languages/PHP/grammar/statements/ifTest',
            'bdd/integration/languages/PHP/grammar/statements/switchTest',
            'bdd/integration/languages/PHP/grammar/statements/throwTest',
            'bdd/integration/languages/PHP/grammar/statements/useTest',
            'bdd/integration/languages/PHP/grammar/statements/whileTest',
            'bdd/integration/languages/PHP/grammar/smallTest',
            'bdd/integration/languages/PHP/grammar/syntax/errorTest',
            'bdd/integration/languages/PHP/grammar/syntax/whitespaceTest',
            'bdd/integration/languages/PHP/interpreter/statements/foreachTest',
            'bdd/integration/languages/PHP/interpreter/statements/ifTest',
            'bdd/integration/languages/PHP/interpreter/smallTest',
            'bdd/integration/nodeAPITest',
            'bdd/unit/js/Resumable/Resumable/demeterChainTest',
            'bdd/unit/js/Resumable/Resumable/functionCallTest',
            'bdd/unit/js/Resumable/Resumable/ifStatementWithoutPauseTest',
            'bdd/unit/js/Resumable/Resumable/ifStatementWithPauseTest',
            'bdd/unit/js/Resumable/Resumable/returnStatementTest',
            'bdd/unit/js/Resumable/Transpiler/doWhileStatementTest',
            'bdd/unit/js/Resumable/Transpiler/labeledStatementTest',
            'bdd/unit/js/Resumable/Transpiler/logicalExpressionTest',
            'bdd/unit/js/Resumable/Transpiler/sequenceExpressionTest',
            'bdd/unit/js/Resumable/Transpiler/throwStatementTest',
            'bdd/unit/js/Resumable/Transpiler/updateExpressionTest',
            'bdd/unit/js/Resumable/ResumableTest',
            'bdd/unit/js/Resumable/TranspilerTest',
            'bdd/unit/js/InterpreterTest',
            'bdd/unit/js/ParserTest',
            'bdd/unit/js/StreamTest',
            'bdd/unit/js/utilTest'
        ], function () {
            mocha.run(callback);
        });
    };
});
