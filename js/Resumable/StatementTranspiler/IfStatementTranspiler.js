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

    var ALTERNATE = 'alternate',
        BODY = 'body',
        CONSEQUENT = 'consequent',
        TEST = 'test',
        Syntax = estraverse.Syntax;

    function IfStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(IfStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.IfStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var alternateBlockContext,
                alternateStatement,
                consequentBlockContext = new BlockContext(functionContext),
                consequentStatement,
                transpiler = this,
                expression = transpiler.expressionTranspiler.transpile(node[TEST], node, functionContext, blockContext);

            consequentStatement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[CONSEQUENT][BODY], node, functionContext, consequentBlockContext);

            consequentStatement.assign({
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
                            'value': consequentStatement.getIndex() + 1
                        }
                    },
                    'right': expression
                },
                'consequent': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        consequentBlockContext.getSwitchStatement()
                    ]
                }
            });

            if (node[ALTERNATE]) {
                alternateBlockContext = new BlockContext(functionContext);

                alternateStatement = blockContext.prepareStatement();

                transpiler.statementTranspiler.transpileArray(node[ALTERNATE][BODY], node, functionContext, alternateBlockContext);

                alternateStatement.assign({
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
                                'value': alternateStatement.getIndex() + 1
                            }
                        },
                        'right': {
                            'type': Syntax.UnaryExpression,
                            'operator': '!',
                            'prefix': true,
                            'argument': expression
                        }
                    },
                    'consequent': {
                        'type': Syntax.BlockStatement,
                        'body': [
                            alternateBlockContext.getSwitchStatement()
                        ]
                    }
                });
            }
        }
    });

    return IfStatementTranspiler;
});
