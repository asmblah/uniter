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
    './ValueFactory'
], function (
    util,
    Namespace,
    ReferenceFactory,
    Scope,
    ValueFactory
) {
    'use strict';

    function PHPState() {
        var valueFactory = new ValueFactory();

        this.globalNamespace = new Namespace(null, '');
        this.globalScope = new Scope(valueFactory);
        this.referenceFactory = new ReferenceFactory(valueFactory);
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

        getValueFactory: function () {
            return this.valueFactory;
        }
    });

    return PHPState;
});
