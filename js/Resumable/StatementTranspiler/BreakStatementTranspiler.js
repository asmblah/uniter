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

    var Syntax = estraverse.Syntax;

    function BreakStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(BreakStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.BreakStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            blockContext.prepareStatement().assign({
                'type': Syntax.BreakStatement,
                'label': {
                    'type': Syntax.Identifier,
                    'name': functionContext.getLabel()
                }
            });
        }
    });

    return BreakStatementTranspiler;
});
