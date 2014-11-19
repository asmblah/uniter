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

    var TYPE = 'type',
        hasOwn = {}.hasOwnProperty;

    function StatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
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

        transpileArray: function (array, parent, functionContext, blockContext) {
            var transpiler = this;

            util.each(array, function (statementNode) {
                transpiler.transpile(statementNode, parent, functionContext, blockContext);
            });
        }
    });

    return StatementTranspiler;
});
