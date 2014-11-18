/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'vendor/esparse/estraverse',
    'js/util'
], function (
    estraverse,
    util
) {
    'use strict';

    var Syntax = estraverse.Syntax;

    function FunctionDeclarationTranspiler(statementTranspiler, expressionTranspiler, functionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.functionTranspiler = functionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(FunctionDeclarationTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.FunctionDeclaration;
        },

        transpile: function (node, functionContext, blockContext) {
            var newNode = this.functionTranspiler.transpile(node, functionContext, blockContext);

            functionContext.addFunctionDeclaration(newNode);
        }
    });

    return FunctionDeclarationTranspiler;
});
