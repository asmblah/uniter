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
    '../util',
    'js/util',
    './CallStack',
    './Namespace',
    './ReferenceFactory',
    './Scope',
    './ValueFactory'
], function (
    phpUtil,
    util,
    CallStack,
    Namespace,
    ReferenceFactory,
    Scope,
    ValueFactory
) {
    'use strict';

    function PHPState(stderr, engine, hostEnvironment, options) {
        var callStack = new CallStack(stderr),
            sandboxGlobal = hostEnvironment.getSandboxGlobal(),
            valueFactory = new ValueFactory(callStack, sandboxGlobal);

        this.callStack = callStack;
        this.engine = engine;
        this.globalNamespace = new Namespace(callStack, valueFactory, null, '');
        this.globalScope = new Scope(callStack, valueFactory, null);
        this.options = options;
        this.path = null;
        this.referenceFactory = new ReferenceFactory(valueFactory);
        this.sandboxGlobal = sandboxGlobal;
        this.valueFactory = valueFactory;
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

        getReferenceFactory: function () {
            return this.referenceFactory;
        },

        getSandboxGlobal: function () {
            return this.sandboxGlobal;
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

    return PHPState;
});
