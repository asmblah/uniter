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

    var EXPRESSION = 'expression',
        Syntax = estraverse.Syntax;

    function ExpressionStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(ExpressionStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ExpressionStatement;
        },

        transpile: function (node, functionContext, blockContext) {
            var expression = this.expressionTranspiler.transpile(node[EXPRESSION], functionContext, blockContext);

            blockContext.prepareStatement().assign({
                'type': Syntax.ExpressionStatement,
                'expression': expression
            });
        }
    });

    return ExpressionStatementTranspiler;
});
