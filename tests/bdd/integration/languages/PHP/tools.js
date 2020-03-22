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
    Engine = require('../../../../../js/Engine');

module.exports = {
    createEngine: function (options) {
        options = options || {};

        options.ini = _.extend(
            {
                // Ensure notices are shown during test runs (E_ALL)
                'error_reporting': 32767
            },
            options.ini
        );

        return new Engine(
            phpToAST.create(null, {
                // Capture bounds of all nodes for line tracking
                captureAllBounds: true
            }),
            phpToJS,
            phpRuntime,
            phpRuntime.createEnvironment(options),
            options
        );
    }
};
