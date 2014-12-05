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

    var KEY = 'key',
        KIND = 'kind',
        VALUE = 'value',
        Syntax = estraverse.Syntax;

    function PropertyTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(PropertyTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.Property;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            return {
                'type': Syntax.Property,
                'key': node[KEY],
                'value': transpiler.expressionTranspiler.transpile(
                    node[VALUE],
                    node,
                    functionContext,
                    blockContext
                ),
                'kind': node[KIND]
            };
        }
    });

    return PropertyTranspiler;
});
