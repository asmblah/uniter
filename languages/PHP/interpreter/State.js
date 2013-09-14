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
    './Scope',
    './ValueFactory'
], function (
    util,
    Scope,
    ValueFactory
) {
    'use strict';

    function PHPState() {
        var valueFactory = new ValueFactory();

        this.globalScope = new Scope(valueFactory);
        this.valueFactory = valueFactory;
    }

    util.extend(PHPState.prototype, {
        getGlobalScope: function () {
            return this.globalScope;
        },

        getValueFactory: function () {
            return this.valueFactory;
        }
    });

    return PHPState;
});
