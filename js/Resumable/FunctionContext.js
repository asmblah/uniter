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

    var DECLARATIONS = 'declarations',
        Syntax = estraverse.Syntax;

    function FunctionContext() {
        this.assignmentVariables = {};
        this.functionDeclarations = [];
        this.nextStatementIndex = 0;
        this.nextTempIndex = 0;
        this.parameters = [];
        this.variables = [];
        this.variablesToTemps = {};
    }

    util.extend(FunctionContext.prototype, {
        addAssignment: function (index, variableName) {
            this.assignmentVariables[index] = variableName;
        },

        addFunctionDeclaration: function (declaration) {
            this.functionDeclarations.push(declaration);
        },

        addParameter: function (name) {
            this.parameters.push(name);
        },

        addVariable: function (name) {
            this.variables.push(name);
        },

        getNextStatementIndex: function () {
            return this.nextStatementIndex++;
        },

        getStatements: function (switchStatement) {
            var assignmentProperties = [],
                declaration = esprima.parse('var statementIndex = 0;').body[0],
                functionContext = this,
                index,
                statements = [],
                stateProperties = [],
                stateSetup = esprima.parse('if (Resumable._resumeState_) { statementIndex = Resumable._resumeState_.statementIndex; }').body[0];

            util.each(functionContext.variables, function (name) {
                declaration[DECLARATIONS].push({
                    'type': Syntax.VariableDeclarator,
                    'id': {
                        'type': Syntax.Identifier,
                        'name': name
                    },
                    'init': null
                });
            });

            util.each(functionContext.parameters.concat(functionContext.variables), function (name) {
                stateProperties.push({
                    'type': Syntax.Property,
                    'kind': 'init',
                    'key': {
                        'type': Syntax.Identifier,
                        'name': name
                    },
                    'value': {
                        'type': Syntax.Identifier,
                        'name': name
                    }
                });
            });

            for (index = 0; index < functionContext.nextTempIndex; index++) {
                stateProperties.push({
                    'type': Syntax.Property,
                    'kind': 'init',
                    'key': {
                        'type': Syntax.Identifier,
                        'name': 'temp' + index
                    },
                    'value': {
                        'type': Syntax.Identifier,
                        'name': 'temp' + index
                    }
                });

                declaration.declarations.push({
                    'type': Syntax.VariableDeclarator,
                    'id': {
                        'type': Syntax.Identifier,
                        'name': 'temp' + index
                    },
                    'init': null
                });

                stateSetup.consequent.body.push({
                    'type': Syntax.ExpressionStatement,
                    'expression': {
                        'type': Syntax.AssignmentExpression,
                        'operator': '=',
                        'left': {
                            'type': Syntax.Identifier,
                            'name': 'temp' + index,
                        },
                        'right': esprima.parse('Resumable._resumeState_.temp' + index).body[0].expression
                    }
                });
            }

            stateSetup.consequent.body.push(esprima.parse('Resumable._resumeState_ = null;').body[0]);

            util.each(functionContext.assignmentVariables, function (variableName, statementIndex) {
                assignmentProperties.push({
                    'type': Syntax.Property,
                    'kind': 'init',
                    'key': {
                        'type': Syntax.Literal,
                        'value': statementIndex
                    },
                    'value': {
                        'type': Syntax.Literal,
                        'value': variableName
                    }
                });
            }, {keys: true});

            statements.push(declaration);
            [].push.apply(statements, functionContext.functionDeclarations);
            statements.push({
                type: Syntax.ReturnStatement,
                argument: {
                    type: Syntax.CallExpression,
                    arguments: [],
                    callee: {
                        type: Syntax.FunctionExpression,
                        id: {
                            type: Syntax.Identifier,
                            name: 'resumableScope'
                        },
                        params: [],
                        body: {
                            type: Syntax.BlockStatement,
                            body: [
                                stateSetup,
                                {
                                    type: Syntax.TryStatement,
                                    block: {
                                        type: Syntax.BlockStatement,
                                        body: [
                                            switchStatement
                                        ]
                                    },
                                    handler: {
                                        type: Syntax.CatchClause,
                                        param: {
                                            type: Syntax.Identifier,
                                            name: 'e'
                                        },
                                        body: {
                                            type: Syntax.BlockStatement,
                                            body: [
                                                {
                                                    type: Syntax.IfStatement,
                                                    test: esprima.parse('e instanceof Resumable.PauseException').body[0].expression,
                                                    consequent: {
                                                        type: Syntax.BlockStatement,
                                                        body: [
                                                            {
                                                                type: Syntax.ExpressionStatement,
                                                                expression: {
                                                                    type: Syntax.CallExpression,
                                                                    callee: {
                                                                        type: Syntax.MemberExpression,
                                                                        object: {
                                                                            type: Syntax.Identifier,
                                                                            name: 'e'
                                                                        },
                                                                        property: {
                                                                            type: Syntax.Identifier,
                                                                            name: 'add'
                                                                        },
                                                                        computed: false
                                                                    },
                                                                    arguments: [
                                                                        {
                                                                            type: Syntax.ObjectExpression,
                                                                            properties: [
                                                                                {
                                                                                    type: Syntax.Property,
                                                                                    kind: 'init',
                                                                                    key: {
                                                                                        type: Syntax.Identifier,
                                                                                        name: 'func'
                                                                                    },
                                                                                    value: {
                                                                                        type: Syntax.Identifier,
                                                                                        name: 'resumableScope'
                                                                                    }
                                                                                },
                                                                                {
                                                                                    type: Syntax.Property,
                                                                                    kind: 'init',
                                                                                    key: {
                                                                                        type: Syntax.Identifier,
                                                                                        name: 'statementIndex'
                                                                                    },
                                                                                    value: {
                                                                                        type: Syntax.Identifier,
                                                                                        name: 'statementIndex'
                                                                                    }
                                                                                },
                                                                                {
                                                                                    type: Syntax.Property,
                                                                                    kind: 'init',
                                                                                    key: {
                                                                                        type: Syntax.Identifier,
                                                                                        name: 'assignments'
                                                                                    },
                                                                                    value: {
                                                                                        type: Syntax.ObjectExpression,
                                                                                        properties: assignmentProperties
                                                                                    }
                                                                                }
                                                                            ].concat(stateProperties)
                                                                        }
                                                                    ]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    type: Syntax.ThrowStatement,
                                                    argument: {
                                                        type: Syntax.Identifier,
                                                        name: 'e'
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            });

            return statements;
        },

        getTempName: function () {
            return 'temp' + this.nextTempIndex++;
        },

        getTempNameForVariable: function (variableName, blockContext) {
            var context = this,
                tempName;

            if (context.variablesToTemps[variableName]) {
                return context.variablesToTemps[variableName];
            }

            tempName = context.getTempName();
            context.variablesToTemps[variableName] = tempName;

            blockContext.addAssignment(tempName).assign({
                'type': Syntax.Identifier,
                'name': variableName
            });

            return tempName;
        }
    });

    return FunctionContext;
});
