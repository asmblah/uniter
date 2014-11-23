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
    'js/util'
], function (
    esprima,
    estraverse,
    util
) {
    'use strict';

    var Syntax = estraverse.Syntax;

    function BlockContext(functionContext) {
        this.functionContext = functionContext;
        this.switchCases = [];
    }

    util.extend(BlockContext.prototype, {
        addAssignment: function (name) {
            var context = this,
                index = context.functionContext.getNextStatementIndex();

            return {
                assign: function (expressionNode) {
                    if (!expressionNode) {
                        throw new Error('Expression node must be specified');
                    }

                    context.functionContext.addAssignment(index, name);

                    context.switchCases[index] = createSwitchCase(
                        {
                            'type': Syntax.ExpressionStatement,
                            'expression': {
                                'type': Syntax.AssignmentExpression,
                                'operator': '=',
                                'left': {
                                    'type': Syntax.Identifier,
                                    'name': name
                                },
                                'right': expressionNode
                            }
                        },
                        index
                    );
                }
            };
        },

        getSwitchStatement: function () {
            var switchCases = [];

            util.each(this.switchCases, function (switchCase) {
                if (switchCase) {
                    if (util.isArray(switchCase)) {
                        [].push.apply(switchCases, switchCase);
                    } else {
                        switchCases.push(switchCase);
                    }
                }
            });

            return {
                'type': Syntax.SwitchStatement,
                'discriminant': {
                    'type': Syntax.Identifier,
                    'name': 'statementIndex'
                },
                'cases': switchCases
            };
        },

        prepareStatement: function () {
            var context = this,
                index = context.functionContext.getNextStatementIndex();

            return {
                assign: function (statementNode) {
                    var currentIndex = context.functionContext.getCurrentStatementIndex(),
                        i,
                        switchCases = [];

                    for (i = index; i < currentIndex - 1; i++) {
                        switchCases.push({
                            type: Syntax.SwitchCase,
                            test: {
                                type: Syntax.Literal,
                                value: i
                            },
                            consequent: i === index ? [
                                esprima.parse('statementIndex = ' + (index + 1) + ';').body[0]
                            ] : []
                        });
                    }

                    switchCases.push(createSwitchCase(statementNode, currentIndex - 1));

                    context.switchCases[index] = switchCases;
                },

                getIndex: function () {
                    return index;
                }
            };
        }
    });

    function createSwitchCase(statementNode, index) {
        return {
            type: Syntax.SwitchCase,
            test: {
                type: Syntax.Literal,
                value: index
            },
            consequent: [
                statementNode,
                esprima.parse('statementIndex = ' + (index + 1) + ';').body[0]
            ]
        };
    }

    return BlockContext;
});
