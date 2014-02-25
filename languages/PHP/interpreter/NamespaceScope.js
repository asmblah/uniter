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

    function NamespaceScope(globalNamespace, namespace) {
        this.globalNamespace = globalNamespace;
        this.imports = {};
        this.namespace = namespace;
    }

    util.extend(NamespaceScope.prototype, {
        getClass: function (name) {
            var match,
                scope = this,
                namespace = scope.namespace,
                path,
                prefix;

            // Check whether the entire class name is aliased
            if (hasOwn.call(scope.imports, name)) {
                name = scope.imports[name];
                namespace = scope.globalNamespace;
            }

            // Check whether the class path is absolute, so no 'use's apply
            if (name.charAt(0) === '\\') {
                match = name.match(/^\\(.*?)\\([^\\]+)$/);

                if (match) {
                    path = match[1];
                    name = match[2];
                    namespace = scope.globalNamespace.getDescendant(path);
                } else {
                    name = name.substr(1);
                }
            // Check whether the namespace prefix is an alias
            } else {
                match = name.match(/^([^\\]+)(.*?)\\([^\\]+)$/);

                if (match) {
                    prefix = match[1];
                    path = match[2];
                    name = match[3];

                    if (hasOwn.call(scope.imports, prefix)) {
                        namespace = scope.globalNamespace.getDescendant(scope.imports[prefix].substr(1) + path);
                    }
                }
            }

            return namespace.getClass(name);
        },

        getFunction: function (name) {
            var match,
                scope = this,
                namespace = scope.namespace,
                path,
                prefix;

            // Check whether the function path is absolute, so no 'use's apply
            if (name.charAt(0) === '\\') {
                match = name.match(/^\\(.*?)\\([^\\]+)$/);

                if (match) {
                    path = match[1];
                    name = match[2];
                    namespace = scope.globalNamespace.getDescendant(path);
                } else {
                    name = name.substr(1);
                }
            // Check whether the namespace prefix is an alias
            } else {
                match = name.match(/^([^\\]+)(.*?)\\([^\\]+)$/);

                if (match) {
                    prefix = match[1];
                    path = match[2];
                    name = match[3];

                    if (hasOwn.call(scope.imports, prefix)) {
                        namespace = scope.globalNamespace.getDescendant(scope.imports[prefix].substr(1) + path);
                    } else {
                        // Not an alias: look up the namespace path relative to this namespace
                        // (ie. 'namespace Test { Our\Func(); }' -> '\Test\Our\Func();')
                        namespace = scope.globalNamespace.getDescendant(namespace.getPrefix() + prefix + path);
                    }
                }
            }

            return namespace.getFunction(name);
        },

        use: function (source, alias) {
            if (!alias) {
                alias = source.replace(/^.*?([^\\]+)$/, '$1');
            }

            if (source.charAt(0) !== '\\') {
                source = '\\' + source;
            }

            this.imports[alias] = source;
        }
    });

    return NamespaceScope;
});
