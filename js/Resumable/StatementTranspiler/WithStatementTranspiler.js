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
        OBJECT = 'object',
        Syntax = estraverse.Syntax;

    function WithStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(WithStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.WithStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this,
                object = this.expressionTranspiler.transpile(node[OBJECT], node, functionContext, blockContext),
                ownBlockContext = new BlockContext(functionContext),
                statement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[BODY][BODY], node, functionContext, ownBlockContext);

            statement.assign({
                'type': Syntax.WithStatement,
                'object': object,
                'body': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        ownBlockContext.getSwitchStatement()
                    ]
                }
            });
        }
    });

    return WithStatementTranspiler;
});
