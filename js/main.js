/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'phpruntime',
    'phptoast',
    'phptojs',
    'js/Uniter'
], function (
    phpRuntime,
    phpToAST,
    phpToJS,
    Uniter
) {
    'use strict';

    return new Uniter(phpToAST, phpToJS, phpRuntime);
});
