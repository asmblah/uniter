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
    'js/Component',
    'js/Exception',
    'js/Rule'
], function (
    util,
    Component,
    Exception,
    Rule
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function Parser(grammarSpec) {
        this.grammarSpec = grammarSpec;

        (function (parser) {
            var qualifiers = {
                    // Like "(...)" grouping - 'arg' is an array of components that must all match
                    'allOf': function (text, arg) {
                        var matches = [],
                            textLength = 0;

                        util.each(arg, function (component) {
                            var componentMatch = component.match(text.substr(textLength));

                            if (componentMatch === null) {
                                matches = null;
                                return false;
                            }

                            textLength += componentMatch.textLength;
                            matches.push(componentMatch.components);
                        });

                        return matches ? {
                            components: matches,
                            textLength: textLength
                        } : null;
                    },
                    // Like "|" (alternation) - 'arg' is an array of components, one of which must match
                    'oneOf': function (text, arg) {
                        var match = null;

                        util.each(arg, function (component) {
                            var componentMatch = component.match(text);

                            if (componentMatch !== null) {
                                match = componentMatch;
                                return false;
                            }
                        });

                        return match;
                    },
                    // Like "+" - 'arg' is an array of components, one or more of which must match consecutively
                    'oneOrMoreOf': function (text, arg) {
                        var componentMatch,
                            matches = [],
                            textLength = 0;

                        while ((componentMatch = arg.match(text.substr(textLength))) !== null) {
                            textLength += componentMatch.textLength;
                            matches.push(componentMatch.components);
                        }

                        return matches.length > 0 ? {
                            components: matches,
                            textLength: textLength
                        } : null;
                    },
                    // Like "?" - 'arg' is a component which may or may not match
                    'optionally': function (text, arg) {
                        return arg.match(text) || {
                            components: '',
                            textLength: 0
                        };
                    },
                    // Refers to another rule
                    'rule': function (text, arg, args) {
                        var expectedText = hasOwn.call(args, 'text') ? args.text : null,
                            match = arg.match(text);

                        if (match === null) {
                            return null;
                        }

                        return (expectedText === null || text.substr(0, match.textLength) === expectedText) ? match : null;
                    },
                    'what': function (text, arg) {
                        var match;

                        if (util.isString(arg)) {
                            if (text.substr(0, arg.length) === arg) {
                                return {
                                    components: arg,
                                    textLength: arg.length
                                };
                            }
                        } else if (arg instanceof RegExp) {
                            match = text.match(arg);

                            if (match) {
                                return {
                                    components: match[0],
                                    textLength: match[0].length
                                };
                            }
                        } else if (arg instanceof Component) {
                            return arg.match(text);
                        } else {
                            throw new Exception('Parser "what" qualifier :: Invalid argument "' + arg + '"');
                        }

                        return null;
                    },
                    // Like "*"
                    'zeroOrMoreOf': function (text, arg) {
                        var componentMatch,
                            matches = [],
                            textLength = 0;

                        while ((componentMatch = arg.match(text.substr(textLength)))) {
                            textLength += componentMatch.textLength;
                            matches.push(componentMatch.components);
                        }

                        return {
                            components: matches,
                            textLength: textLength
                        };
                    }
                },
                rules = {};

            // Go through and create objects for all rules in this grammar first so we can set up circular references
            util.each(grammarSpec.rules, function (ruleSpec, name) {
                var rule;

                rule = new Rule(name, ruleSpec.captureAs || null, ruleSpec.ifNoMatch || null);
                rules[name] = rule;
            });

            util.each(grammarSpec.rules, function (ruleSpec, name) {
                function createComponent(componentSpec) {
                    var arg,
                        args = {},
                        name = null,
                        qualifierName = null;

                    // Component is a group
                    if (util.isArray(componentSpec)) {
                        qualifierName = 'allOf';
                        arg = [];
                        util.each(componentSpec, function (componentSpec, index) {
                            arg[index] = createComponent(componentSpec);
                        });
                    // Component is the name of another rule
                    } else if (util.isString(componentSpec)) {
                        qualifierName = 'rule';
                        arg = rules[componentSpec];

                        if (!arg) {
                            throw new Exception('Parser :: Invalid component - no rule with name "' + componentSpec + '" exists');
                        }
                    // Component is a regex terminal
                    } else if (componentSpec instanceof RegExp) {
                        qualifierName = 'what';
                        arg = componentSpec;
                    } else if (util.isPlainObject(componentSpec)) {
                        util.each(qualifiers, function (qualifier, name) {
                            var value;
                            if (hasOwn.call(componentSpec, name)) {
                                value = componentSpec[name];
                                qualifierName = name;

                                if (qualifierName === 'oneOf') {
                                    arg = [];
                                    util.each(value, function (value, index) {
                                        arg[index] = createComponent(value);
                                    });
                                } else {
                                    arg = (value instanceof RegExp) ? value : createComponent(value);
                                }

                                // Qualifier found, stop searching
                                return false;
                            }
                        });

                        if (!qualifierName) {
                            if (Object.keys(componentSpec).length !== 1) {
                                throw new Exception('Parser :: Invalid component - no valid qualifier referenced by spec: ' + JSON.stringify(componentSpec));
                            }

                            (function () {
                                var name = Object.keys(componentSpec)[0];
                                qualifierName = 'rule';

                                arg = rules[name];

                                if (!arg) {
                                    throw new Exception('Parser :: Invalid component - no rule with name "' + componentSpec + '" exists');
                                }
                                args.text = componentSpec[name];
                            }());
                        }

                        // Pull all arguments out of component spec, excluding the qualifier itself and name (if specified)
                        util.each(componentSpec, function (value, name) {
                            if (name !== qualifierName && name !== 'name') {
                                args[name] = value;
                            }
                        });

                        // Get component name if specified
                        if (hasOwn.call(componentSpec, 'name')) {
                            name = componentSpec.name;
                        }
                    } else {
                        throw new Exception('Parser :: Invalid componentSpec "' + componentSpec + '" specified');
                    }

                    if (!qualifiers[qualifierName]) {
                        throw new Exception('Parser :: Invalid component - qualifier name "' + qualifierName + '" is invalid');
                    }

                    return new Component(qualifierName, qualifiers[qualifierName], arg, args, name);
                }

                rules[name].setComponent(createComponent(ruleSpec.components || ruleSpec));
            });

            parser.startRule = rules[grammarSpec.start];
        }(this));
    }

    util.extend(Parser.prototype, {
        parse: function (text) {
            var rule = this.startRule,
                match = rule.match(text);

            return match !== null ? match.components : null;
        }
    });

    return Parser;
});
