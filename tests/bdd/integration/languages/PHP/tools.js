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
    'js/Engine'
], function (
    phpRuntime,
    phpToAST,
    phpToJS,
    Engine
) {
    'use strict';

    return {
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
});
