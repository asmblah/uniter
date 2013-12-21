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
    './Collection/Namespace',
    './ReferenceFactory',
    './Scope',
    './ValueFactory'
], function (
    util,
    NamespaceCollection,
    ReferenceFactory,
    Scope,
    ValueFactory
) {
    'use strict';

    function PHPState() {
        var valueFactory = new ValueFactory();

        this.globalScope = new Scope(valueFactory);
        this.namespaceCollection = new NamespaceCollection();
        this.referenceFactory = new ReferenceFactory(valueFactory);
        this.valueFactory = valueFactory;
    }

    util.extend(PHPState.prototype, {
        getGlobalScope: function () {
            return this.globalScope;
        },

        getNamespaceCollection: function () {
            return this.namespaceCollection;
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
