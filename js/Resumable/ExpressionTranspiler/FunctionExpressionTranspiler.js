/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'estraverse',
    'js/util'
], function (
    estraverse,
    util
) {
    'use strict';

    var Syntax = estraverse.Syntax;

    function FunctionExpressionTranspiler(statementTranspiler, expressionTranspiler, functionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.functionTranspiler = functionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(FunctionExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.FunctionExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            return this.functionTranspiler.transpile(node, parent, functionContext, blockContext);
        }
    });

    return FunctionExpressionTranspiler;
});
