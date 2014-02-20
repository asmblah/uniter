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

    function Component(parser, matchCache, qualifierName, qualifier, arg, args, name) {
        this.arg = arg;
        this.args = args;
        this.matchCache = matchCache;
        this.name = name;
        this.parser = parser;
        this.qualifier = qualifier;
        this.qualifierName = qualifierName;
    }

    util.extend(Component.prototype, {
        match: function (text, offset, options) {
            var component = this,
                match,
                subMatch;

            if (hasOwn.call(component.matchCache, offset)) {
                return component.matchCache[offset];
            }

            subMatch = component.qualifier(text, offset, component.arg, component.args, options);

            if (subMatch === null) {
                component.matchCache[offset] = null;
                return null;
            }

            component.parser.logFurthestMatchOffset(offset + subMatch.textOffset);

            if (component.name !== null || component.args.allowMerge === false || component.args.captureOffsetAs) {
                // Component is named: don't attempt to merge an array in
                match = {
                    components: {},
                    textLength: subMatch.textLength,
                    textOffset: subMatch.textOffset
                };
                if (subMatch.name) {
                    match.components.name = subMatch.name;
                }
                if (component.name !== null) {
                    match.components[component.name] = subMatch.components;
                }

                if (component.args.captureOffsetAs) {
                    (function (offset) {
                        match.components[component.args.captureOffsetAs] = {
                            line: util.getLineNumber(text, offset),
                            offset: offset
                        };
                    }(offset + match.textOffset));
                }
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
                                util.copy(match.components, value);
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

            component.matchCache[offset] = match;

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
