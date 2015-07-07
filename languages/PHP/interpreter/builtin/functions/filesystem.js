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
    'languages/PHP/interpreter/Error',
    'languages/PHP/interpreter/Variable'
], function (
    PHPError,
    Variable
) {
    'use strict';

    return function (internals) {
        var valueFactory = internals.valueFactory;

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
            }
        };
    };
});
