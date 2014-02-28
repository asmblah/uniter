/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global module, require */
(function () {
    'use strict';

    var modular = require('modular-amd');

    // FIXME!! (In Modular)
    modular.configure({
        paths: {
            'Modular': '/node_modules/modular-amd'
        }
    });

    modular.require({
        async: false
    }, [
        'uniter'
    ], function (
        uniter
    ) {
        uniter.setHostEnvironment(uniter.createHostEnvironment(function () {
            var imports = ['Array', 'Boolean', 'Function', 'Number', 'Object', 'String'],
                sandbox = {
                    result: null
                };

            imports.forEach(function (name, index) {
                imports[index] = name + ': ' + name;
            });

            require('vm').runInNewContext('result = {' + imports.join(', ') + '};', sandbox);

            return sandbox.result;
        }));

        module.exports = uniter;
    });
}());
