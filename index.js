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

    modular.require({
        async: false
    }, [
        'uniter'
    ], function (
        uniter
    ) {
        module.exports = uniter;
    });
}());
