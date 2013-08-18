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

    function Rule(name, captureName, ifNoMatch) {
        this.captureName = captureName;
        this.component = null;
        this.ifNoMatch = ifNoMatch;
        this.name = name;
    }

    util.extend(Rule.prototype, {
        match: function (text) {
            var rule = this,
                match = rule.component.match(text);

            if (match === null) {
                return null;
            }

            if (rule.ifNoMatch && match.components[rule.ifNoMatch.component].length === 0) {
                match = {
                    components: match.components[rule.ifNoMatch.capture],
                    textLength: match.textLength
                };
            } else {
                if (!util.isString(match.components)) {
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
