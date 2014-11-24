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

    function ExpressionTranspiler() {
        this.transpilers = {};
    }

    util.extend(ExpressionTranspiler.prototype, {
        addTranspiler: function (transpiler) {
            this.transpilers[transpiler.getNodeType()] = transpiler;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            if (!hasOwn.call(transpiler.transpilers, node[TYPE])) {
                return node;
            }

            return transpiler.transpilers[node[TYPE]].transpile(node, parent, functionContext, blockContext);
        },

        transpileArray: function (array, parent, functionContext, blockContext) {
            var result = [],
                transpiler = this;

            util.each(array, function (expressionNode) {
                result.push(transpiler.transpile(expressionNode, parent, functionContext, blockContext));
            });

            return result;
        }
    });

    return ExpressionTranspiler;
});
