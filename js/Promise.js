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
    './SimplePromise'
], function (
    util,
    SimplePromise
) {
    'use strict';

    var parent = SimplePromise.prototype,
        slice = [].slice;

    function Promise() {
        SimplePromise.call(this);
    }

    util.inherit(Promise).from(SimplePromise);

    util.extend(Promise.prototype, {
        always: function (callback) {
            return this.then(callback, callback);
        },

        done: function (callback) {
            return this.then(callback);
        },

        fail: function (callback) {
            return this.then(null, callback);
        },

        resolve: function () {
            return parent.resolve.call(this, slice.call(arguments));
        },

        then: function (onResolve, onReject) {
            return parent.then.call(this, onResolve ? function (args) {
                onResolve.apply(null, args);
            } : null, onReject);
        }
    });

    return Promise;
});
