/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global __dirname, process, require */
(function () {
    'use strict';

    var requirejs = require('requirejs'),
        optionsManager = require('node-getopt').create([
            ['g', 'grep=<pattern>', 'Optional filter grep to restrict tests to run']
        ]),
        parsedOptions = optionsManager.parseSystem();

    requirejs({
        baseUrl: __dirname + '/../..',
        paths: {
            'packager': 'vendor/packager/packager'
        },
        config: {
            'test-environment': {
                node: {
                    require: require,
                    rootPath: __dirname + '/../..'
                }
            }
        },
        nodeRequire: require
    }, [
        'vendor/packager/packager!tests/bdd/package'
    ], function (
        runner
    ) {
        runner({
            grep: parsedOptions.options.grep,
            reporter: 'spec'
        }, function (result) {
            process.exit(result);
        });
    });
}());
