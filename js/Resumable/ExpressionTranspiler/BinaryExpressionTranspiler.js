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

    var LEFT = 'left',
        NAME = 'name',
        OPERATOR = 'operator',
        RIGHT = 'right',
        TYPE = 'type',
        Syntax = estraverse.Syntax;

    function BinaryExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(BinaryExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.BinaryExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var left,
                right,
                transpiler = this;

            if (node[LEFT][TYPE] === Syntax.Identifier) {
                left = {
                    'type': Syntax.Identifier,
                    'name': functionContext.getTempNameForVariable(node[LEFT][NAME], blockContext)
                };
            } else {
                left = transpiler.expressionTranspiler.transpile(node[LEFT], node, functionContext, blockContext);
            }

            if (node[RIGHT][TYPE] === Syntax.Identifier) {
                right = {
                    'type': Syntax.Identifier,
                    'name': functionContext.getTempNameForVariable(node[RIGHT][NAME], blockContext)
                };
            } else {
                right = transpiler.expressionTranspiler.transpile(node[RIGHT], node, functionContext, blockContext);
            }

            return {
                'type': Syntax.BinaryExpression,
                'operator': node[OPERATOR],
                'left': left,
                'right': right
            };
        }
    });

    return BinaryExpressionTranspiler;
});
