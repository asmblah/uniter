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
    'js/util'
], function (
    util
) {
    'use strict';

    function evaluateModule(code, stdin, stdout, stderr) {
        /*jshint evil:true */
        return new Function('stdin, stdout, stderr', code)(stdin, stdout, stderr);
    }

    return {
        nodes: {
            'N_ARRAY_LITERAL': function (node, interpret) {
                var elementValues = [];

                util.each(node.elements, function (element) {
                    elementValues.push(interpret(element));
                });

                return '[' + elementValues.join(', ') + ']';
            },
            'N_ASSIGNMENT_STATEMENT': function (node, interpret) {
                var expression = interpret(node.expression);

                return node.target + ' = ' + expression + ';';
            },
            'N_EXPRESSION': function (node, interpret) {
                var expression = interpret(node.left);

                util.each(node.right, function (operation) {
                    var operator = operation.operator;

                    if (operator === '.') {
                        operator = '+';
                    }

                    expression += ' ' + operator + ' ' + interpret(operation.operand);
                });

                return '(' + expression + ')';
            },
            'N_INLINE_HTML_STATEMENT': function (node) {
                return 'stdout.write(' + JSON.stringify(node.html) + ');';
            },
            'N_PROGRAM': function (node, interpret, stdin, stdout, stderr) {
                var body = '';

                util.each(node.statements, function (statement) {
                    body += interpret(statement);
                });

                return evaluateModule(body, stdin, stdout, stderr);
            },
            'N_RETURN_STATEMENT': function (node, interpret) {
                var expression = interpret(node.expression);

                return 'return' + (expression ? ' ' + expression : '') + ';';
            },
            'N_STRING_LITERAL': function (node) {
                return '"' + node.string + '"';
            },
            'N_TERNARY': function (node, interpret) {
                var expression = '(' + interpret(node.condition) + ')';

                util.each(node.options, function (option) {
                    expression = '(' + expression + ' ? ' + interpret(option.consequent) + ' : ' + interpret(option.alternate) + ')';
                });

                return expression;
            }
        }
    };
});
