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
    'js/Scope'
], function (
    util,
    Scope
) {
    'use strict';

    function GlobalScope() {
        Scope.call(this);
    }

    util.inherit(GlobalScope).from(Scope);

    util.extend(GlobalScope.prototype, {

    });

    return GlobalScope;
});
