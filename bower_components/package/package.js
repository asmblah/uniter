/*
 * Package - AMD package plugin
 * Copyright 2014 Dan Phillimore (asmblah)
 * http://asmblah.github.com/package/
 *
 * Released under the MIT license
 * https://github.com/asmblah/package/raw/master/MIT-LICENSE.txt
 */

/*global define, require */
define([
    'module',
    './util'
], function (
    module,
    util
) {
    'use strict';

    var specialPaths = {
            'package/util': module.id.replace(/[^\/]+$/, '') + 'util'
        };

    return {
        load: function (name, req, onLoad, requirejsConfig) {
            require({
                'baseUrl': requirejsConfig.baseUrl,
                //'context': 'other'
            }, [name], function (packageConfig) {
                var baseID,
                    paths = util.extend({}, packageConfig.paths);

                // Process relative path mappings relative to package file
                baseID = (name || '').replace(/(^|\/)[^\/]*$/, '$1') || '';

                util.each(paths, function (path, index, paths) {
                    if (/^\.\.?\//.test(path)) {
                        paths[index] = baseID + path;
                    }
                });

                util.extend(paths, specialPaths);

                require({
                    'baseUrl': requirejsConfig.baseUrl,
                    'paths': paths,
                    'context': 'other'
                }, [
                    packageConfig.main
                ], function (value) {
                    onLoad(value);
                }, onLoad.error);
            }, onLoad.error);
        }
    };
});
