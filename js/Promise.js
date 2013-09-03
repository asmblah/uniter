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
    'Modular/js/Promise'
], function (
    util,
    ModularPromise
) {
    'use strict';

    function Promise() {
        ModularPromise.call(this);
    }

    util.inherit(Promise).from(ModularPromise);

    util.extend(Promise.prototype, {
        always: function (callback) {
            return this.then(callback, callback);
        },

        done: function (callback) {
            return this.then(callback);
        },

        fail: function (callback) {
            return this.then(null, callback);
        }
    });

    return Promise;
});
