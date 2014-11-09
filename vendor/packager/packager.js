/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, require */
define(function () {
    'use strict';

    var util = (function () {
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
    }());

    return {
        load: function (name, req, onLoad, requirejsConfig) {
            var isolatedContextName = 'package-' + Math.random();

            req([name], function (packageConfig) {
                var baseID,
                    mapAll = util.extend({}, packageConfig.map ? packageConfig.map['*'] : {}),
                    paths = util.extend({}, packageConfig.paths);

                function resolvePaths(paths) {
                    util.each(paths, function (path, index, paths) {
                        if (/^\.\.?\//.test(path)) {
                            path = baseID + path;

                            // Resolve same-directory terms
                            path = path.replace(/(?!^\/[^.])(^|\/)(\.?\/)+/g, '$1');

                            paths[index] = path;
                        }
                    });
                }

                // Process relative path mappings relative to package file
                baseID = (req.toUrl(name) || '').replace(/(^|\/)[^\/]*$/, '$1') || '';

                resolvePaths(mapAll);
                resolvePaths(paths);

                mapAll = util.extend({}, requirejsConfig.map ? requirejsConfig.map['*'] : {}, mapAll);
                paths = util.extend({}, requirejsConfig.paths, paths);

                require({
                    // Use another isolated context to set the path mappings configured in package manifest
                    'paths': paths,
                    'map': {
                        '*': mapAll
                    },
                    'context': isolatedContextName,

                    'config': requirejsConfig.config
                }, [
                    packageConfig.main
                ], function (value) {
                    onLoad(value);
                }, onLoad.error);
            });
        },

        normalize: function (path) {
            return path;
        },

        util: util
    };
});
