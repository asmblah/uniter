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
    Engine = require('./Engine');

function Uniter(phpToAST, phpToJS, phpRuntime) {
    this.phpRuntime = phpRuntime;
    this.phpToAST = phpToAST;
    this.phpToJS = phpToJS;
}

_.extend(Uniter.prototype, {
    createEngine: function (name, options) {
        var uniter = this;

        if (name !== 'PHP') {
            throw new Error('Uniter.createEngine() :: Only language "PHP" is supported');
        }

        return new Engine(
            uniter.phpToAST.create(null, {
                // Capture bounds of all nodes for line tracking
                captureAllBounds: true
            }),
            uniter.phpToJS,
            uniter.phpRuntime,
            uniter.phpRuntime.createEnvironment(),
            options
        );
    },

    createParser: function () {
        return this.phpToAST.create();
    }
});

module.exports = Uniter;
