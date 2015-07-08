/*
 * Modular - JavaScript AMD Framework
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/modular/
 *
 * Implements the AMD specification - see https://github.com/amdjs/amdjs-api/wiki/AMD
 *
 * Released under the MIT license
 * https://github.com/asmblah/modular/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'js/util'
], function (
    util
) {
    'use strict';

    var PENDING = 0,
        REJECTED = 1,
        RESOLVED = 2;

    function Promise() {
        this.mode = PENDING;
        this.thens = [];
        this.valueArgs = null;
    }

    util.extend(Promise.prototype, {
        reject: function (exception) {
            var args = [].slice.call(arguments),
                promise = this;

            if (promise.mode === PENDING) {
                promise.mode = REJECTED;
                promise.valueArgs = args;

                util.each(promise.thens, function (callbacks) {
                    if (callbacks.onReject) {
                        callbacks.onReject.apply(null, args);
                    }
                });
            }

            return promise;
        },

        resolve: function (result) {
            var args = [].slice.call(arguments),
                promise = this;

            if (promise.mode === PENDING) {
                promise.mode = RESOLVED;
                promise.valueArgs = args;

                util.each(promise.thens, function (callbacks) {
                    if (callbacks.onResolve) {
                        callbacks.onResolve.apply(null, args);
                    }
                });
            }

            return promise;
        },

        then: function (onResolve, onReject) {
            var promise = this;

            if (promise.mode === PENDING) {
                promise.thens.push({
                    onReject: onReject,
                    onResolve: onResolve
                });
            } else if (promise.mode === REJECTED) {
                if (onReject) {
                    onReject.apply(null, promise.valueArgs);
                }
            } else if (promise.mode === RESOLVED) {
                if (onResolve) {
                    onResolve.apply(null, promise.valueArgs);
                }
            }

            return promise;
        }
    });

    return Promise;
});
