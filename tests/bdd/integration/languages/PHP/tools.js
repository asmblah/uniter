/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var phpRuntime = require('phpruntime'),
    phpToAST = require('phptoast'),
    phpToJS = require('phptojs'),
    Engine = require('../../../../../js/Engine');

module.exports = {
    createEngine: function (options) {
        return new Engine(
            phpToAST.create(),
            phpToJS,
            phpRuntime,
            phpRuntime.createEnvironment(),
            options
        );
    }
};
