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

/*global define, document */
define({
    cache: false,
    baseUrl: '../'
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
        iframe = document.createElement('iframe'),
        query = global.Mocha.utils.parseQuery(global.location.search || ''),
        sandboxGlobal;

    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    sandboxGlobal = iframe.contentWindow;

    define('test-environment', {
        sandboxGlobal: sandboxGlobal
    });

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
