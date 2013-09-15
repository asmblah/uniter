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
    './Scope',
    './ValueFactory'
], function (
    util,
    NamespaceCollection,
    Scope,
    ValueFactory
) {
    'use strict';

    function PHPState() {
        var valueFactory = new ValueFactory();

        this.globalScope = new Scope(valueFactory);
        this.namespaceCollection = new NamespaceCollection();
        this.valueFactory = valueFactory;
    }

    util.extend(PHPState.prototype, {
        getGlobalScope: function () {
            return this.globalScope;
        },

        getNamespaceCollection: function () {
            return this.namespaceCollection;
        },

        getValueFactory: function () {
            return this.valueFactory;
        }
    });

    return PHPState;
});
