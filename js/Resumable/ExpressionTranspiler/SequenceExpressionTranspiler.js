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

    var EXPRESSIONS = 'expressions',
        Syntax = estraverse.Syntax;

    function SequenceExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(SequenceExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.SequenceExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var expressions = [],
                transpiler = this;

            util.each(node[EXPRESSIONS], function (expression) {
                expressions.push(
                    transpiler.expressionTranspiler.transpile(
                        expression,
                        node,
                        functionContext,
                        blockContext
                    )
                );
            });

            return {
                'type': Syntax.SequenceExpression,
                'expressions': expressions
            };
        }
    });

    return SequenceExpressionTranspiler;
});
