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
    './CallStack',
    './Namespace',
    './ReferenceFactory',
    './Scope',
    './ValueFactory'
], function (
    util,
    CallStack,
    Namespace,
    ReferenceFactory,
    Scope,
    ValueFactory
) {
    'use strict';

    function PHPState(stderr, engine, options) {
        var callStack = new CallStack(stderr),
            valueFactory = new ValueFactory(callStack);

        this.callStack = callStack;
        this.engine = engine;
        this.globalNamespace = new Namespace(callStack, valueFactory, null, '');
        this.globalScope = new Scope(callStack, valueFactory, null);
        this.options = options;
        this.path = null;
        this.referenceFactory = new ReferenceFactory(valueFactory);
        this.callStack = callStack;
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
            return this.path;
        },

        getReferenceFactory: function () {
            return this.referenceFactory;
        },

        getValueFactory: function () {
            return this.valueFactory;
        },

        setPath: function (path) {
            this.path = path || '(program)';
        }
    });

    return PHPState;
});
