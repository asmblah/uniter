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
    './interpreter/ScopeChain'
], function (
    util,
    PHPEnvironment,
    PHPError,
    PHPState,
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
        var valueFactory = state.getValueFactory(),
            result,
            scopeChain = new ScopeChain(stderr),
            tools = {
                valueFactory: valueFactory
            };

        scopeChain.push(state.getGlobalScope());

        if (context.localVariableNames.length > 0) {
            code = 'scopeChain.getCurrent().defineVariables(["' + context.localVariableNames.join('", "') + '"]);' + code;
        }

        // Program returns null rather than undefined if nothing is returned
        code += 'return tools.valueFactory.createNull();';

        try {
            /*jshint evil:true */
            result = new Function('stdin, stdout, stderr, tools, scopeChain', code)(stdin, stdout, stderr, tools, scopeChain);
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
                return interpret(node.target, {getValue: false}) + '.set(' + interpret(node.expression) + ');';
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
            'N_INLINE_HTML_STATEMENT': function (node) {
                return 'stdout.write(' + JSON.stringify(node.html) + ');';
            },
            'N_INTEGER': function (node) {
                return 'tools.valueFactory.createInteger(' + node.number + ')';
            },
            'N_PROGRAM': function (node, interpret, state, stdin, stdout, stderr) {
                var body = '',
                    context = {
                        localVariableNames: []
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
                    expression = '(' + expression + '.coerceToBoolean() ? ' + interpret(option.consequent) + ' : ' + interpret(option.alternate) + ')';
                });

                return expression;
            },
            'N_UNARY_EXPRESSION': function (node, interpret) {
                var operator = node.operator,
                    operand = interpret(node.operand, {getValue: operator !== '++' && operator !== '--'});

                return operand + '.' + unaryOperatorToMethod[node.prefix ? 'prefix' : 'suffix'][operator] + '()';
            },
            'N_VARIABLE': function (node, interpret, context) {
                var localVariableNames = context.localVariableNames;

                if (localVariableNames.indexOf(node.variable) === -1) {
                    localVariableNames.push(node.variable);
                }

                return 'scopeChain.getCurrent().getVariable("' + node.variable + '")' + (context.getValue !== false ? '.get()' : '');
            }
        }
    };
});
