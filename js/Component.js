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

    function Component(qualifierName, qualifier, arg, args, name) {
        this.arg = arg;
        this.args = args;
        this.name = name;
        this.qualifier = qualifier;
        this.qualifierName = qualifierName;
    }

    util.extend(Component.prototype, {
        match: function (text, offset, options) {
            var component = this,
                match,
                subMatch = component.qualifier(text, offset, component.arg, component.args, options);

            if (subMatch === null) {
                return null;
            }

            if (component.name !== null) {
                // Component is named: don't attempt to merge an array in
                match = {
                    components: {},
                    textLength: subMatch.textLength,
                    textOffset: subMatch.textOffset
                };
                if (subMatch.name) {
                    match.components.name = subMatch.name;
                }
                match.components[component.name] = subMatch.components;
            } else {
                // Component is not named: merge its captures in if an array
                if (util.isArray(subMatch.components)) {
                    if (allElementsAreStrings(subMatch.components)) {
                        match = {
                            components: subMatch.components.join(''),
                            textLength: subMatch.textLength
                        };
                    } else {
                        match = {
                            components: {},
                            textLength: subMatch.textLength
                        };
                        util.each(subMatch.components, function (value) {
                            if (util.isPlainObject(value)) {
                                util.extend(match.components, value);
                            }
                        });
                    }

                    if (subMatch.name) {
                        match.components.name = subMatch.name;
                    }

                    match.textOffset = subMatch.textOffset;
                } else {
                    match = subMatch;
                }
            }

            return match;
        }
    });

    function allElementsAreStrings(array) {
        var allStrings = true;
        util.each(array, function (element) {
            if (!util.isString(element)) {
                allStrings = false;
                return false;
            }
        });
        return allStrings;
    }

    return Component;
});
