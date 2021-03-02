/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    phpRuntime = require('phpruntime'),
    phpToAST = require('phptoast'),
    phpToJS = require('phptojs'),
    Uniter = require('../../../../../js/Uniter');

module.exports = {
    createEngine: function (options) {
        var uniter = new Uniter(phpToAST, phpToJS, phpRuntime);

        options = options || {};

        options.ini = _.extend(
            {
                // Ensure notices are shown during test runs (E_ALL)
                'error_reporting': 32767
            },
            options.ini
        );

        return uniter.createEngine('PHP', options);
    }
};
