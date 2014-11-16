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
    'js/util'
], function (
    util
) {
    'use strict';

    function PauseException(resumer) {
        this.promise = null;
        this.resumer = resumer;
        this.states = [];
    }

    util.extend(PauseException.prototype, {
        add: function (state) {
            this.states.unshift(state);
        },

        now: function () {
            throw this;
        },

        resume: function (result) {
            var exception = this;

            exception.resumer(exception.promise, result, exception.states);
        },

        setPromise: function (promise) {
            this.promise = promise;
        }
    });

    return PauseException;
});
