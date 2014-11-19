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

    var ARGUMENTS = 'arguments',
        CALLEE = 'callee',
        TYPE = 'type',
        Syntax = estraverse.Syntax;

    function CallExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(CallExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.CallExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var callee,
                transpiler = this,
                tempName;

            if (parent[TYPE] === Syntax.ExpressionStatement) {
                return node;
            }

            callee = transpiler.expressionTranspiler.transpile(node[CALLEE], node, functionContext, blockContext);

            tempName = functionContext.getTempName();

            blockContext.addAssignment(tempName).assign({
                'type': Syntax.CallExpression,
                'callee': callee,
                'arguments': node[ARGUMENTS]
            });

            return {
                'type': Syntax.Identifier,
                'name': tempName
            };
        }
    });

    return CallExpressionTranspiler;
});
