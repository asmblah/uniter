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
    '../BlockContext',
    '../FunctionContext'
], function (
    estraverse,
    util,
    BlockContext,
    FunctionContext
) {
    'use strict';

    var BODY = 'body',
        Syntax = estraverse.Syntax;

    function ProgramTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(ProgramTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.Program;
        },

        transpile: function (node) {
            var transpiler = this,
                functionContext = new FunctionContext(),
                blockContext = new BlockContext(functionContext);

            transpiler.statementTranspiler.transpileArray(node[BODY], node, functionContext, blockContext);

            return {
                'type': Syntax.Program,
                'body': [
                    {
                        'type': Syntax.ExpressionStatement,
                        'expression': {
                            'type': Syntax.FunctionExpression,
                            'id': null,
                            'params': [],
                            'body': {
                                'type': Syntax.BlockStatement,
                                'body': functionContext.getStatements(blockContext.getSwitchStatement())
                            }
                        }
                    }
                ]
            };
        }
    });

    return ProgramTranspiler;
});
