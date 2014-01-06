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
    './Namespace',
    './ReferenceFactory',
    './Scope',
    './ScopeChain',
    './ValueFactory'
], function (
    util,
    Namespace,
    ReferenceFactory,
    Scope,
    ScopeChain,
    ValueFactory
) {
    'use strict';

    function PHPState(stderr) {
        var scopeChain = new ScopeChain(stderr),
            valueFactory = new ValueFactory(scopeChain);

        this.globalNamespace = new Namespace(null, '');
        this.globalScope = new Scope(scopeChain, valueFactory);
        this.referenceFactory = new ReferenceFactory(valueFactory);
        this.scopeChain = scopeChain;
        this.valueFactory = valueFactory;
    }

    util.extend(PHPState.prototype, {
        getGlobalNamespace: function () {
            return this.globalNamespace;
        },

        getGlobalScope: function () {
            return this.globalScope;
        },

        getReferenceFactory: function () {
            return this.referenceFactory;
        },

        getScopeChain: function () {
            return this.scopeChain;
        },

        getValueFactory: function () {
            return this.valueFactory;
        }
    });

    return PHPState;
});
