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

    function Rule(name, captureName, ifNoMatch, options) {
        this.captureName = captureName;
        this.component = null;
        this.ifNoMatch = ifNoMatch;
        this.name = name;
        this.options = options;
    }

    util.extend(Rule.prototype, {
        match: function (text, offset, options) {
            var component,
                rule = this,
                match;

            options = options || {};

            match = rule.component.match(text, offset, options);

            if (match === null) {
                return null;
            }

            if (typeof match.components === 'object') {
                util.copy(match.components, rule.options);
            }

            if (rule.ifNoMatch && (!(component = match.components[rule.ifNoMatch.component]) || component.length === 0)) {
                match = {
                    components: match.components[rule.ifNoMatch.capture],
                    textOffset: match.textOffset,
                    textLength: match.textLength
                };
            } else {
                if (!util.isString(match.components) && !match.components.name) {
                    match.components.name = rule.captureName || rule.name;
                }
            }

            return match;
        },

        setComponent: function (component) {
            this.component = component;
        }
    });

    return Rule;
});
