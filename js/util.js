/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define(function () {
    'use strict';

    var global = /*jshint evil: true */new Function('return this;')()/*jshint evil: false */,
        hasOwn = {}.hasOwnProperty,
        inheritFrom = Object.create || function (from) {
            function F() {}
            F.prototype = from;
            return new F();
        },
        toString = {}.toString,
        undef,
        util;

    util = {
        copy: function (to, from) {
            var key;

            for (key in from) {
                if (hasOwn.call(from, key)) {
                    to[key] = from[key];
                }
            }
        },

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

        from: function (from) {
            return {
                to: function (to, callback) {
                    var number;

                    for (number = from; number <= to; number += 1) {
                        callback(number, number - from);
                    }
                }
            };
        },

        getType: function (obj) {
            /*jshint eqnull: true */

            return obj != null && {}.toString.call(obj).match(/\[object ([\s\S]*)\]/)[1];
        },

        global: global,

        getLineNumber: function (text, offset) {
            function getCount(string, substring) {
                return string.split(substring).length;
            }

            return getCount(text.substr(0, offset), '\n');
        },

        getMilliseconds: global.performance ? function () {
            /*global performance */
            return performance.now();
        } : (Date.now || function () {
            return +new Date();
        }),

        heredoc: function (fn, variables) {
            var match = function () {}.toString.call(fn).match(/\/\*<<<(\w+)[\r\n](?:([\s\S]*)[\r\n])?\1\s*\*\//),
                string;

            if (!match) {
                throw new Error('util.heredoc() :: Function does not contain a heredoc');
            }

            string = match[2] || '';

            string = util.stringTemplate(string, variables);

            return string;
        },

        inherit: function (To) {
            return {
                from: function (From) {
                    To.prototype = inheritFrom(From.prototype);
                    To.prototype.constructor = To;
                }
            };
        },

        isNumber: function (value) {
            return toString.call(value) === '[object Number]';
        },

        isArray: function (value) {
            return toString.call(value) === '[object Array]';
        },

        isBoolean: function (value) {
            return toString.call(value) === '[object Boolean]';
        },

        isFunction: function (value) {
            return toString.call(value) === '[object Function]';
        },

        isPlainObject: function (value) {
            return toString.call(value) === '[object Object]' && !util.isUndefined(value);
        },

        isString: function (value) {
            return typeof value === 'string' || toString.call(value) === '[object String]';
        },

        isUndefined: function (obj) {
            return obj === undef;
        },

        regexEscape: function (text) {
            // See http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
            return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        },

        sortObject: function (object) {
            var result;

            if (!util.isPlainObject(object)) {
                return object;
            }

            result = {};

            util.each(Object.keys(object).sort(), function (name) {
                result[name] = util.sortObject(object[name]);
            });

            return result;
        },

        stringTemplate: function (string, variables) {
            util.each(variables, function (value, name) {
                var pattern = new RegExp(('${' + name + '}').replace(/[^a-z0-9]/g, '\\$&'), 'g');

                string = string.replace(pattern, value);
            }, {keys: true});

            return string;
        }
    };

    return util;
});
