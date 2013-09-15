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
    '../Namespace'
], function (
    util,
    Namespace
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function NamespaceCollection() {
        this.namespaces = {};
    }

    util.extend(NamespaceCollection.prototype, {
        get: function (name) {
            var collection = this;

            if (!hasOwn.call(collection.namespaces, name)) {
                collection.namespaces[name] = new Namespace(name);
            }

            return collection.namespaces[name];
        }
    });

    return NamespaceCollection;
});
