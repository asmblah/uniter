/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global __dirname, module, require */
(function () {
    'use strict';

    var requirejs = require('requirejs');

    requirejs.nextTick = function (fn) {
        fn();
    };

    requirejs.config({
        baseUrl: __dirname
    });

    module.exports = requirejs('uniter');
}());
