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
    'languages/PHP/interpreter/Variable'
], function (
    Variable
) {
    'use strict';

    var INCLUDE_PATH_INI = 'include_path';

    return function (internals) {
        var iniState = internals.iniState,
            valueFactory = internals.valueFactory;

        return {
            'dirname': function (pathReference) {
                var isReference = (pathReference instanceof Variable),
                    pathValue = isReference ? pathReference.getValue() : pathReference,
                    path = pathValue.getNative();

                if (path && path.indexOf('/') === -1) {
                    path = '.';
                } else {
                    path = path.replace(/\/[^\/]+$/, '');
                }

                pathValue = valueFactory.createString(path);

                return pathValue;
            },
            'get_include_path': function () {
                return valueFactory.createString(iniState.get(INCLUDE_PATH_INI));
            },
            'set_include_path': function (newIncludePathReference) {
                var oldIncludePath = iniState.get(INCLUDE_PATH_INI);

                iniState.set(INCLUDE_PATH_INI, newIncludePathReference.getValue().getNative());

                return valueFactory.createString(oldIncludePath);
            }
        };
    };
});
