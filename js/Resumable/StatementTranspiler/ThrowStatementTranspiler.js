/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'estraverse',
    'js/util'
], function (
    estraverse,
    util
) {
    'use strict';

    var ARGUMENT = 'argument',
        Syntax = estraverse.Syntax;

    function ThrowStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(ThrowStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ThrowStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var expression = this.expressionTranspiler.transpile(node[ARGUMENT], node, functionContext, blockContext);

            blockContext.prepareStatement().assign({
                'type': Syntax.ThrowStatement,
                'argument': expression
            });
        }
    });

    return ThrowStatementTranspiler;
});
