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
        Syntax = estraverse.Syntax;

    function BlockStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(BlockStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.BlockStatement;
        },

        transpile: function (node, functionContext, blockContext) {
            var transpiler = this,
                ownBlockContext = new BlockContext(functionContext),
                statement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[BODY], functionContext, ownBlockContext);

            statement.assign({
                'type': Syntax.BlockStatement,
                'body': [
                    ownBlockContext.getSwitchStatement()
                ]
            });
        }
    });

    return BlockStatementTranspiler;
});
