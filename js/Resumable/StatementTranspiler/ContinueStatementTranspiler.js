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

    var LABEL = 'label',
        Syntax = estraverse.Syntax;

    function ContinueStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(ContinueStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ContinueStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var label = node[LABEL] ?
                node[LABEL] :
                {
                    'type': Syntax.Identifier,
                    'name': functionContext.getLabel()
                };

            blockContext.prepareStatement().assign({
                'type': Syntax.ContinueStatement,
                'label': label
            });
        }
    });

    return ContinueStatementTranspiler;
});
