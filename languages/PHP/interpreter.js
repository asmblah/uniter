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
    './interpreter/builtin/builtins',
    'js/util',
    'js/Exception',
    './interpreter/KeyValuePair',
    './interpreter/LabelRepository',
    './interpreter/List',
    './interpreter/Environment',
    './interpreter/Error',
    './interpreter/State',
    'js/Promise',
    './interpreter/Scope'
], function (
    builtinTypes,
    util,
    Exception,
    KeyValuePair,
    LabelRepository,
    List,
    PHPEnvironment,
    PHPError,
    PHPState,
    Promise,
    Scope
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
            '!==': 'isNotIdenticalTo',
            '<': 'isLessThan',
            '=': {
                'false': 'setValue',
                'true': 'setReference'
            }
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
        var globalNamespace = state.getGlobalNamespace(),
            valueFactory = state.getValueFactory(),
            promise = new Promise(),
            referenceFactory = state.getReferenceFactory(),
            result,
            scopeChain = state.getScopeChain(),
            tools = {
                createInstance: function (namespace, classNameValue) {
                    var className = classNameValue.getNative(),
                        classData = namespace.getClass(className),
                        object = new classData.Class();

                    return valueFactory.createObject(object, classData.name);
                },
                createKeyValuePair: function (key, value) {
                    return new KeyValuePair(key, value);
                },
                createList: function (elements) {
                    return new List(elements);
                },
                implyArray: function (variable) {
                    // Undefined variables and variables containing null may be implicitly converted to arrays
                    if (!variable.isDefined() || variable.getValue().getType() === 'null') {
                        variable.setValue(valueFactory.createArray([]));
                    }

                    return variable.getValue();
                },
                popScope: function () {
                    scopeChain.pop();
                },
                pushScope: function () {
                    scopeChain.push(new Scope(scopeChain, valueFactory));
                },
                referenceFactory: referenceFactory,
                valueFactory: valueFactory
            };

        scopeChain.push(state.getGlobalScope());

        (function () {
            var internals = {
                    scopeChain: scopeChain,
                    stdout: stdout,
                    valueFactory: valueFactory
                };

            util.each(builtinTypes.functionGroups, function (groupFactory) {
                var groupBuiltins = groupFactory(internals);

                util.each(groupBuiltins, function (fn, name) {
                    globalNamespace.defineFunction(name, fn);
                });
            });

            util.each(builtinTypes.classes, function (classFactory, name) {
                var Class = classFactory(internals);

                globalNamespace.defineClass(name, Class);
            });
        }());

        // Program returns null rather than undefined if nothing is returned
        code += 'return tools.valueFactory.createNull();';

        try {
            /*jshint evil:true */
            result = new Function('stdin, stdout, stderr, tools, scopeChain, namespace', code)(
                stdin, stdout, stderr, tools, scopeChain, globalNamespace
            );
        } catch (exception) {
            if (exception instanceof PHPError) {
                stderr.write(exception.message);

                return promise.reject(exception);
            }

            throw exception;
        }

        return promise.resolve(result.getNative(), result.getType());
    }

    function hoistDeclarations(statements) {
        var declarations = [],
            nonDeclarations = [];

        util.each(statements, function (statement) {
            if (/^N_(CLASS|FUNCTION)_STATEMENT$/.test(statement.name)) {
                declarations.push(statement);
            } else {
                nonDeclarations.push(statement);
            }
        });

        return declarations.concat(nonDeclarations);
    }

    function interpretFunction(argNodes, statementNodes, interpret) {
        var args = [],
            argumentAssignments = '',
            body = '',
            variableDeclarations = '';

        util.each(argNodes, function (arg) {
            args.push(arg.variable);
        });

        // Interpret statements first
        util.each(hoistDeclarations(statementNodes), function (statement) {
            body += interpret(statement);
        });

        // Copy passed values for any arguments
        util.each(args, function (arg, index) {
            argumentAssignments += 'scopeChain.getCurrent().getVariable("' + arg + '").setValue($' + arg + ');';
            args[index] = '$' + arg;
        });

        // Prepend parts in correct order
        body = variableDeclarations + argumentAssignments + body;

        // Add scope handling logic
        body = 'try { tools.pushScope(); ' + body + ' } finally { tools.popScope(); }';

        // Build function expression
        return 'function (' + args.join(', ') + ') {' + body + '}';
    }

    return {
        Environment: PHPEnvironment,
        State: PHPState,
        nodes: {
            'N_ARRAY_INDEX': function (node, interpret, context) {
                var arrayVariableCode,
                    indexValues = [],
                    suffix = '';

                util.each(node.indices, function (index) {
                    indexValues.push(interpret(index.index, {assignment: false, getValue: false}));
                });

                if (context.assignment) {
                    arrayVariableCode = 'tools.implyArray(' + interpret(node.array, {getValue: false}) + ')';
                } else {
                    suffix = '.getValue()';
                    arrayVariableCode = interpret(node.array, {getValue: true});
                }

                return arrayVariableCode + '.getElementByKey(' + indexValues.join(').getValue().getElementByKey(') + ')' + suffix;
            },
            'N_ARRAY_LITERAL': function (node, interpret) {
                var elementValues = [];

                util.each(node.elements, function (element) {
                    elementValues.push(interpret(element));
                });

                return 'tools.valueFactory.createArray([' + elementValues.join(', ') + '])';
            },
            'N_BOOLEAN': function (node) {
                return 'tools.valueFactory.createBoolean(' + node.bool + ')';
            },
            'N_CLASS_REFERENCE': function (node) {
                return 'tools.valueFactory.createString(' + JSON.stringify(node.path) + ')';
            },
            'N_CLASS_STATEMENT': function (node, interpret) {
                var code,
                    methodCodes = [],
                    propertyCodes = [];

                util.each(node.members, function (member) {
                    var data = interpret(member);

                    if (member.name === 'N_PROPERTY_DEFINITION') {
                        propertyCodes.push('"' + data.name + '": ' + data.value);
                    } else if (member.name === 'N_METHOD_DEFINITION') {
                        methodCodes.push('"' + data.name + '": ' + data.body);
                    }
                });

                code = '{properties: {' + propertyCodes.join(', ') + '}, methods: {' + methodCodes.join(', ') + '}}';

                return 'namespace.defineClass(' + interpret(node.className) + '.getNative(), ' + code + ');';
            },
            'N_COMPOUND_STATEMENT': function (node, interpret) {
                var code = '';

                util.each(node.statements, function (statement) {
                    code += interpret(statement);
                });

                return code;
            },
            'N_ECHO_STATEMENT': function (node, interpret) {
                return 'stdout.write(' + interpret(node.expression) + '.coerceToString().getNative());';
            },
            'N_EXPRESSION': function (node, interpret) {
                var isAssignment = node.right[0].operator === '=',
                    expression = interpret(node.left, {assignment: isAssignment, getValue: !isAssignment});

                util.each(node.right, function (operation) {
                    var isReference = false,
                        method,
                        valuePostProcess = '';

                    if (isAssignment && operation.operand.reference) {
                        isReference = true;
                        valuePostProcess = '.getReference()';
                    }

                    method = binaryOperatorToMethod[operation.operator];

                    if (util.isPlainObject(method)) {
                        method = method[isReference];
                    }

                    expression += '.' + method + '(' + interpret(operation.operand, {getValue: !isReference}) + valuePostProcess + ')';
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
                    lengthVariable,
                    pointerVariable,
                    value = interpret(node.value, {getValue: false});

                if (!context.foreach) {
                    context.foreach = {
                        depth: 0
                    };
                } else {
                    context.foreach.depth++;
                }

                arrayVariable = 'array_' + context.foreach.depth;

                // Cache the value being iterated over and reset the internal array pointer before the loop
                code += 'var ' + arrayVariable + ' = ' + arrayValue + '.reset();';

                lengthVariable = 'length_' + context.foreach.depth;
                code += 'var ' + lengthVariable + ' = ' + arrayVariable + '.getLength();';
                pointerVariable = 'pointer_' + context.foreach.depth;
                code += 'var ' + pointerVariable + ' = 0;';

                // Loop management
                code += 'while (' + pointerVariable + ' < ' + lengthVariable + ') {';

                if (key) {
                    // Iterator key variable (if specified)
                    code += key + '.setValue(' + arrayVariable + '.getKeyByIndex(' + pointerVariable + '));';
                }

                // Iterator value variable
                code += value + '.set' + (node.value.reference ? 'Reference' : 'Value') + '(' + arrayVariable + '.getElementByIndex(' + pointerVariable + ')' + (node.value.reference ? '' : '.getValue()') + ');';

                // Set pointer to next element at start of loop body as per spec
                code += pointerVariable + '++;';

                util.each(hoistDeclarations(node.statements), function (statement) {
                    code += interpret(statement);
                });

                code += '}';

                return code;
            },
            'N_FUNCTION_STATEMENT': function (node, interpret) {
                var func = interpretFunction(node.args, node.statements, interpret);

                return 'namespace.defineFunction(' + JSON.stringify(node.func) + ', ' + func + ');';
            },
            'N_FUNCTION_CALL': function (node, interpret) {
                var args = [];

                util.each(node.args, function (arg) {
                    args.push(interpret(arg));
                });

                return '(namespace.getFunction(' + interpret(node.func, {getValue: true}) + '.getNative())(' + args.join(', ') + ') || tools.valueFactory.createNull())';
            },
            'N_GOTO_STATEMENT': function (node, interpret, context) {
                var label = node.label;

                context.labelRepository.addPending(label);

                return label + ': { goingToLabel_' + label + ' = true; break ' + label + ';';
            },
            'N_IF_STATEMENT': function (node, interpret, context) {
                // Consequent statements are executed if the condition is truthy,
                // Alternate statements are executed if the condition is falsy
                var alternateCode,
                    code = '',
                    conditionCode = interpret(node.condition) + '.coerceToBoolean().getNative()',
                    consequentCode,
                    consequentPrefix = '',
                    foundLabels = false,
                    labelRepository = context.labelRepository;

                if (labelRepository.hasPending()) {
                    labelRepository.onFound(function (label) {
                        // Label for goto is contained within consequent statement(s)
                        if (!foundLabels) {
                            foundLabels = true;
                            code += '}';
                        }

                        consequentPrefix = 'if (!' + 'goingToLabel_' + label + ') {' + consequentPrefix;
                        conditionCode = 'goingToLabel_' + label + ' || (' + conditionCode + ')';
                    });
                }

                consequentCode = interpret(node.consequentStatement);
                consequentCode = '{' + consequentPrefix + consequentCode + '}';

                alternateCode = node.alternateStatement ? ' else ' + interpret(node.alternateStatement) : '';

                code += 'if (' + conditionCode + ') ' + consequentCode + alternateCode;

                return code;
            },
            'N_INLINE_HTML_STATEMENT': function (node) {
                return 'stdout.write(' + JSON.stringify(node.html) + ');';
            },
            'N_INTEGER': function (node) {
                return 'tools.valueFactory.createInteger(' + node.number + ')';
            },
            'N_ISSET': function (node, interpret) {
                var issets = [];

                util.each(node.variables, function (variable) {
                    issets.push(interpret(variable, {getValue: false}) + '.isSet()');
                });

                return '(function (scope) {scope.suppressErrors();' +
                    'var result = tools.valueFactory.createBoolean(' + issets.join(' && ') + ');' +
                    'scope.unsuppressErrors(); return result;}(scopeChain.getCurrent()))';
            },
            'N_KEY_VALUE_PAIR': function (node, interpret) {
                return 'tools.createKeyValuePair(' + interpret(node.key) + ', ' + interpret(node.value) + ')';
            },
            'N_LABEL_STATEMENT': function (node, interpret, context) {
                context.labelRepository.found(node.label);

                return '}';
            },
            'N_LIST': function (node, interpret) {
                var elementsCodes = [];

                util.each(node.elements, function (element) {
                    elementsCodes.push(interpret(element, {getValue: false}));
                });

                return 'tools.createList([' + elementsCodes.join(',') + '])';
            },
            'N_METHOD_CALL': function (node, interpret) {
                var code = '';

                util.each(node.calls, function (call) {
                    var args = [];

                    util.each(call.args, function (arg) {
                        args.push(interpret(arg));
                    });

                    code += '.callMethod(' + interpret(call.func) + ', [' + args.join(', ') + '])';
                });

                return interpret(node.object) + code;
            },
            'N_METHOD_DEFINITION': function (node, interpret) {
                var body = '';

                util.each(hoistDeclarations(node.statements), function (statement) {
                    body += interpret(statement);
                });

                return {
                    name: interpret(node.func),
                    body: interpretFunction(node.args, node.statements, interpret)
                };
            },
            'N_NAMESPACE_STATEMENT': function (node, interpret) {
                var body = '';

                util.each(hoistDeclarations(node.statements), function (statement) {
                    body += interpret(statement);
                });

                return '(function (globalNamespace) {var namespace = globalNamespace.getDescendant(' + JSON.stringify(node.namespace) + ');' + body + '}(namespace));';
            },
            'N_NEW_EXPRESSION': function (node, interpret) {
                return 'tools.createInstance(namespace, ' + interpret(node.className) + ')';
            },
            'N_OBJECT_PROPERTY': function (node, interpret, context) {
                var objectVariableCode,
                    propertyCode = '',
                    suffix = '';

                if (context.assignment) {
                    objectVariableCode = 'tools.implyArray(' + interpret(node.object, {getValue: false}) + ')';
                } else {
                    suffix = '.getValue()';
                    objectVariableCode = interpret(node.object, {getValue: true});
                }

                util.each(node.properties, function (property, index) {
                    var keyValue = interpret(property.property, {assignment: false, getValue: false});

                    propertyCode += '.getElementByKey(' + keyValue + ')';

                    if (index < node.properties.length - 1) {
                        propertyCode += '.getValue()';
                    }
                });

                return objectVariableCode + propertyCode + suffix;
            },
            'N_PRINT_EXPRESSION': function (node, interpret) {
                return '(stdout.write(' + interpret(node.operand) + '.coerceToString().getNative()), tools.valueFactory.createInteger(1))';
            },
            'N_PROGRAM': function (node, interpret, state, stdin, stdout, stderr) {
                var body = '',
                    context = {
                        labelRepository: new LabelRepository()
                    },
                    labels;

                util.each(hoistDeclarations(node.statements), function (statement) {
                    body += interpret(statement, context);
                });

                labels = context.labelRepository.getLabels();

                if (labels.length > 0) {
                    body = 'var goingToLabel_' + labels.join(' = false, ') + ' = false;' + body;
                }

                return evaluateModule(state, body, context, stdin, stdout, stderr);
            },
            'N_PROPERTY_DEFINITION': function (node, interpret) {
                return {
                    name: node.variable.variable,
                    value: node.value ? interpret(node.value) : 'null'
                };
            },
            'N_RETURN_STATEMENT': function (node, interpret) {
                var expression = interpret(node.expression);

                return 'return' + (expression ? ' ' + expression : '') + ';';
            },
            'N_STRING': function (node) {
                switch (node.string) {
                case 'null':
                    return 'tools.valueFactory.createNull()';
                default:
                    return 'tools.valueFactory.createString(' + JSON.stringify(node.string) + ')';
                }
            },
            'N_STRING_EXPRESSION': function (node, interpret) {
                var codes = [];

                util.each(node.parts, function (part) {
                    codes.push(interpret(part) + '.coerceToString().getNative()');
                });

                return 'tools.valueFactory.createString(' + codes.join(' + ') + ')';
            },
            'N_STRING_LITERAL': function (node) {
                return 'tools.valueFactory.createString(' + JSON.stringify(node.string) + ')';
            },
            'N_TERNARY': function (node, interpret) {
                var expression = '(' + interpret(node.condition) + ')';

                util.each(node.options, function (option) {
                    expression = '(' + expression + '.coerceToBoolean().getNative() ? ' + interpret(option.consequent) + ' : ' + interpret(option.alternate) + ')';
                });

                return expression;
            },
            'N_UNARY_EXPRESSION': function (node, interpret) {
                var operator = node.operator,
                    operand = interpret(node.operand, {getValue: operator !== '++' && operator !== '--'});

                return operand + '.' + unaryOperatorToMethod[node.prefix ? 'prefix' : 'suffix'][operator] + '()';
            },
            'N_VARIABLE': function (node, interpret, context) {
                return 'scopeChain.getCurrent().getVariable("' + node.variable + '")' + (context.getValue !== false ? '.getValue()' : '');
            },
            'N_VARIABLE_EXPRESSION': function (node, interpret, context) {
                return 'scopeChain.getCurrent().getVariable(' + interpret(node.expression) + '.getNative())' + (context.getValue !== false ? '.getValue()' : '');
            },
            'N_VOID': function () {
                return 'tools.referenceFactory.createNull()';
            },
            'N_WHILE_STATEMENT': function (node, interpret) {
                var code = '';

                util.each(hoistDeclarations(node.statements), function (statement) {
                    code += interpret(statement);
                });

                return 'while (' + interpret(node.condition) + '.coerceToBoolean().getNative()) {' + code + '}';
            }
        }
    };
});
