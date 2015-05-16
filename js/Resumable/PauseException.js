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
            this.states.push(state);
        },

        now: function () {
            throw this;
        },

        resume: function (result) {
            var exception = this;

            try {
                exception.resumer(exception.promise, result, exception.states);
            } catch (e) {
                // Just re-throw if another PauseException gets raised,
                // we're just looking for normal errors
                if (e instanceof PauseException) {
                    throw e;
                }

                // Reject the promise for the run with the error thrown
                exception.promise.reject(e);
            }
        },

        setPromise: function (promise) {
            this.promise = promise;
        }
    });

    return PauseException;
});
