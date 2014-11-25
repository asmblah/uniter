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

    var OBJECT = 'object',
        PROPERTY = 'property',
        TYPE = 'type',
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
            var memberExpression,
                object = this.expressionTranspiler.transpile(node[OBJECT], node, functionContext, blockContext),
                propertyTempName;

            memberExpression = {
                'type': Syntax.MemberExpression,
                'object': object,
                'property': node[PROPERTY]
            };

            if (parent[TYPE] === Syntax.AssignmentExpression) {
                return memberExpression;
            }

            propertyTempName = functionContext.getTempName();

            blockContext.addAssignment(propertyTempName).assign(memberExpression);

            return {
                'type': Syntax.Identifier,
                'name': propertyTempName
            };
        }
    });

    return MemberExpressionTranspiler;
});
