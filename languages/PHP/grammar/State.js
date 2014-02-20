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
    '../util',
    'js/util'
], function (
    phpUtil,
    util
) {
    'use strict';

    function State() {
        this.path = null;
    }

    util.extend(State.prototype, {
        getPath: function () {
            return phpUtil.normalizeModulePath(this.path);
        },

        isMainProgram: function () {
            return this.path === null;
        },

        setPath: function (path) {
            this.path = path;
        }
    });

    return State;
});
