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
    './interpreter/Call',
    'js/Exception/Exception',
    './interpreter/KeyValuePair',
    './interpreter/LabelRepository',
    './interpreter/List',
    './interpreter/NamespaceScope',
    './interpreter/Value/Object',
    './interpreter/Environment',
    './interpreter/Error',
    './interpreter/Error/Fatal',
    './interpreter/State',
    'js/Promise',
    './interpreter/Scope'
], function (
    util,
    Call,
    Exception,
    KeyValuePair,
    LabelRepository,
    List,
    NamespaceScope,
    ObjectValue,
    PHPEnvironment,
    PHPError,
    PHPFatalError,
    PHPState,
    Promise,
    Scope
) {
    'use strict';

    var INVOKE_MAGIC_METHOD = '__invoke',
        INCLUDE_OPTION = 'include',
        binaryOperatorToMethod = {
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
        hasOwn = {}.hasOwnProperty,
        unaryOperatorToMethod = {
            prefix: {
                '+': 'toPositive',
                '-': 'toNegative',
                '++': 'preIncrement',
                '--': 'preDecrement',
                '~': 'onesComplement',
                '!': 'logicalNot'
            },
            suffix: {
                '++': 'postIncrement',
                '--': 'postDecrement'
            }
        };

    function evaluateModule(state, code, context, stdin, stdout, stderr) {
        function include(path) {
            var done = false,
                promise = new Promise(),
                pause = null,
                result;

            function completeWith(moduleResult) {
                if (pause) {
                    pause.resume(moduleResult);
                } else {
                    result = moduleResult;
                }
            }

            promise.done(function (contents) {
                done = true;

                engine.execute(contents, path).done(function (resultNative) {
                    // TODO: This is inefficient, we should just have access to the Value object
                    completeWith(valueFactory.coerce(resultNative));
                }).fail(function (exception) {
                    throw exception;
                });
            }).fail(function () {
                done = true;

                callStack.raiseError(PHPError.E_WARNING, 'include(' + path + '): failed to open stream: No such file or directory');
                callStack.raiseError(PHPError.E_WARNING, 'include(): Failed opening \'' + path + '\' for inclusion');

                completeWith(valueFactory.createNull());
            });

            if (!options[INCLUDE_OPTION]) {
                throw new Exception('include() :: No "include" transport is available for loading the module.');
            }

            options[INCLUDE_OPTION](path, promise);

            if (done) {
                return result;
            }

            pause = resumable.createPause();
            pause.now();
        }

        var engine = state.getEngine(),
            exports = {},
            globalNamespace = state.getGlobalNamespace(),
            valueFactory = state.getValueFactory(),
            promise = new Promise(),
            referenceFactory = state.getReferenceFactory(),
            callStack = state.getCallStack(),
            globalScope = state.getGlobalScope(),
            options = state.getOptions(),
            resumable = state.getResumable(),
            tools = {
                createClosure: function (func) {
                    func[INVOKE_MAGIC_METHOD] = func;
                    return tools.valueFactory.createObject(
                        func,
                        globalNamespace.getClass('Closure')
                    );
                },
                createInstance: function (namespaceScope, classNameValue, args) {
                    var className = classNameValue.getNative(),
                        classObject = namespaceScope.getClass(className);

                    return classObject.instantiate(args);
                },
                createKeyValuePair: function (key, value) {
                    return new KeyValuePair(key, value);
                },
                createList: function (elements) {
                    return new List(elements);
                },
                createNamespaceScope: function (namespace) {
                    return new NamespaceScope(globalNamespace, namespace);
                },
                getPath: function () {
                    return valueFactory.createString(context.path);
                },
                getPathDirectory: function () {
                    return valueFactory.createString(state.getPath().replace(/\/[^\/]+$/, ''));
                },
                implyArray: function (variable) {
                    // Undefined variables and variables containing null may be implicitly converted to arrays
                    if (!variable.isDefined() || variable.getValue().getType() === 'null') {
                        variable.setValue(valueFactory.createArray([]));
                    }

                    return variable.getValue();
                },
                implyObject: function (variable) {
                    return variable.getValue();
                },
                include: include,
                popCall: function () {
                    callStack.pop();
                },
                pushCall: function (thisObject, currentClass) {
                    var call;

                    if (!valueFactory.isValue(thisObject)) {
                        thisObject = null;
                    }

                    call = new Call(new Scope(callStack, valueFactory, thisObject, currentClass));

                    callStack.push(call);

                    return call;
                },
                referenceFactory: referenceFactory,
                requireOnce: include,
                require: include,
                throwNoActiveClassScope: function () {
                    throw new PHPFatalError(PHPFatalError.SELF_WHEN_NO_ACTIVE_CLASS);
                },
                valueFactory: valueFactory
            },
            PHPException = state.getPHPExceptionClass();

        // Push the 'main' global scope call onto the stack
        callStack.push(new Call(globalScope));

        code = 'var namespaceScope = tools.createNamespaceScope(namespace), namespaceResult, scope = globalScope, currentClass = null;' + code;

        // Program returns null rather than undefined if nothing is returned
        code += 'return tools.valueFactory.createNull();';

        code = 'exports.result = (function () {' + code + '}());';

        resumable.execute(code, {
            expose: {
                exports: exports,
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                tools: tools,
                callStack: callStack,
                globalScope: globalScope,
                namespace: globalNamespace
            }
        }).done(function () {
            promise.resolve(exports.result.getNative(), exports.result.getType());
        }).fail(function (exception) {
            if (exception instanceof ObjectValue) {
                // Uncaught PHP Exceptions become E_FATAL errors
                (function (value) {
                    var exception = value.getNative();

                    if (!exception instanceof PHPException) {
                        throw new Exception('Weird value class thrown: ' + value.getClassName());
                    }

                    exception = new PHPFatalError(PHPFatalError.UNCAUGHT_EXCEPTION, {name: value.getClassName()});

                    if (context.mainProgram) {
                        stderr.write(exception.message);
                    }

                    promise.reject(exception);
                }(exception));

                return promise;
            }

            if (exception instanceof PHPError) {
                if (context.mainProgram) {
                    stderr.write(exception.message);
                }

                return promise.reject(exception);
            }

            throw exception;
        });

        return promise;
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

    function interpretFunction(argNodes, bindingNodes, statementNode, interpret) {
        var args = [],
            argumentAssignments = '',
            bindingAssignments = '',
            body = interpret(statementNode);

        util.each(bindingNodes, function (bindingNode) {
            var methodSuffix = bindingNode.reference ? 'Reference' : 'Value',
                variableName = bindingNode.variable;

            bindingAssignments += 'scope.getVariable("' + variableName + '").set' + methodSuffix + '(parentScope.getVariable("' + variableName + '").get' + methodSuffix + '());';
        });

        // Copy passed values for any arguments
        util.each(argNodes, function (argNode, index) {
            var valueCode = '$',
                variable;

            if (argNode.name === 'N_ARGUMENT') {
                variable = argNode.variable.variable;
                valueCode += variable;

                if (argNode.value) {
                    valueCode += ' || ' + interpret(argNode.value);
                }
            } else {
                variable = argNode.variable;
                valueCode += variable;

                if (!argNode.reference) {
                    valueCode += '.getValue()';
                }
            }

            if (argNode.reference) {
                argumentAssignments += 'scope.getVariable("' + variable + '").setReference(' + valueCode + '.getReference());';
            } else {
                argumentAssignments += 'scope.getVariable("' + variable + '").setValue(' + valueCode + ');';
            }

            args[index] = '$' + variable;
        });

        // Prepend parts in correct order
        body = argumentAssignments + bindingAssignments + body;

        // Add scope handling logic
        body = 'var scope = tools.pushCall(this, currentClass).getScope(); try { ' + body + ' } finally { tools.popCall(); }';

        // Build function expression
        body = 'function (' + args.join(', ') + ') {' + body + '}';

        if (bindingNodes && bindingNodes.length > 0) {
            body = '(function (parentScope) { return ' + body + '; }(scope))';
        }

        return body;
    }

    function processBlock(statements, interpret, context) {
        var code = '',
            labelRepository = context.labelRepository,
            statementDatas = [];

        util.each(statements, function (statement) {
            var labels = {},
                gotos = {},
                statementCode;

            function onPendingLabel(label) {
                gotos[label] = true;
            }

            function onFoundLabel(label) {
                labels[label] = true;
            }

            labelRepository.on('pending label', onPendingLabel);
            labelRepository.on('found label', onFoundLabel);

            statementCode = interpret(statement, context);
            labelRepository.off('pending label', onPendingLabel);
            labelRepository.off('found label', onFoundLabel);

            statementDatas.push({
                code: statementCode,
                gotos: gotos,
                labels: labels,
                prefix: '',
                suffix: ''
            });
        });

        util.each(statementDatas, function (statementData, index) {
            if (index > 0) {
                util.each(Object.keys(statementData.labels), function (label) {
                    statementDatas[0].prefix = 'if (!' + 'goingToLabel_' + label + ') {' + statementDatas[0].prefix;
                    statementData.prefix = '}' + statementData.prefix;
                });
            }
        });

        util.each(statementDatas, function (statementData, statementIndex) {
            util.each(Object.keys(statementData.gotos), function (label) {
                if (!hasOwn.call(statementData.labels, label)) {
                    // This is a goto to a label in another statement: find the statement containing the label
                    util.each(statementDatas, function (otherStatementData, otherStatementIndex) {
                        if (otherStatementData !== statementData) {
                            if (hasOwn.call(otherStatementData.labels, label)) {
                                // We have found the label we are trying to jump to
                                if (otherStatementIndex > statementIndex) {
                                    // The label is after the goto (forward jump)
                                    statementData.prefix = label + ': {' + statementData.prefix;
                                    otherStatementData.prefix = '}' + otherStatementData.prefix;
                                } else {
                                    // The goto is after the label (backward jump)
                                    otherStatementData.prefix += 'continue_' + label + ': do {';
                                    statementData.suffix += '} while (goingToLabel_' + label + ');';
                                }
                            }
                        }
                    });
                }
            });
        });

        util.each(statementDatas, function (statementData) {
            code += statementData.prefix + statementData.code + statementData.suffix;
        });

        return code;
    }

    return {
        Environment: PHPEnvironment,
        State: PHPState,
        nodes: {
            'N_ARRAY_CAST': function (node, interpret) {
                return interpret(node.value, {getValue: true}) + '.coerceToArray()';
            },
            'N_ARRAY_INDEX': function (node, interpret, context) {
                var arrayVariableCode,
                    indexValues = [],
                    suffix = '';

                if (node.indices !== true) {
                    util.each(node.indices, function (index) {
                        indexValues.push(interpret(index.index, {assignment: false, getValue: true}));
                    });
                }

                if (context.assignment) {
                    arrayVariableCode = 'tools.implyArray(' + interpret(node.array, {getValue: false}) + ')';
                } else {
                    suffix = '.getValue()';
                    arrayVariableCode = interpret(node.array, {getValue: true});
                }

                if (indexValues.length > 0) {
                    return arrayVariableCode + '.getElementByKey(' + indexValues.join(').getValue().getElementByKey(') + ')' + suffix;
                }

                return arrayVariableCode + '.getElementByKey(tools.valueFactory.createInteger(' + arrayVariableCode + '.getLength()))' + suffix;
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
            'N_BREAK_STATEMENT': function (node, interpret, context) {
                return 'break switch_' + (context.switchCase.depth - (node.levels.number - 1)) + ';';
            },
            'N_CASE': function (node, interpret, context) {
                var body = '';

                util.each(node.body, function (statement) {
                    body += interpret(statement);
                });

                return 'if (switchMatched_' + context.switchCase.depth + ' || switchExpression_' + context.switchCase.depth + '.isEqualTo(' + interpret(node.expression) + ').getNative()) {switchMatched_' + context.switchCase.depth + ' = true; ' + body + '}';
            },
            'N_CLASS_CONSTANT': function (node, interpret) {
                return interpret(node.className, {getValue: true, allowBareword: true}) + '.getConstantByName(' + JSON.stringify(node.constant) + ', namespaceScope)';
            },
            'N_CLASS_STATEMENT': function (node, interpret) {
                var code,
                    constantCodes = [],
                    methodCodes = [],
                    propertyCodes = [],
                    staticPropertyCodes = [],
                    superClass = node.extend ? 'namespaceScope.getClass(' + JSON.stringify(node.extend) + ')' : 'null',
                    interfaces = JSON.stringify(node.implement || []);

                util.each(node.members, function (member) {
                    var data = interpret(member, {inClass: true});

                    if (member.name === 'N_INSTANCE_PROPERTY_DEFINITION') {
                        propertyCodes.push('"' + data.name + '": ' + data.value);
                    } else if (member.name === 'N_STATIC_PROPERTY_DEFINITION') {
                        staticPropertyCodes.push('"' + data.name + '": {visibility: ' + data.visibility + ', value: ' + data.value + '}');
                    } else if (member.name === 'N_METHOD_DEFINITION' || member.name === 'N_STATIC_METHOD_DEFINITION') {
                        methodCodes.push('"' + data.name + '": ' + data.body);
                    } else if (member.name === 'N_CONSTANT_DEFINITION') {
                        constantCodes.push('"' + data.name + '": ' + data.value);
                    }
                });

                code = '{superClass: ' + superClass + ', interfaces: ' + interfaces + ', staticProperties: {' + staticPropertyCodes.join(', ') + '}, properties: {' + propertyCodes.join(', ') + '}, methods: {' + methodCodes.join(', ') + '}, constants: {' + constantCodes.join(', ') + '}}';

                return '(function () {var currentClass = namespace.defineClass(' + JSON.stringify(node.className) + ', ' + code + ', namespaceScope);}());';
            },
            'N_CLOSURE': function (node, interpret) {
                var func = interpretFunction(node.args, node.bindings, node.body, interpret);

                return 'tools.createClosure(' + func + ')';
            },
            'N_COMMA_EXPRESSION': function (node, interpret) {
                var expressionCodes = [];

                util.each(node.expressions, function (expression) {
                    expressionCodes.push(interpret(expression));
                });

                return expressionCodes.join(',');
            },
            'N_COMPOUND_STATEMENT': function (node, interpret, context) {
                return processBlock(node.statements, interpret, context);
            },
            'N_CONSTANT_DEFINITION': function (node, interpret) {
                return {
                    name: node.constant,
                    value: 'function () { return ' + (node.value ? interpret(node.value) : 'null') + '; }'
                };
            },
            'N_CONTINUE_STATEMENT': function (node, interpret, context) {
                return 'break switch_' + (context.switchCase.depth - (node.levels.number - 1)) + ';';
            },
            'N_DEFAULT_CASE': function (node, interpret, context) {
                var body = '';

                util.each(node.body, function (statement) {
                    body += interpret(statement);
                });

                return 'if (!switchMatched_' + context.switchCase.depth + ') {switchMatched_' + context.switchCase.depth + ' = true; ' + body + '}';
            },
            'N_DO_WHILE_STATEMENT': function (node, interpret/*, context*/) {
                var code = interpret(node.body);

                return 'do {' + code + '} while (' + interpret(node.condition) + '.coerceToBoolean().getNative());';
            },
            'N_ECHO_STATEMENT': function (node, interpret) {
                return 'stdout.write(' + interpret(node.expression) + '.coerceToString().getNative());';
            },
            'N_EXPRESSION': function (node, interpret) {
                var isAssignment = node.right[0].operator === '=',
                    expressionEnd = '',
                    expressionStart = interpret(node.left, {assignment: isAssignment, getValue: !isAssignment});

                util.each(node.right, function (operation, index) {
                    var getValueIfApplicable,
                        isReference = false,
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

                    getValueIfApplicable = (!isAssignment || index === node.right.length - 1) && !isReference;

                    expressionStart += '.' + method + '(' + interpret(operation.operand, {getValue: getValueIfApplicable}) + valuePostProcess;
                    expressionEnd += ')';
                });

                return expressionStart + expressionEnd;
            },
            'N_EXPRESSION_STATEMENT': function (node, interpret) {
                return interpret(node.expression) + ';';
            },
            'N_FLOAT': function (node) {
                return 'tools.valueFactory.createFloat(' + node.number + ')';
            },
            'N_FOR_STATEMENT': function (node, interpret) {
                var bodyCode = interpret(node.body),
                    conditionCode = interpret(node.condition),
                    initializerCode = interpret(node.initializer),
                    updateCode = interpret(node.update);

                if (conditionCode) {
                    conditionCode += '.coerceToBoolean().getNative()';
                }

                return 'for (' + initializerCode + ';' + conditionCode + ';' + updateCode + ') {' + bodyCode + '}';
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

                code += interpret(node.body);

                code += '}';

                return code;
            },
            'N_FUNCTION_STATEMENT': function (node, interpret, context) {
                var func;

                context.labelRepository = new LabelRepository();

                func = interpretFunction(node.args, null, node.body, interpret);

                return 'namespace.defineFunction(' + JSON.stringify(node.func) + ', ' + func + ');';
            },
            'N_FUNCTION_CALL': function (node, interpret) {
                var args = [];

                util.each(node.args, function (arg) {
                    args.push(interpret(arg, {getValue: false}));
                });

                return '(' + interpret(node.func, {getValue: true, allowBareword: true}) + '.call([' + args.join(', ') + '], namespaceScope) || tools.valueFactory.createNull())';
            },
            'N_GOTO_STATEMENT': function (node, interpret, context) {
                var code = '',
                    label = node.label;

                context.labelRepository.addPending(label);

                code += 'goingToLabel_' + label + ' = true;';

                if (context.labelRepository.hasBeenFound(label)) {
                    code += ' continue continue_' + label + ';';
                } else {
                    code += ' break ' + label + ';';
                }

                return code;
            },
            'N_IF_STATEMENT': function (node, interpret, context) {
                // Consequent statements are executed if the condition is truthy,
                // Alternate statements are executed if the condition is falsy
                var alternateCode,
                    code = '',
                    conditionCode = interpret(node.condition) + '.coerceToBoolean().getNative()',
                    consequentCode,
                    consequentPrefix = '',
                    gotosJumpingIn = {},
                    labelRepository = context.labelRepository;

                function onPendingLabel(label) {
                    delete gotosJumpingIn[label];
                }

                function onFoundLabel(label) {
                    gotosJumpingIn[label] = true;
                }

                labelRepository.on('pending label', onPendingLabel);
                labelRepository.on('found label', onFoundLabel);

                consequentCode = interpret(node.consequentStatement);
                labelRepository.off('pending label', onPendingLabel);
                labelRepository.off('found label', onFoundLabel);

                util.each(Object.keys(gotosJumpingIn), function (label) {
                    conditionCode = 'goingToLabel_' + label + ' || (' + conditionCode + ')';
                });

                consequentCode = '{' + consequentPrefix + consequentCode + '}';

                alternateCode = node.alternateStatement ? ' else ' + interpret(node.alternateStatement) : '';

                code += 'if (' + conditionCode + ') ' + consequentCode + alternateCode;

                return code;
            },
            'N_INCLUDE_EXPRESSION': function (node, interpret) {
                return 'tools.include(' + interpret(node.path) + '.getNative())';
            },
            'N_INLINE_HTML_STATEMENT': function (node) {
                return 'stdout.write(' + JSON.stringify(node.html) + ');';
            },
            'N_INSTANCE_PROPERTY_DEFINITION': function (node, interpret) {
                return {
                    name: node.variable.variable,
                    value: node.value ? interpret(node.value) : 'null'
                };
            },
            'N_INTEGER': function (node) {
                return 'tools.valueFactory.createInteger(' + node.number + ')';
            },
            'N_INTERFACE_METHOD_DEFINITION': function (node, interpret) {
                return {
                    name: interpret(node.func),
                    body: '{isStatic: false, abstract: true}'
                };
            },
            'N_INTERFACE_STATEMENT': function (node, interpret) {
                var code,
                    constantCodes = [],
                    methodCodes = [],
                    superClass = node.extend ? 'namespaceScope.getClass(' + JSON.stringify(node.extend) + ')' : 'null';

                util.each(node.members, function (member) {
                    var data = interpret(member, {inClass: true});

                    if (member.name === 'N_INSTANCE_PROPERTY_DEFINITION' || member.name === 'N_STATIC_PROPERTY_DEFINITION') {
                        throw new PHPFatalError(PHPFatalError.INTERFACE_PROPERTY_NOT_ALLOWED);
                    } else if (member.name === 'N_METHOD_DEFINITION' || member.name === 'N_STATIC_METHOD_DEFINITION') {
                        throw new PHPFatalError(PHPFatalError.INTERFACE_METHOD_BODY_NOT_ALLOWED, {
                            className: node.interfaceName,
                            methodName: member.func || member.method
                        });
                    } else if (member.name === 'N_INTERFACE_METHOD_DEFINITION' || member.name === 'N_STATIC_INTERFACE_METHOD_DEFINITION') {
                        methodCodes.push('"' + data.name + '": ' + data.body);
                    } else if (member.name === 'N_CONSTANT_DEFINITION') {
                        constantCodes.push('"' + data.name + '": ' + data.value);
                    }
                });

                code = '{superClass: ' + superClass + ', staticProperties: {}, properties: {}, methods: {' + methodCodes.join(', ') + '}, constants: {' + constantCodes.join(', ') + '}}';

                return '(function () {var currentClass = namespace.defineClass(' + JSON.stringify(node.interfaceName) + ', ' + code + ', namespaceScope);}());';
            },
            'N_INTERFACE_STATIC_METHOD_DEFINITION': function (node, interpret) {
                return {
                    name: interpret(node.func),
                    body: '{isStatic: false, abstract: true}'
                };
            },
            'N_ISSET': function (node, interpret) {
                var issets = [];

                util.each(node.variables, function (variable) {
                    issets.push(interpret(variable, {getValue: false}) + '.isSet()');
                });

                return '(function (scope) {scope.suppressErrors();' +
                    'var result = tools.valueFactory.createBoolean(' + issets.join(' && ') + ');' +
                    'scope.unsuppressErrors(); return result;}(scope))';
            },
            'N_KEY_VALUE_PAIR': function (node, interpret) {
                return 'tools.createKeyValuePair(' + interpret(node.key) + ', ' + interpret(node.value) + ')';
            },
            'N_LABEL_STATEMENT': function (node, interpret, context) {
                var label = node.label;

                context.labelRepository.found(label);

                return '';
            },
            'N_LIST': function (node, interpret) {
                var elementsCodes = [];

                util.each(node.elements, function (element) {
                    elementsCodes.push(interpret(element, {getValue: false}));
                });

                return 'tools.createList([' + elementsCodes.join(',') + '])';
            },
            'N_MAGIC_DIR_CONSTANT': function () {
                return 'tools.getPathDirectory()';
            },
            'N_MAGIC_FILE_CONSTANT': function () {
                return 'tools.getPath()';
            },
            'N_MAGIC_LINE_CONSTANT': function (node) {
                return 'tools.valueFactory.createInteger(' + node.offset.line + ')';
            },
            'N_METHOD_CALL': function (node, interpret) {
                var code = '';

                util.each(node.calls, function (call) {
                    var args = [];

                    util.each(call.args, function (arg) {
                        args.push(interpret(arg));
                    });

                    code += '.callMethod(' + interpret(call.func, {allowBareword: true}) + '.getNative(), [' + args.join(', ') + '])';
                });

                return interpret(node.object, {getValue: true}) + code;
            },
            'N_METHOD_DEFINITION': function (node, interpret) {
                return {
                    name: interpret(node.func),
                    body: '{isStatic: false, method: ' + interpretFunction(node.args, null, node.body, interpret) + '}'
                };
            },
            'N_NAMESPACE_STATEMENT': function (node, interpret) {
                var body = '';

                util.each(hoistDeclarations(node.statements), function (statement) {
                    body += interpret(statement);
                });

                return 'if (namespaceResult = (function (globalNamespace) {var namespace = globalNamespace.getDescendant(' + JSON.stringify(node.namespace) + '), namespaceScope = tools.createNamespaceScope(namespace);' + body + '}(namespace))) { return namespaceResult; }';
            },
            'N_NEW_EXPRESSION': function (node, interpret) {
                var args = [];

                util.each(node.args, function (arg) {
                    args.push(interpret(arg));
                });

                return 'tools.createInstance(namespaceScope, ' + interpret(node.className, {allowBareword: true}) + ', [' + args.join(', ') + '])';
            },
            'N_NULL': function () {
                return 'tools.valueFactory.createNull()';
            },
            'N_OBJECT_PROPERTY': function (node, interpret, context) {
                var objectVariableCode,
                    propertyCode = '',
                    suffix = '';

                if (context.assignment) {
                    objectVariableCode = 'tools.implyObject(' + interpret(node.object, {getValue: false}) + ')';
                } else {
                    suffix = '.getValue()';
                    objectVariableCode = interpret(node.object, {getValue: true});
                }

                util.each(node.properties, function (property, index) {
                    var nameValue = interpret(property.property, {assignment: false, getValue: false, allowBareword: true});

                    propertyCode += '.getInstancePropertyByName(' + nameValue + ')';

                    if (index < node.properties.length - 1) {
                        propertyCode += '.getValue()';
                    }
                });

                return objectVariableCode + propertyCode + suffix;
            },
            'N_PRINT_EXPRESSION': function (node, interpret) {
                return '(stdout.write(' + interpret(node.operand, {getValue: true}) + '.coerceToString().getNative()), tools.valueFactory.createInteger(1))';
            },
            'N_PROGRAM': function (node, interpret, state, stdin, stdout, stderr) {
                var body = '',
                    context = {
                        labelRepository: new LabelRepository(),
                        mainProgram: state.isMainProgram(),
                        path: state.getPath()
                    },
                    labels;

                try {
                    body += processBlock(hoistDeclarations(node.statements), interpret, context);
                } catch (exception) {
                    if (exception instanceof PHPError) {
                        stderr.write(exception.message);

                        return new Promise().reject(exception);
                    }
                }

                labels = context.labelRepository.getLabels();

                if (labels.length > 0) {
                    body = 'var goingToLabel_' + labels.join(' = false, goingToLabel_') + ' = false;' + body;
                }

                return evaluateModule(state, body, context, stdin, stdout, stderr);
            },
            'N_REQUIRE_EXPRESSION': function (node, interpret) {
                return 'tools.require(' + interpret(node.path) + '.getNative())';
            },
            'N_REQUIRE_ONCE_EXPRESSION': function (node, interpret) {
                return 'tools.requireOnce(' + interpret(node.path) + '.getNative())';
            },
            'N_RETURN_STATEMENT': function (node, interpret) {
                var expression = interpret(node.expression);

                return 'return ' + (expression ? expression : 'tools.valueFactory.createNull()') + ';';
            },
            'N_SELF': function (node, interpret, context) {
                if (context.inClass) {
                    return 'tools.valueFactory.createString(currentClass.getUnprefixedName())';
                }

                return 'tools.throwNoActiveClassScope()';
            },
            'N_STATIC_METHOD_CALL': function (node, interpret) {
                var args = [];

                util.each(node.args, function (arg) {
                    args.push(interpret(arg));
                });

                return interpret(node.className, {allowBareword: true}) + '.callStaticMethod(' + interpret(node.method, {allowBareword: true}) + ', [' + args.join(', ') + '], namespaceScope)';
            },
            'N_STATIC_METHOD_DEFINITION': function (node, interpret) {
                return {
                    name: interpret(node.method),
                    body: '{isStatic: true, method: ' + interpretFunction(node.args, null, node.body, interpret) + '}'
                };
            },
            'N_STATIC_PROPERTY': function (node, interpret, context) {
                var classVariableCode = interpret(node.className, {getValue: true, allowBareword: true}),
                    propertyCode = '.getStaticPropertyByName(' + interpret(node.property, {assignment: false, getValue: true, allowBareword: true}) + ', namespaceScope)',
                    suffix = '';

                if (!context.assignment) {
                    suffix = '.getValue()';
                }

                return classVariableCode + propertyCode + suffix;
            },
            'N_STATIC_PROPERTY_DEFINITION': function (node, interpret) {
                return {
                    name: node.variable.variable,
                    visibility: JSON.stringify(node.visibility),
                    value: node.value ? interpret(node.value) : 'tools.valueFactory.createNull()'
                };
            },
            'N_STRING': function (node, interpret, context) {
                if (context.allowBareword) {
                    return 'tools.valueFactory.createBarewordString(' + JSON.stringify(node.string) + ')';
                }

                return 'namespaceScope.getConstant(' + JSON.stringify(node.string) + ')';
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
            'N_SWITCH_STATEMENT': function (node, interpret, context) {
                var code = '',
                    expressionCode = interpret(node.expression),
                    switchCase = {
                        depth: context.switchCase ? context.switchCase.depth + 1 : 0
                    },
                    subContext = {
                        switchCase: switchCase
                    };

                code += 'var switchExpression_' + switchCase.depth + ' = ' + expressionCode + ',' +
                    ' switchMatched_' + switchCase.depth + ' = false;';

                util.each(node.cases, function (caseNode) {
                    code += interpret(caseNode, subContext);
                });

                return 'switch_' + switchCase.depth + ': {' + code + '}';
            },
            'N_TERNARY': function (node, interpret) {
                var expression = '(' + interpret(node.condition) + ')';

                util.each(node.options, function (option) {
                    expression = '(' + expression + '.coerceToBoolean().getNative() ? ' + interpret(option.consequent) + ' : ' + interpret(option.alternate) + ')';
                });

                return expression;
            },
            'N_THROW_STATEMENT': function (node, interpret) {
                return 'throw ' + interpret(node.expression) + ';';
            },
            'N_UNARY_EXPRESSION': function (node, interpret) {
                var operator = node.operator,
                    operand = interpret(node.operand, {getValue: operator !== '++' && operator !== '--'});

                return operand + '.' + unaryOperatorToMethod[node.prefix ? 'prefix' : 'suffix'][operator] + '()';
            },
            'N_USE_STATEMENT': function (node) {
                var code = '';

                util.each(node.uses, function (use) {
                    if (use.alias) {
                        code += 'namespaceScope.use(' + JSON.stringify(use.source) + ', ' + JSON.stringify(use.alias) + ');';
                    } else {
                        code += 'namespaceScope.use(' + JSON.stringify(use.source) + ');';
                    }
                });

                return code;
            },
            'N_VARIABLE': function (node, interpret, context) {
                return 'scope.getVariable("' + node.variable + '")' + (context.getValue !== false ? '.getValue()' : '');
            },
            'N_VARIABLE_EXPRESSION': function (node, interpret, context) {
                return 'scope.getVariable(' + interpret(node.expression) + '.getNative())' + (context.getValue !== false ? '.getValue()' : '');
            },
            'N_VOID': function () {
                return 'tools.referenceFactory.createNull()';
            },
            'N_WHILE_STATEMENT': function (node, interpret, context) {
                var code = '';

                context.labelRepository.on('found label', function () {
                    throw new PHPFatalError(PHPFatalError.GOTO_DISALLOWED);
                });

                util.each(node.statements, function (statement) {
                    code += interpret(statement);
                });

                return 'while (' + interpret(node.condition) + '.coerceToBoolean().getNative()) {' + code + '}';
            }
        }
    };
});
