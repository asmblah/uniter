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
    ScriptLoader = require('./js/ScriptLoader'),
    Uniter = require('./js/Uniter'),
    scriptLoader,
    uniter;

uniter = new Uniter(phpToAST, phpToJS, phpRuntime);
scriptLoader = new ScriptLoader(global, 'script[type="text/x-uniter-php"]', uniter);

scriptLoader.loadScripts();

module.exports = uniter;
