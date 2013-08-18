/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global process, require */
(function () {
    'use strict';

    var getopt = require('node-getopt'),
        modular = require('modular-amd');

    modular.require([
        'js/Uniter'
    ], function (
        Uniter
    ) {
        console.log('Implement me');
    });
}());
