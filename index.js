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
    Uniter = require('./js/Uniter');

module.exports = new Uniter(phpToAST, phpToJS, phpRuntime);
