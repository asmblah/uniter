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
            var label = node[LABEL],
                transpiler = this;

            blockContext.transformNextStatement(function (node) {
                return {
                    'type': Syntax.LabeledStatement,
                    'label': label,
                    'body': node
                };
            });

            transpiler.statementTranspiler.transpile(node[BODY], node, functionContext, blockContext);
        }
    });

    return LabeledStatementTranspiler;
});
