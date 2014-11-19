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

    var NAME = 'name',
        OBJECT = 'object',
        PROPERTY = 'property',
        Syntax = estraverse.Syntax;

    function MemberExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(MemberExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.MemberExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var tempName;

            tempName = functionContext.getTempNameForVariable(node[OBJECT][NAME], blockContext);

            return {
                'type': Syntax.MemberExpression,
                'object': {
                    'type': Syntax.Identifier,
                    'name': tempName
                },
                'property': node[PROPERTY]
            };
        }
    });

    return MemberExpressionTranspiler;
});
