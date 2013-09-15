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
    './Error'
], function (
    util,
    PHPError
) {
    'use strict';

    function ScopeChain(stderr) {
        this.scopes = [];
        this.stderr = stderr;
    }

    util.extend(ScopeChain.prototype, {
        getCurrent: function () {
            var chain = this;

            return chain.scopes[chain.scopes.length - 1];
        },

        getGlobalScope: function () {
            return this.scopes[0];
        },

        pop: function () {
            this.scopes.pop();
        },

        push: function (scope) {
            this.scopes.push(scope);
        },

        raiseError: function (level, message) {
            var chain = this,
                error,
                index = 0,
                scope,
                scopes = chain.scopes;

            for (index = scopes.length - 1; index >= 0; --index) {
                scope = scopes[index];

                if (scope.suppressesErrors()) {
                    return;
                }
            }

            error = new PHPError(level, message);

            chain.stderr.write(error.getMessage());
        }
    });

    return ScopeChain;
});
