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
        OPERATOR = 'operator',
        RIGHT = 'right',
        Syntax = estraverse.Syntax;

    function AssignmentExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(AssignmentExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.AssignmentExpression;
        },

        transpile: function (node, functionContext, blockContext) {
            var left,
                right,
                transpiler = this;

            left = transpiler.expressionTranspiler.transpile(node[LEFT], functionContext, blockContext, {
                assignment: true
            });

            if (node[OPERATOR] === '=') {
                right = node[RIGHT];
            } else {
                right = {
                    'type': Syntax.BinaryExpression,
                    'operator': node[OPERATOR].charAt(0),
                    'left': node[LEFT],
                    'right': node[RIGHT]
                };
            }

            right = transpiler.expressionTranspiler.transpile(right, functionContext, blockContext);

            return {
                'type': Syntax.AssignmentExpression,
                'operator': '=',
                'left': left,
                'right': right
            };
        }
    });

    return AssignmentExpressionTranspiler;
});
