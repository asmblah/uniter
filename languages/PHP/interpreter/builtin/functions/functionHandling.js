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
        var globalNamespace = internals.globalNamespace,
            valueFactory = internals.valueFactory;

        return {
            'function_exists': function (nameReference) {
                var name = nameReference.getValue().getNative().replace(/^\\/, '');

                try {
                    globalNamespace.getFunction(name);
                } catch (e) {
                    return valueFactory.createBoolean(false);
                }

                return valueFactory.createBoolean(true);
            }
        };
    };
});
