/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define(function () {
    'use strict';

    return function (internals) {
        var globalNamespace = internals.globalNamespace;

        return {
            'define': function (name, value, isCaseInsensitive) {
                var match,
                    namespace,
                    path;

                name = name.toValue().getNative();
                isCaseInsensitive = isCaseInsensitive ? isCaseInsensitive.toValue().getNative() : false;
                value = value.toValue();

                name = name.replace(/^\//, '');
                match = name.match(/^(.*?)\\([^\\]+)$/);

                if (match) {
                    path = match[1];
                    name = match[2];
                    namespace = globalNamespace.getDescendant(path);
                } else {
                    namespace = globalNamespace;
                }

                namespace.defineConstant(name, value, {
                    caseInsensitive: isCaseInsensitive
                });
            }
        };
    };
});
