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

    var PROPERTIES = 'properties',
        Syntax = estraverse.Syntax;

    function ObjectExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(ObjectExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ObjectExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            return {
                'type': Syntax.ObjectExpression,
                'properties': transpiler.expressionTranspiler.transpileArray(
                    node[PROPERTIES],
                    node,
                    functionContext,
                    blockContext
                )
            };
        }
    });

    return ObjectExpressionTranspiler;
});
