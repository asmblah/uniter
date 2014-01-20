/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

// FIXME!! (In Modular)
require.config({
    paths: {
        'Modular': '/../../modular'
    }
});

/*global define */
define({
    cache: false
}, [
    'modular',
    'require',

    // Mocha has to be handled specially as it is not an AMD module
    'mocha/mocha'
], function (
    modular,
    require
) {
    'use strict';

    var global = modular.util.global,
        query = global.Mocha.utils.parseQuery(global.location.search || '');

    define('test-environment', {});

    define('Mocha', function () {
        return global.Mocha;
    });

    require([
        './runner'
    ], function (
        runner
    ) {
        runner({
            grep: query.grep,
            reporter: 'html'
        });
    });
});
