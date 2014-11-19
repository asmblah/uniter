/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'vendor/esparse/esprima',
    'vendor/esparse/estraverse',
    'js/util',
    './BlockContext',
    './FunctionContext'
], function (
    esprima,
    estraverse,
    util,
    BlockContext,
    FunctionContext
) {
    'use strict';

    var BODY = 'body',
        ID = 'id',
        NAME = 'name',
        PARAMS = 'params',
        TYPE = 'type',
        Syntax = estraverse.Syntax;

    function FunctionTranspiler(statementTranspiler) {
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(FunctionTranspiler.prototype, {
        transpile: function (node) {
            var newNode,
                transpiler = this,
                ownFunctionContext = new FunctionContext(),
                ownBlockContext = new BlockContext(ownFunctionContext),
                statements = [];

            util.each(node[PARAMS], function (param) {
                ownFunctionContext.addParameter(param[NAME]);
            });

            if (node[BODY][BODY].length > 0) {
                transpiler.statementTranspiler.transpileArray(node[BODY][BODY], node, ownFunctionContext, ownBlockContext);
                statements = ownFunctionContext.getStatements(ownBlockContext.getSwitchStatement());
            }

            newNode = {
                'type': node[TYPE],
                'id': node[ID],
                'params': node[PARAMS],
                'body': {
                    'type': Syntax.BlockStatement,
                    'body': statements
                }
            };

            return newNode;
        }
    });

    return FunctionTranspiler;
});
