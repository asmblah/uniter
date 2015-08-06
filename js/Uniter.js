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
    'js/util',
    'js/Engine'
], function (
    util,
    Engine
) {
    'use strict';

    function Uniter(phpToAST, phpToJS, phpRuntime) {
        this.phpRuntime = phpRuntime;
        this.phpToAST = phpToAST;
        this.phpToJS = phpToJS;
    }

    util.extend(Uniter.prototype, {
        createEngine: function (name, options) {
            var uniter = this;

            if (name !== 'PHP') {
                throw new Error('Uniter.createEngine() :: Only language "PHP" is supported');
            }

            return new Engine(
                uniter.phpToAST.create(),
                uniter.phpToJS,
                uniter.phpRuntime,
                uniter.phpRuntime.createEnvironment(),
                options
            );
        }
    });

    return Uniter;
});
