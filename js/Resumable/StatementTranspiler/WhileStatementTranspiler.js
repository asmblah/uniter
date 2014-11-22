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

    var BODY = 'body',
        TEST = 'test',
        Syntax = estraverse.Syntax;

    function WhileStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(WhileStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.WhileStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var ownBlockContext = new BlockContext(functionContext),
                transpiler = this,
                expression,
                statement;

            statement = blockContext.prepareStatement();

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
                            'label': null
                        }
                    ]
                }
            });

            transpiler.statementTranspiler.transpileArray(node[BODY][BODY], node, functionContext, ownBlockContext);

            statement.assign({
                'type': Syntax.ForStatement,
                'init': null,
                'test': null,
                'update': null,
                'body': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        ownBlockContext.getSwitchStatement()
                    ]
                }
            });
        }
    });

    return WhileStatementTranspiler;
});
