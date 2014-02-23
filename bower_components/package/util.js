/*
 * Package - AMD package plugin
 * Copyright 2014 Dan Phillimore (asmblah)
 * http://asmblah.github.com/package/
 *
 * Released under the MIT license
 * https://github.com/asmblah/package/raw/master/MIT-LICENSE.txt
 */

/*global define */
define(function () {
    'use strict';

    var hasOwn = {}.hasOwnProperty,
        undef,
        util = {
            each: function (obj, callback, options) {
                var key,
                    length;

                if (!obj || typeof obj !== 'object') {
                    return;
                }

                options = options || {};

                if (('length' in obj) && !options.keys) {
                    for (key = 0, length = obj.length; key < length; key += 1) { // Keep JSLint happy with '+= 1'
                        if (callback.call(obj[key], obj[key], key, obj) === false) {
                            break;
                        }
                    }
                } else {
                    for (key in obj) {
                        if (hasOwn.call(obj, key)) {
                            if (callback.call(obj[key], obj[key], key, obj) === false) {
                                break;
                            }
                        }
                    }
                }
            },

            extend: function (target, source1, source2) {
                util.each([source1, source2], function (obj) {
                    util.each(obj, function (val, key) {
                        target[key] = val;
                    }, { keys: true });
                });

                return target;
            },

            extendConfig: function (target, sources) {
                util.each(sources, function (obj) {
                    util.each(obj, function (val, key) {
                        target[key] = (key === 'paths') ? util.extend({}, target[key], val) : val;
                    }, { keys: true });
                });

                return target;
            },

            getType: function (obj) {
                /*jshint eqnull: true */

                return obj != null && {}.toString.call(obj).match(/\[object ([\s\S]*)\]/)[1];
            },

            isArray: function (value) {
                return util.getType(value) === 'Array';
            },

            isFunction: function (value) {
                return util.getType(value) === 'Function';
            },

            isPlainObject: function (obj) {
                return util.getType(obj) === 'Object' && !util.isUndefined(obj);
            },

            isString: function (str) {
                return typeof str === 'string' || util.getType(str) === 'String';
            },

            isUndefined: function (obj) {
                return obj === undef;
            }
        };

    return util;
});
