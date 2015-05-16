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

    var LEFT = 'left',
        NAME = 'name',
        TYPE = 'type',
        Syntax = estraverse.Syntax;

    function IdentifierTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(IdentifierTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.Identifier;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var isDefined = functionContext.hasVariableDefined(node[NAME]) ||
                (
                    parent[TYPE] === Syntax.AssignmentExpression &&
                    node === parent[LEFT]
                );

            return {
                'type': Syntax.Identifier,
                'name': isDefined ?
                    node[NAME] :
                    functionContext.getTempNameForVariable(node[NAME], blockContext)
            };
        }
    });

    return IdentifierTranspiler;
});
