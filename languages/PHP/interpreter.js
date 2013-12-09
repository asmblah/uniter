/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*
 * PHP Interpreter
 */

/*global define */
define([
    'js/util',
    './interpreter/Environment',
    './interpreter/Error',
    './interpreter/State',
    './interpreter/Scope',
    './interpreter/ScopeChain'
], function (
    util,
    PHPEnvironment,
    PHPError,
    PHPState,
    Scope,
    ScopeChain
) {
    'use strict';

    var binaryOperatorToMethod = {
            '+': 'add',
            '-': 'subtract',
            '*': 'multiply',
            '/': 'divide',
            '.': 'concat',
            '<<': 'shiftLeftBy',
            '>>': 'shiftRightBy',
            '==': 'isEqualTo',
            '!=': 'isNotEqualTo',
            '===': 'isIdenticalTo',
            '!==': 'isNotIdenticalTo'
        },
        unaryOperatorToMethod = {
            prefix: {
                '+': 'toPositive',
                '-': 'toNegative',
                '++': 'preIncrement',
                '--': 'preDecrement',
                '~': 'onesComplement'
            },
            suffix: {
                '++': 'postIncrement',
                '--': 'postDecrement'
            }
        };

    function evaluateModule(state, code, context, stdin, stdout, stderr) {
        var namespace,
            namespaceCollection = state.getNamespaceCollection(),
            valueFactory = state.getValueFactory(),
            result,
            scopeChain = new ScopeChain(stderr),
            tools = {
                popScope: function () {
                    scopeChain.pop();
                },
                pushScope: function () {
                    scopeChain.push(new Scope(valueFactory));
                },
                valueFactory: valueFactory
            };

        namespace = namespaceCollection.get('\\');

        scopeChain.push(state.getGlobalScope());

        if (getKeys(context.localVariableNames).length > 0) {
            code = 'scopeChain.getCurrent().defineVariables(["' + getKeys(context.localVariableNames).join('", "') + '"]);' + code;
        }

        // Program returns null rather than undefined if nothing is returned
        code += 'return tools.valueFactory.createNull();';

        try {
            /*jshint evil:true */
            result = new Function('stdin, stdout, stderr, tools, scopeChain, namespace', code)(
                stdin, stdout, stderr, tools, scopeChain, namespace
            );
        } catch (exception) {
            if (exception instanceof PHPError) {
                stderr.write(exception.message);
            }

            throw exception;
        }

        return {
            type: result.getType(),
            value: result.get()
        };
    }

    function getKeys(object) {
        var keys = [];

        util.each(object, function (value, key) {
            keys.push(key);
        });

        return keys;
    }

    return {
        Environment: PHPEnvironment,
        State: PHPState,
        nodes: {
            'N_ARRAY_INDEX': function (node, interpret) {
                var indexValues = [];

                util.each(node.indices, function (index) {
                    indexValues.push(interpret(index.index));
                });

                return interpret(node.array) + '.getElement(' + indexValues.join(', scopeChain).getElement(') + ', scopeChain)';
            },
            'N_ARRAY_LITERAL': function (node, interpret) {
                var elementValues = [];

                util.each(node.elements, function (element) {
                    elementValues.push(interpret(element));
                });

                return 'tools.valueFactory.createArray([' + elementValues.join(', ') + '])';
            },
            'N_ASSIGNMENT_STATEMENT': function (node, interpret) {
                return interpret(node.target, {assignment: true, getValue: false}) + '.set(' + interpret(node.expression) + ');';
            },
            'N_BOOLEAN': function (node) {
                return 'tools.valueFactory.createBoolean(' + node.bool + ')';
            },
            'N_ECHO_STATEMENT': function (node, interpret) {
                return 'stdout.write(' + interpret(node.expression) + '.coerceToString().get());';
            },
            'N_EXPRESSION': function (node, interpret) {
                var expression = interpret(node.left);

                util.each(node.right, function (operation) {
                    expression += '.' + binaryOperatorToMethod[operation.operator] + '(' + interpret(operation.operand) + ')';
                });

                return expression;
            },
            'N_EXPRESSION_STATEMENT': function (node, interpret) {
                return interpret(node.expression) + ';';
            },
            'N_FLOAT': function (node) {
                return 'tools.valueFactory.createFloat(' + node.number + ')';
            },
            'N_FOREACH_STATEMENT': function (node, interpret, context) {
                var arrayValue = interpret(node.array),
                    arrayVariable,
                    code = '',
                    key = node.key ? interpret(node.key, {getValue: false}) : null,
                    value = interpret(node.value, {getValue: false});

                if (!context.foreach) {
                    context.foreach = {
                        depth: 0
                    };
                } else {
                    context.foreach.depth++;
                }

                // Ensure the iterator key (if specified) and value variables are defined
                if (key) {
                    context.localVariableNames[node.key.variable] = true;
                }

                context.localVariableNames[node.value.variable] = true;

                // Cache the value being iterated over
                arrayVariable = '__foreach__' + context.foreach.depth;
                code += 'var ' + arrayVariable + ' = ' + arrayValue + ';';

                // Loop management
                code += 'for (' + arrayVariable + '.reset(); ' + arrayVariable + '.getKey().get() < ' + arrayVariable + '.getLength().get(); ' + arrayVariable + '.next()) {';

                if (key) {
                    // Iterator key variable (if specified)
                    code += key + '.set(' + arrayVariable + '.getKey());';
                }

                // Iterator value variable
                code += value + '.set(' + arrayVariable + '.getElement(' + arrayVariable + '.getKey(), scopeChain));';

                util.each(node.statements, function (statement) {
                    code += interpret(statement);
                });

                code += '}';

                return code;
            },
            'N_FUNCTION_STATEMENT': function (node, interpret) {
                var args = [],
                    argumentAssignments = '',
                    body = '',
                    func,
                    localVariableNames = {},
                    variableDeclarations = '';

                util.each(node.args, function (arg) {
                    args.push(arg.variable);

                    // Define any arguments as local variables
                    localVariableNames[arg.variable] = true;
                });

                // Interpret statements first (will populate localVariableNames)
                util.each(node.statements, function (statement) {
                    body += interpret(statement, {localVariableNames: localVariableNames});
                });

                // Define local variables and arguments
                if (getKeys(localVariableNames).length > 0) {
                    variableDeclarations += 'scopeChain.getCurrent().defineVariables(["' + getKeys(localVariableNames).join('", "') + '"]);';
                }

                // Copy passed values for any arguments
                util.each(args, function (arg) {
                    argumentAssignments += 'scopeChain.getCurrent().getVariable("' + arg + '", scopeChain).set(' + arg + ');';
                });

                // Prepend parts in correct order
                body = variableDeclarations + argumentAssignments + body;

                // Add scope handling logic
                body = 'try { tools.pushScope(); ' + body + ' } finally { tools.popScope(); }';

                // Build function expression
                func = 'function (' + args.join(', ') + ') {' + body + '}';

                return 'namespace.defineFunction(' + JSON.stringify(node.func) + ', ' + func + ');';
            },
            'N_FUNCTION_CALL': function (node, interpret) {
                var args = [];

                util.each(node.args, function (arg) {
                    args.push(interpret(arg));
                });

                return 'namespace.getFunction(' + JSON.stringify(node.func) + ')(' + args + ')';
            },
            'N_IF_STATEMENT': function (node, interpret) {
                var alternateCode = '',
                    consequentCode = '';

                // Consequent statements are executed if the condition is truthy
                util.each(node.consequentStatements, function (statement) {
                    consequentCode += interpret(statement);
                });

                // Alternate statements are executed if the condition is falsy
                util.each(node.alternateStatements, function (statement) {
                    alternateCode += interpret(statement);
                });

                return 'if (' + interpret(node.condition) + '.coerceToBoolean().get()) {' + consequentCode + '} else {' + alternateCode + '}';
            },
            'N_INLINE_HTML_STATEMENT': function (node) {
                return 'stdout.write(' + JSON.stringify(node.html) + ');';
            },
            'N_INTEGER': function (node) {
                return 'tools.valueFactory.createInteger(' + node.number + ')';
            },
            'N_PROGRAM': function (node, interpret, state, stdin, stdout, stderr) {
                var body = '',
                    context = {
                        localVariableNames: {}
                    };

                util.each(node.statements, function (statement) {
                    body += interpret(statement, context);
                });

                return evaluateModule(state, body, context, stdin, stdout, stderr);
            },
            'N_RETURN_STATEMENT': function (node, interpret) {
                var expression = interpret(node.expression);

                return 'return' + (expression ? ' ' + expression : '') + ';';
            },
            'N_STRING_LITERAL': function (node) {
                return 'tools.valueFactory.createString(' + JSON.stringify(node.string) + ')';
            },
            'N_TERNARY': function (node, interpret) {
                var expression = '(' + interpret(node.condition) + ')';

                util.each(node.options, function (option) {
                    expression = '(' + expression + '.coerceToBoolean().get() ? ' + interpret(option.consequent) + ' : ' + interpret(option.alternate) + ')';
                });

                return expression;
            },
            'N_UNARY_EXPRESSION': function (node, interpret) {
                var operator = node.operator,
                    operand = interpret(node.operand, {getValue: operator !== '++' && operator !== '--'});

                return operand + '.' + unaryOperatorToMethod[node.prefix ? 'prefix' : 'suffix'][operator] + '()';
            },
            'N_VARIABLE': function (node, interpret, context) {
                // Track any implicit variable declarations
                if (context.assignment) {
                    context.localVariableNames[node.variable] = true;
                }

                return 'scopeChain.getCurrent().getVariable("' + node.variable + '", scopeChain)' + (context.getValue !== false ? '.get()' : '');
            }
        }
    };
});
