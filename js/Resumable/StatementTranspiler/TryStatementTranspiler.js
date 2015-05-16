/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'esprima',
    'estraverse',
    'js/util',
    '../BlockContext'
], function (
    esprima,
    estraverse,
    util,
    BlockContext
) {
    'use strict';

    var BLOCK = 'block',
        BODY = 'body',
        HANDLERS = 'handlers',
        FINALIZER = 'finalizer',
        NAME = 'name',
        PARAM = 'param',
        Syntax = estraverse.Syntax;

    function TryStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(TryStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.TryStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var handlers = [],
                ownBlockContext = new BlockContext(functionContext),
                statement,
                transpiler = this,
                tryNode;

            statement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[BLOCK][BODY], node, functionContext, ownBlockContext);

            tryNode = {
                'type': Syntax.TryStatement,
                'block': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        ownBlockContext.getSwitchStatement()
                    ]
                }
            };

            if (node[HANDLERS]) {
                handlers = [];

                util.each(node[HANDLERS], function (handler) {
                    var catchClauseBlockContext = new BlockContext(functionContext);

                    transpiler.statementTranspiler.transpileArray(handler[BODY][BODY], handler, functionContext, catchClauseBlockContext);

                    handlers.push({
                        'type': Syntax.CatchClause,
                        'param': handler[PARAM],
                        'body': {
                            'type': Syntax.BlockStatement,
                            'body': [
                                {
                                    'type': Syntax.IfStatement,
                                    'test': esprima.parse(handler[PARAM][NAME] + ' instanceof Resumable.PauseException').body[0].expression,
                                    'consequent': {
                                        'type': Syntax.BlockStatement,
                                        'body': [
                                            {
                                                'type': Syntax.ThrowStatement,
                                                'argument': handler[PARAM]
                                            }
                                        ]
                                    }
                                },
                                catchClauseBlockContext.getSwitchStatement()
                            ]
                        }
                    });
                });

                tryNode[HANDLERS] = handlers;
            }

            if (node[FINALIZER]) {
                tryNode[FINALIZER] = node[FINALIZER];
            }

            statement.assign(tryNode);
        }
    });

    return TryStatementTranspiler;
});
