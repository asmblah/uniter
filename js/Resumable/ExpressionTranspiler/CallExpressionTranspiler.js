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

    var ARGUMENTS = 'arguments',
        CALLEE = 'callee',
        NAME = 'name',
        OBJECT = 'object',
        TYPE = 'type',
        Syntax = estraverse.Syntax;

    function CallExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(CallExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.CallExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var args = node[ARGUMENTS],
                callee,
                callNode,
                transpiler = this,
                tempNameForAssignment,
                tempNameForCallee;

            if (node[CALLEE][TYPE] === Syntax.Identifier && functionContext.hasVariableDefined(node[CALLEE][NAME])) {
                callee = node[CALLEE];
            } else {
                callee = transpiler.expressionTranspiler.transpile(node[CALLEE], node, functionContext, blockContext);
                tempNameForCallee = functionContext.getTempName();
                blockContext.addAssignment(tempNameForCallee).assign(
                    callee
                );

                if (node[CALLEE][TYPE] === Syntax.MemberExpression) {
                    // Change callee to a '... .call(...)' to preserve thisObj
                    args = [callee[OBJECT]].concat(args);

                    callee = {
                        'type': Syntax.MemberExpression,
                        'object': {
                            'type': Syntax.Identifier,
                            'name': tempNameForCallee
                        },
                        'property': {
                            'type': Syntax.Identifier,
                            'name': 'call',
                        },
                        'computed': false
                    };
                } else {
                    callee = {
                        'type': Syntax.Identifier,
                        'name': tempNameForCallee
                    };
                }
            }

            args = transpiler.expressionTranspiler.transpileArray(args, node, functionContext, blockContext);

            callNode = {
                'type': Syntax.CallExpression,
                'callee': callee,
                'arguments': args
            };

            if (parent[TYPE] === Syntax.ExpressionStatement) {
                return callNode;
            }

            tempNameForAssignment = functionContext.getTempName();
            blockContext.addAssignment(tempNameForAssignment).assign(callNode);

            return {
                'type': Syntax.Identifier,
                'name': tempNameForAssignment
            };
        }
    });

    return CallExpressionTranspiler;
});
