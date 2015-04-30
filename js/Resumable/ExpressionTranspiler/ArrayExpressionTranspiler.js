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

    var ELEMENTS = 'elements',
        Syntax = estraverse.Syntax;

    function ArrayExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(ArrayExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ArrayExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            return {
                'type': Syntax.ArrayExpression,
                'elements': transpiler.expressionTranspiler.transpileArray(node[ELEMENTS], node, functionContext, blockContext)
            };
        }
    });

    return ArrayExpressionTranspiler;
});
