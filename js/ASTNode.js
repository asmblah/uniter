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
    'js/util'
], function (
    util
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function ASTNode(children) {
        this.children = children;
    }

    util.extend(ASTNode.prototype, {
        getChild: function (name) {
            var children = this.children;

            return hasOwn.call(children, name) ? children[name] : null;
        }
    });

    return ASTNode;
});
