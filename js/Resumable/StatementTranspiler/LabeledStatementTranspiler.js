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

    var BODY = 'body',
        LABEL = 'label',
        Syntax = estraverse.Syntax;

    function LabeledStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(LabeledStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.LabeledStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this,
                statement = blockContext.prepareStatement();

            statement.assign({
                'type': Syntax.LabeledStatement,
                'label': node[LABEL],
                'body': transpiler.statementTranspiler.transpileBlock(node[BODY], node, functionContext)
            });
        }
    });

    return LabeledStatementTranspiler;
});
