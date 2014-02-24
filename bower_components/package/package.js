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

    var pluginPath = module.id.replace(/[^\/]+$/, '');

    // Expose util as a special named dependency for reuse
    define('package/util', util);

    return {
        load: function (name, req, onLoad, requirejsConfig) {
            var isolatedContextName = 'package-' + Math.random();

            // Path is normalized relative to this plugin file, prefix with path too
            if (/^\.\.?\//.test(name)) {
                name = pluginPath + name;
            }

            require({
                // Use an isolated context to load package manifest file, plugin path prefix needs path mappings
                'paths': requirejsConfig.paths,
                'context': isolatedContextName
            }, [name], function (packageConfig) {
                var baseID,
                    paths = util.extend({}, packageConfig.paths);

                // Process relative path mappings relative to package file
                baseID = (req.toUrl(name) || '').replace(/(^|\/)[^\/]*$/, '$1') || '';

                util.each(paths, function (path, index, paths) {
                    if (/^\.\.?\//.test(path)) {
                        paths[index] = baseID + path;
                    }
                });

                require({
                    // Use another isolated context to set the path mappings configured in package manifest
                    'paths': paths,
                    'context': isolatedContextName
                }, [
                    packageConfig.main
                ], function (value) {
                    onLoad(value);
                }, onLoad.error);
            }, onLoad.error);
        }
    };
});
