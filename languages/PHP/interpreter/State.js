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
    './builtin/builtins',
    '../util',
    'js/util',
    './CallStack',
    './Namespace',
    './ReferenceFactory',
    './Scope',
    './ValueFactory'
], function (
    builtinTypes,
    phpUtil,
    util,
    CallStack,
    Namespace,
    ReferenceFactory,
    Scope,
    ValueFactory
) {
    'use strict';

    var EXCEPTION_CLASS = 'Exception';

    function PHPState(stdout, stderr, engine, options) {
        var callStack = new CallStack(stderr),
            valueFactory = new ValueFactory(callStack),
            globalNamespace = new Namespace(callStack, valueFactory, null, '');

        valueFactory.setGlobalNamespace(globalNamespace);

        this.callStack = callStack;
        this.engine = engine;
        this.globalNamespace = globalNamespace;
        this.globalScope = new Scope(callStack, valueFactory, null, null);
        this.options = options;
        this.path = null;
        this.referenceFactory = new ReferenceFactory(valueFactory);
        this.callStack = callStack;
        this.stdout = stdout;
        this.valueFactory = valueFactory;
        this.PHPException = null;

        setUpState(this);
    }

    util.extend(PHPState.prototype, {
        getCallStack: function () {
            return this.callStack;
        },

        getEngine: function () {
            return this.engine;
        },

        getGlobalNamespace: function () {
            return this.globalNamespace;
        },

        getGlobalScope: function () {
            return this.globalScope;
        },

        getOptions: function () {
            return this.options;
        },

        getPath: function () {
            return phpUtil.normalizeModulePath(this.path);
        },

        getPHPExceptionClass: function () {
            return this.PHPException;
        },

        getReferenceFactory: function () {
            return this.referenceFactory;
        },

        getValueFactory: function () {
            return this.valueFactory;
        },

        isMainProgram: function () {
            return this.path === null;
        },

        setPath: function (path) {
            this.path = path;
        }
    });

    function setUpState(state) {
        var globalNamespace = state.globalNamespace,
            internals = {
                callStack: state.callStack,
                globalNamespace: globalNamespace,
                stdout: state.stdout,
                valueFactory: state.valueFactory
            };

        util.each(builtinTypes.functionGroups, function (groupFactory) {
            var groupBuiltins = groupFactory(internals);

            util.each(groupBuiltins, function (fn, name) {
                globalNamespace.defineFunction(name, fn);
            });
        });

        util.each(builtinTypes.classes, function (classFactory, name) {
            var Class = classFactory(internals);

            if (name === EXCEPTION_CLASS) {
                state.PHPException = Class;
            }

            globalNamespace.defineClass(name, Class);
        });
    }

    return PHPState;
});
