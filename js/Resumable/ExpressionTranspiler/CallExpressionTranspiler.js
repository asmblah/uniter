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
        Syntax = estraverse.Syntax;

    function CallExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(CallExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.CallExpression;
        },

        transpile: function (node, functionContext, blockContext) {
            var callee,
                transpiler = this,
                tempName;

            callee = transpiler.expressionTranspiler.transpile(node[CALLEE], functionContext, blockContext);

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
