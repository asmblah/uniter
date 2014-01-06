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
    './Variable'
], function (
    util,
    Variable
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function Scope(scopeChain, valueFactory) {
        this.errorsSuppressed = false;
        this.scopeChain = scopeChain;
        this.valueFactory = valueFactory;
        this.variables = {};
    }

    util.extend(Scope.prototype, {
        defineVariable: function (name) {
            var scope = this,
                variable = new Variable(scope.scopeChain, scope.valueFactory, name);

            scope.variables[name] = variable;

            return variable;
        },

        defineVariables: function (names) {
            var scope = this;

            util.each(names, function (name) {
                scope.defineVariable(name);
            });
        },

        expose: function (object, name) {
            var scope = this,
                valueFactory = scope.valueFactory;

            scope.defineVariable(name).setValue(valueFactory.coerce(object));
        },

        getVariable: function (name) {
            var scope = this;

            if (!hasOwn.call(scope.variables, name)) {
                // Implicitly define the variable
                scope.variables[name] = new Variable(scope.scopeChain, scope.valueFactory, name);
            }

            return scope.variables[name];
        },

        suppressesErrors: function () {
            return this.errorsSuppressed;
        }
    });

    return Scope;
});
