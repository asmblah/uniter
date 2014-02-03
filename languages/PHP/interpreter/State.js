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

    function PHPState(stderr) {
        var callStack = new CallStack(stderr),
            valueFactory = new ValueFactory(callStack);

        this.callStack = callStack;
        this.globalNamespace = new Namespace(callStack, null, '');
        this.globalScope = new Scope(callStack, valueFactory, null);
        this.referenceFactory = new ReferenceFactory(valueFactory);
        this.callStack = callStack;
        this.valueFactory = valueFactory;
    }

    util.extend(PHPState.prototype, {
        getCallStack: function () {
            return this.callStack;
        },

        getGlobalNamespace: function () {
            return this.globalNamespace;
        },

        getGlobalScope: function () {
            return this.globalScope;
        },

        getReferenceFactory: function () {
            return this.referenceFactory;
        },

        getValueFactory: function () {
            return this.valueFactory;
        }
    });

    return PHPState;
});
