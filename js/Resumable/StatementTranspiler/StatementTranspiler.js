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
    '../BlockContext'
], function (
    estraverse,
    util,
    BlockContext
) {
    'use strict';

    var BODY = 'body',
        TYPE = 'type',
        hasOwn = {}.hasOwnProperty,
        Syntax = estraverse.Syntax;

    function StatementTranspiler(expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.transpilers = {};
    }

    util.extend(StatementTranspiler.prototype, {
        addTranspiler: function (transpiler) {
            this.transpilers[transpiler.getNodeType()] = transpiler;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            if (!hasOwn.call(transpiler.transpilers, node[TYPE])) {
                throw new Error('Unsupported type "' + node[TYPE] + '"');
            }

            return transpiler.transpilers[node[TYPE]].transpile(node, parent, functionContext, blockContext);
        },

        transpileBlock: function (node, parent, functionContext) {
            var transpiler = this,
                ownBlockContext = new BlockContext(functionContext);

            if (node[TYPE] === Syntax.BlockStatement) {
                transpiler.transpileArray(node[BODY], parent, functionContext, ownBlockContext);
            } else {
                transpiler.transpile(node, parent, functionContext, ownBlockContext);
            }

            return {
                'type': Syntax.BlockStatement,
                'body': [
                    ownBlockContext.getSwitchStatement()
                ]
            };
        },

        transpileArray: function (array, parent, functionContext, blockContext) {
            var transpiler = this;

            util.each(array, function (statementNode) {
                transpiler.transpile(statementNode, parent, functionContext, blockContext);
            });
        }
    });

    return StatementTranspiler;
});
