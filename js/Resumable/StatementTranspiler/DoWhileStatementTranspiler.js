/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'vendor/esparse/esprima',
    'vendor/esparse/estraverse',
    'js/util',
    '../BlockContext'
], function (
    esprima,
    estraverse,
    util,
    BlockContext
) {
    'use strict';

    var BODY = 'body',
        TEST = 'test',
        Syntax = estraverse.Syntax;

    function DoWhileStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(DoWhileStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.DoWhileStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var forNode,
                ownBlockContext = new BlockContext(functionContext),
                transpiler = this,
                expression,
                statement;

            statement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[BODY][BODY], node, functionContext, ownBlockContext);

            expression = transpiler.expressionTranspiler.transpile(node[TEST], node, functionContext, ownBlockContext);

            ownBlockContext.prepareStatement().assign({
                'type': Syntax.IfStatement,
                'test': {
                    'type': Syntax.UnaryExpression,
                    'operator': '!',
                    'prefix': true,
                    'argument': expression
                },
                'consequent': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        {
                            'type': Syntax.BreakStatement,
                            'label': {
                                'type': Syntax.Identifier,
                                'name': functionContext.getLabel()
                            }
                        }
                    ]
                }
            });

            forNode = {
                'type': Syntax.ForStatement,
                'init': null,
                'test': null,
                'update': null,
                'body': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        ownBlockContext.getSwitchStatement(),
                        esprima.parse('statementIndex = ' + (statement.getIndex() + 1) + ';').body[0]
                    ]
                }
            };

            statement.assign(functionContext.isLabelUsed() ? {
                'type': Syntax.LabeledStatement,
                'label': {
                    'type': Syntax.Identifier,
                    'name': functionContext.getLabel()
                },
                'body': forNode
            } : forNode);

            functionContext.endLabelableContext();
        }
    });

    return DoWhileStatementTranspiler;
});
