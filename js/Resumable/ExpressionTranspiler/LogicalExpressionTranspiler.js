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
    'js/util',
    '../BlockContext'
], function (
    estraverse,
    util,
    BlockContext
) {
    'use strict';

    var LEFT = 'left',
        OPERATOR = 'operator',
        RIGHT = 'right',
        Syntax = estraverse.Syntax;

    function LogicalExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(LogicalExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.LogicalExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var left,
                right,
                rightSideBlockContext,
                statement,
                transpiler = this;

            left = transpiler.expressionTranspiler.transpile(node[LEFT], node, functionContext, blockContext);

            statement = blockContext.prepareStatement();

            rightSideBlockContext = new BlockContext(functionContext);

            right = transpiler.expressionTranspiler.transpile(node[RIGHT], node, functionContext, rightSideBlockContext);

            statement.assign({
                'type': Syntax.IfStatement,
                'test': {
                    'type': Syntax.LogicalExpression,
                    'operator': '||',
                    'left': {
                        'type': Syntax.BinaryExpression,
                        'operator': '>',
                        'left': {
                            'type': Syntax.Identifier,
                            'name': 'statementIndex'
                        },
                        'right': {
                            'type': Syntax.Literal,
                            'value': statement.getIndex() + 1
                        }
                    },
                    'right': {
                        'type': Syntax.UnaryExpression,
                        'operator': '!',
                        'prefix': true,
                        'argument': left
                    }
                },
                'consequent': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        rightSideBlockContext.getSwitchStatement()
                    ]
                }
            });

            return {
                'type': Syntax.LogicalExpression,
                'operator': node[OPERATOR],
                'left': left,
                'right': right
            };
        }
    });

    return LogicalExpressionTranspiler;
});
