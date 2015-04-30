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
    'js/Exception/Exception',
    'js/Exception/Parse',
    'js/Rule'
], function (
    util,
    Component,
    Exception,
    ParseException,
    Rule
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function Parser(grammarSpec, stderr) {
        this.errorHandler = null;
        this.furthestIgnoreMatch = null;
        this.furthestIgnoreMatchOffset = -1;
        this.furthestMatch = null;
        this.furthestMatchOffset = -1;
        this.grammarSpec = grammarSpec;
        this.matchCaches = [];
        this.state = null;
        this.stderr = stderr;

        (function (parser) {
            // Ensure the regex is anchored to the start of the string so it matches the very next characters
            function anchorRegex(regex) {
                if (regex.source.charAt(0) !== '^') {
                    regex = new RegExp('^(?:' + regex.source + ')', regex.toString().match(/[^\/]*$/)[0]);
                }

                return regex;
            }

            // Speed up repeated match tests in complex grammars by caching component matches
            function createMatchCache() {
                var matchCache = {};
                parser.matchCaches.push(matchCache);
                return matchCache;
            }

            var qualifiers = {
                    // Like "(...)" grouping - 'arg' is an array of components that must all match
                    'allOf': function (text, offset, arg, args, options) {
                        var matches = [],
                            textLength = 0,
                            textOffset = null;

                        util.each(arg, function (component) {
                            var componentMatch = component.match(text, offset + (textOffset || 0) + textLength, options);

                            if (componentMatch === null) {
                                matches = null;
                                return false;
                            }

                            textLength += componentMatch.textLength;
                            matches.push(componentMatch.components);

                            if (textOffset === null) {
                                textOffset = componentMatch.textOffset;
                            } else {
                                textLength += componentMatch.textOffset;
                            }
                        });

                        return matches ? {
                            components: matches,
                            textLength: textLength,
                            textOffset: textOffset || 0
                        } : null;
                    },
                    // Like "|" (alternation) - 'arg' is an array of components, one of which must match
                    'oneOf': function (text, offset, arg, args, options) {
                        var match = null;

                        util.each(arg, function (component) {
                            var componentMatch = component.match(text, offset, options);

                            if (componentMatch !== null) {
                                match = componentMatch;
                                return false;
                            }
                        });

                        return match;
                    },
                    // Like "+" - 'arg' is an array of components, one or more of which must match consecutively
                    'oneOrMoreOf': function (text, offset, arg, args, options) {
                        var componentMatch,
                            matches = [],
                            textLength = 0,
                            textOffset = null;

                        while ((componentMatch = arg.match(text, offset + (textOffset || 0) + textLength, options)) !== null) {
                            textLength += componentMatch.textLength;
                            matches.push(componentMatch.components);

                            if (textOffset === null) {
                                textOffset = componentMatch.textOffset;
                            } else {
                                textLength += componentMatch.textOffset;
                            }
                        }

                        return matches.length > 0 ? {
                            components: matches,
                            textLength: textLength,
                            textOffset: textOffset || 0
                        } : null;
                    },
                    // Like "?" - 'arg' is a component which may or may not match
                    'optionally': function (text, offset, arg, args, options) {
                        var match = arg.match(text, offset, options);

                        if (match) {
                            if (args.wrapInArray) {
                                return {
                                    components: [match.components],
                                    textLength: match.textLength,
                                    textOffset: match.textOffset
                                };
                            }

                            return match;
                        }

                        return {
                            components: args.wrapInArray ? [] : '',
                            textLength: 0,
                            textOffset: 0
                        };
                    },
                    // Refers to another rule
                    'rule': function (text, offset, arg, args, options) {
                        var expectedText = hasOwn.call(args, 'text') ? args.text : null,
                            match = arg.match(text, offset, options);

                        if (match === null) {
                            return null;
                        }

                        return (expectedText === null || text.substr(offset + match.textOffset, match.textLength) === expectedText) ? match : null;
                    },
                    'what': function (text, offset, arg, args, options) {
                        var captureIndex,
                            match,
                            result,
                            whitespaceLength = 0;

                        function skipWhitespace() {
                            var match;
                            if (parser.ignoreRule && options.ignoreWhitespace !== false && args.ignoreWhitespace !== false) {
                                // Prevent infinite recursion of whitespace skipper
                                while ((match = parser.ignoreRule.match(text, offset + whitespaceLength, {ignoreWhitespace: false}))) {
                                    whitespaceLength += match.textLength;
                                }
                            }
                        }

                        function replace(string) {
                            if (args.replace) {
                                util.each(args.replace, function (data) {
                                    string = string.replace(data.pattern, data.replacement);
                                });
                            }

                            return string;
                        }

                        if (util.isString(arg)) {
                            skipWhitespace();

                            if (text.substr(offset + whitespaceLength, arg.length) === arg) {
                                return {
                                    components: arg,
                                    textLength: arg.length,
                                    textOffset: whitespaceLength
                                };
                            }
                        } else if (arg instanceof RegExp) {
                            skipWhitespace();

                            match = text.substr(offset + whitespaceLength).match(arg);

                            if (match) {
                                captureIndex = args.captureIndex || 0;
                                return {
                                    components: replace(match[captureIndex]),
                                    // Always return the entire match length even though we may have only captured part of it
                                    textLength: match[0].length,
                                    textOffset: whitespaceLength
                                };
                            }
                        } else if (arg instanceof Component) {
                            result = arg.match(text, offset, options);

                            if (util.isString(result)) {
                                result = replace(result);
                            } else if (result && util.isString(result.components)) {
                                result.components = replace(result.components);
                            }

                            return result;
                        } else if (util.isFunction(arg)) {
                            skipWhitespace();

                            return arg(text, offset, whitespaceLength, options);
                        } else {
                            throw new Exception('Parser "what" qualifier :: Invalid argument "' + arg + '"');
                        }

                        return null;
                    },
                    // Like "*"
                    'zeroOrMoreOf': function (text, offset, arg, args, options) {
                        var componentMatch,
                            matches = [],
                            textLength = 0,
                            textOffset = null;

                        while ((componentMatch = arg.match(text, offset + (textOffset || 0) + textLength, options))) {
                            textLength += componentMatch.textLength;
                            matches.push(componentMatch.components);

                            if (textOffset === null) {
                                textOffset = componentMatch.textOffset;
                            } else {
                                textLength += componentMatch.textOffset;
                            }
                        }

                        return {
                            components: matches,
                            textLength: textLength,
                            textOffset: textOffset || 0
                        };
                    }
                },
                rules = {};

            // Special BeginningOfFile rule
            rules['<BOF>'] = new Rule('<BOF>', null, null);
            rules['<BOF>'].setComponent(new Component(parser, createMatchCache(), 'what', qualifiers.what, function (text, offset, textOffset) {
                return offset === 0 ? {
                    components: '',
                    textLength: 0,
                    textOffset: textOffset
                } : null;
            }, {}, null));

            // Special EndOfFile rule
            rules['<EOF>'] = new Rule('<EOF>', null, null);
            rules['<EOF>'].setComponent(new Component(parser, createMatchCache(), 'what', qualifiers.what, function (text, offset, textOffset) {
                return offset + textOffset === text.length ? {
                    components: '',
                    textLength: 0,
                    textOffset: textOffset
                } : null;
            }, {}, null));

            // Go through and create objects for all rules in this grammar first so we can set up circular references
            util.each(grammarSpec.rules, function (ruleSpec, name) {
                var rule;

                rule = new Rule(name, ruleSpec.captureAs || null, ruleSpec.ifNoMatch || null, ruleSpec.options || null);
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
                        componentSpec = anchorRegex(componentSpec);

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
                                } else if (qualifierName === 'optionally') {
                                    arg = createComponent(value);
                                } else {
                                    arg = (value instanceof RegExp) ? anchorRegex(value) : createComponent(value);
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
                                    throw new Exception('Parser :: Invalid component - no rule with name "' + name + '" exists');
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

                    return new Component(parser, createMatchCache(), qualifierName, qualifiers[qualifierName], arg, args, name);
                }

                rules[name].setComponent(createComponent(ruleSpec.components || ruleSpec));
            });

            parser.ignoreRule = rules[grammarSpec.ignore] || null;
            parser.startRule = rules[grammarSpec.start];
        }(this));
    }

    util.extend(Parser.prototype, {
        getErrorHandler: function () {
            var parser = this;

            if (!parser.errorHandler && parser.grammarSpec.ErrorHandler) {
                parser.errorHandler = new parser.grammarSpec.ErrorHandler(parser.stderr, parser.getState());
            }

            return parser.errorHandler;
        },

        getState: function () {
            var parser = this;

            if (!parser.state && parser.grammarSpec.State) {
                parser.state = new parser.grammarSpec.State();
            }

            return parser.state;
        },

        logFurthestIgnoreMatch: function (match, offset) {
            var parser = this;

            if (offset >= parser.furthestIgnoreMatchOffset && match.textLength > 0) {
                parser.furthestIgnoreMatch = match;
                parser.furthestIgnoreMatchOffset = offset;
            }
        },

        logFurthestMatch: function (match, offset) {
            var parser = this;

            if (offset >= parser.furthestMatchOffset && match.textLength > 0) {
                parser.furthestMatch = match;
                parser.furthestMatchOffset = offset;
            }
        },

        parse: function (text, options) {
            var parser = this,
                errorHandler = parser.getErrorHandler(),
                rule = parser.startRule,
                match;

            util.each(parser.matchCaches, function (matchCache) {
                util.each(matchCache, function (value, name) {
                    delete matchCache[name];
                });
            });

            parser.furthestIgnoreMatch = null;
            parser.furthestIgnoreMatchOffset = -1;
            parser.furthestMatch = null;
            parser.furthestMatchOffset = -1;

            match = rule.match(text, 0, options);

            if (errorHandler && (match === null || match.textLength < text.length)) {
                errorHandler.handle(new ParseException('Parser.parse() :: Unexpected ' + (match ? '"' + text.charAt(match.textLength) + '"' : '$end'), text, parser.furthestMatch, parser.furthestMatchOffset, parser.furthestIgnoreMatch, parser.furthestIgnoreMatchOffset));
            }

            return match !== null ? match.components : null;
        }
    });

    return Parser;
});
