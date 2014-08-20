/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'js/util',
    './Class',
    './Error',
    './Error/Fatal'
], function (
    util,
    Class,
    PHPError,
    PHPFatalError
) {
    'use strict';

    var IS_STATIC = 'isStatic',
        hasOwn = {}.hasOwnProperty;

    function Namespace(callStack, valueFactory, classAutoloader, parent, name) {
        this.callStack = callStack;
        this.children = {};
        this.classAutoloader = classAutoloader;
        this.classes = {};
        this.constants = {};
        this.functions = {};
        this.name = name;
        this.parent = parent;
        this.valueFactory = valueFactory;
    }

    util.extend(Namespace.prototype, {
        defineClass: function (name, definition) {
            var classObject,
                constructorName = null,
                methodData = {},
                namespace = this,
                staticProperties,
                InternalClass;

            if (util.isFunction(definition)) {
                InternalClass = definition;
            } else {
                InternalClass = function () {
                    var instance = this;

                    if (definition.superClass) {
                        definition.superClass.getInternalClass().call(this);
                    }

                    util.each(definition.properties, function (value, name) {
                        instance[name] = value;
                    });
                };

                // Prevent native 'constructor' property from erroneously being detected as PHP class method
                delete InternalClass.prototype.constructor;

                if (definition.superClass) {
                    InternalClass.prototype = Object.create(definition.superClass.getInternalClass().prototype);
                }

                util.each(definition.methods, function (data, methodName) {
                    // PHP5-style __construct magic method takes precedence
                    if (methodName === '__construct') {
                        if (constructorName) {
                            namespace.callStack.raiseError(PHPError.E_STRICT, 'Redefining already defined constructor for class ' + name);
                        }

                        constructorName = methodName;
                    }

                    if (!constructorName && methodName === name) {
                        constructorName = methodName;
                    }

                    data.method[IS_STATIC] = data[IS_STATIC];
                    data.method.data = methodData;

                    InternalClass.prototype[methodName] = data.method;
                });

                staticProperties = definition.staticProperties;
            }

            classObject = new Class(
                namespace.valueFactory,
                namespace.callStack,
                namespace.getPrefix() + name,
                constructorName,
                InternalClass,
                staticProperties,
                definition.superClass
            );

            methodData.classObject = classObject;

            namespace.classes[name.toLowerCase()] = classObject;

            return classObject;
        },

        defineConstant: function (name, value, options) {
            var caseInsensitive;

            options = options || {};

            caseInsensitive = options.caseInsensitive;

            if (caseInsensitive) {
                name = name.toLowerCase();
            }

            this.constants[name] = {
                caseInsensitive: caseInsensitive,
                value: value
            };
        },

        defineFunction: function (name, func) {
            var namespace = this;

            if (namespace.name === '') {
                if (/__autoload/i.test(name) && func.length !== 1) {
                    throw new PHPFatalError(PHPFatalError.EXPECT_EXACTLY_1_ARG, {name: name.toLowerCase()});
                }
            }

            namespace.functions[name] = func;
        },

        getClass: function (name) {
            var lowerName = name.toLowerCase(),
                match = name.match(/^(.*?)\\([^\\]+)$/),
                namespace = this,
                path,
                subNamespace;

            if (match) {
                path = match[1];
                name = match[2];

                subNamespace = namespace.getDescendant(path);

                return subNamespace.getClass(name);
            }

            if (!hasOwn.call(namespace.classes, lowerName)) {
                // Try to autoload the class
                namespace.classAutoloader.autoloadClass(namespace.getPrefix() + name);

                // Raise an error if it is still not defined
                if (!hasOwn.call(namespace.classes, lowerName)) {
                    throw new PHPFatalError(PHPFatalError.CLASS_NOT_FOUND, {name: namespace.getPrefix() + name});
                }
            }

            return namespace.classes[lowerName];
        },

        getConstant: function (name, usesNamespace) {
            var lowercaseName,
                namespace = this;

            if (!hasOwn.call(namespace.constants, name)) {
                lowercaseName = name.toLowerCase();

                if (!hasOwn.call(namespace.constants, lowercaseName) || !namespace.constants[lowercaseName].caseInsensitive) {
                    if (usesNamespace) {
                        throw new PHPFatalError(PHPFatalError.UNDEFINED_CONSTANT, {name: namespace.getPrefix() + name});
                    } else {
                        namespace.callStack.raiseError(PHPError.E_NOTICE, 'Use of undefined constant ' + name + ' - assumed \'' + name + '\'');

                        return this.valueFactory.createString(name);
                    }
                }

                name = lowercaseName;
            }

            return namespace.constants[name].value;
        },

        getDescendant: function (name) {
            var namespace = this;

            util.each(name.split('\\'), function (part) {
                if (!hasOwn.call(namespace.children, part)) {
                    namespace.children[part] = new Namespace(
                        namespace.callStack,
                        namespace.valueFactory,
                        namespace.classAutoloader,
                        namespace,
                        part
                    );
                }

                namespace = namespace.children[part];
            });

            return namespace;
        },

        getFunction: function (name) {
            var globalNamespace,
                match,
                namespace = this,
                path,
                subNamespace;

            if (util.isFunction(name)) {
                return name;
            }

            match = name.match(/^(.*?)\\([^\\]+)$/);

            if (match) {
                path = match[1];
                name = match[2];

                subNamespace = namespace.getDescendant(path);

                return subNamespace.getFunction(name);
            }

            if (hasOwn.call(namespace.functions, name)) {
                return namespace.functions[name];
            }

            globalNamespace = namespace.getGlobal();

            if (hasOwn.call(globalNamespace.functions, name)) {
                return globalNamespace.functions[name];
            }

            throw new PHPFatalError(PHPFatalError.CALL_TO_UNDEFINED_FUNCTION, {name: namespace.getPrefix() + name});
        },

        getGlobal: function () {
            var namespace = this;

            return namespace.name === '' ? namespace : namespace.getParent().getGlobal();
        },

        getGlobalNamespace: function () {
            return this.getGlobal();
        },

        getOwnFunction: function (name) {
            var namespace = this;

            if (hasOwn.call(namespace.functions, name)) {
                return namespace.functions[name];
            }

            return null;
        },

        getParent: function () {
            return this.parent;
        },

        getPrefix: function () {
            var namespace = this;

            if (namespace.name === '') {
                return '';
            }

            return (namespace.parent ? namespace.parent.getPrefix() : '') + namespace.name + '\\';
        }
    });

    return Namespace;
});
