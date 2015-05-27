(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.uniter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util');
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

            if (options.ignoreWhitespace !== false) {
                component.parser.logFurthestMatch(subMatch, offset + subMatch.textOffset);
            } else {
                component.parser.logFurthestIgnoreMatch(subMatch, offset + subMatch.textOffset);
            }

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
module.exports = Component;}());

},{"./util":51}],2:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util'), Exception = require('./Exception/Exception'), Promise = require('./Promise');
function Engine(parser, interpreter) {
        this.interpreter = interpreter;
        this.parser = parser;
    }
util.extend(Engine.prototype, {
        configure: function (options) {
            this.interpreter.configure(options);
        },

        execute: function (code, path) {
            var ast,
                engine = this,
                promise = new Promise();

            path = arguments.length > 1 ? path : null;

            engine.parser.getState().setPath(path);
            engine.interpreter.getState().setPath(path);

            try {
                ast = engine.parser.parse(code);
                engine.interpreter.interpret(ast).done(function (value, type) {
                    promise.resolve(value, type);
                }).fail(function (exception) {
                    promise.reject(exception);
                });
            } catch (exception) {
                if (!(exception instanceof Exception)) {
                    throw exception;
                }
                promise.reject(exception);
            }

            return promise;
        },

        expose: function (object, name) {
            this.interpreter.expose(object, name);
        },

        getEnvironment: function () {
            return this.interpreter.getEnvironment();
        },

        getStderr: function () {
            return this.interpreter.stderr;
        },

        getStdin: function () {
            return this.interpreter.stdin;
        },

        getStdout: function () {
            return this.interpreter.stdout;
        }
    });
module.exports = Engine;}());

},{"./Exception/Exception":4,"./Promise":9,"./util":51}],3:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util');
function EventEmitter() {
        this.listeners = {};
    }
util.extend(EventEmitter.prototype, {
        emit: function (eventName) {
            var args = [].slice.call(arguments, 1),
                eventEmitter = this,
                listeners = eventEmitter.listeners[eventName];

            if (listeners) {
                util.each(listeners, function (listener) {
                    listener.callback.apply(eventEmitter, args);
                });
            }

            return eventEmitter;
        },

        off: function (eventName, filter, callback) {
            var eventEmitter = this,
                listeners = eventEmitter.listeners[eventName];

            if (util.isFunction(filter)) {
                callback = filter;
                filter = null;
            }

            if (listeners) {
                util.each(listeners, function (listener, index) {
                    if (listener.callback === callback && listener.filter === filter) {
                        listeners.splice(index, 1);
                        return false;
                    }
                });
            }

            return eventEmitter;
        },

        on: function (eventName, filter, callback) {
            var eventEmitter = this;

            if (!eventEmitter.listeners[eventName]) {
                eventEmitter.listeners[eventName] = [];
            }

            if (util.isFunction(filter)) {
                callback = filter;
                filter = null;
            }

            if (filter) {
                callback = (function (callback) {
                    return function () {
                        var actualArgs = [].slice.call(arguments),
                            match = true;

                        util.each(filter, function (expectedArg, index) {
                            if (actualArgs[index] !== expectedArg) {
                                match = false;
                                return false;
                            }
                        });

                        if (match) {
                            callback.apply(eventEmitter, actualArgs.slice(filter.length));
                        }
                    };
                }(callback));
            }

            eventEmitter.listeners[eventName].push({
                callback: callback,
                filter: filter
            });

            return eventEmitter;
        },

        one: function (eventName, filter, callback) {
            var eventEmitter = this;

            return eventEmitter.on(eventName, filter, function proxy() {
                eventEmitter.off(eventName, filter, proxy);

                callback.apply(this, arguments);
            });
        }
    });
module.exports = EventEmitter;}());

},{"./util":51}],4:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../util');
function Exception(message) {
        this.message = message;
    }
util.inherit(Exception).from(Error);
util.extend(Exception.prototype, {
        type: 'Exception',

        getMessage: function () {
            return this.message;
        }
    });
module.exports = Exception;}());

},{"./../util":51}],5:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../util'), Exception = require('./Exception');
function ParseException(message, text, furthestMatch, furthestMatchOffset, furthestIgnoreMatch, furthestIgnoreMatchOffset) {
        Exception.call(this, message);

        this.furthestIgnoreMatch = furthestIgnoreMatch;
        this.furthestIgnoreMatchOffset = furthestIgnoreMatchOffset;
        this.furthestMatch = furthestMatch;
        this.furthestMatchOffset = furthestMatchOffset;
        this.text = text;
    }
util.inherit(ParseException).from(Exception);
util.extend(ParseException.prototype, {
        getFurthestMatchEnd: function () {
            var exception = this;

            if (exception.furthestIgnoreMatchOffset > exception.furthestMatchOffset) {
                return exception.furthestIgnoreMatchOffset + exception.furthestIgnoreMatch.textLength;
            }

            return exception.furthestMatchOffset + exception.furthestMatch.textLength;
        },

        getLineNumber: function () {
            var exception = this;

            return util.getLineNumber(exception.text, exception.getFurthestMatchEnd());
        },

        getText: function () {
            return this.text;
        },

        unexpectedEndOfInput: function () {
            var exception = this;

            return exception.getFurthestMatchEnd() === exception.text.length;
        }
    });
module.exports = ParseException;}());

},{"./../util":51,"./Exception":4}],6:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util'), Exception = require('./Exception/Exception');
var hasOwn = {}.hasOwnProperty;
function Interpreter(spec, stdin, stdout, stderr, options) {
        this.engine = null;
        this.environment = null;
        this.options = options || {};
        this.spec = spec;
        this.state = null;
        this.stderr = stderr;
        this.stdin = stdin;
        this.stdout = stdout;
    }
util.extend(Interpreter.prototype, {
        configure: function (options) {
            util.extend(this.options, options);
        },

        expose: function (object, name) {
            var globalScope = this.getEnvironment().getGlobalScope();

            globalScope.expose(object, name);
        },

        getEnvironment: function () {
            var interpreter = this;

            if (!interpreter.environment) {
                interpreter.environment = new interpreter.spec.Environment(interpreter.getState());
            }

            return interpreter.environment;
        },

        getState: function () {
            var interpreter = this,
                spec = interpreter.spec;

            if (!interpreter.state && spec.State) {
                interpreter.state = new spec.State(
                    interpreter.stdout,
                    interpreter.stderr,
                    interpreter.engine,
                    interpreter.options
                );
            }

            return interpreter.state;
        },

        interpret: function (node, data) {
            var interpreter = this,
                nodeName,
                spec = interpreter.spec,
                stderr = interpreter.stderr,
                stdin = interpreter.stdin,
                stdout = interpreter.stdout;

            if (!hasOwn.call(node, 'name')) {
                throw new Exception('Interpreter.interpret() :: Invalid AST node provided');
            }

            if (arguments.length === 1) {
                data = interpreter.getState();
            }

            nodeName = node.name;

            if (!hasOwn.call(spec.nodes, nodeName)) {
                throw new Exception('Interpreter.interpret() :: Spec does not define how to handle node "' + nodeName + '"');
            }

            return spec.nodes[nodeName].call(interpreter, node, function (node, newData) {
                if (arguments.length === 1) {
                    newData = data;
                } else if (newData && (typeof newData === 'object')) {
                    newData = util.extend({}, data, newData);
                }

                if (util.isString(node)) {
                    return node;
                } else {
                    return interpreter.interpret(node, newData);
                }
            }, data, stdin, stdout, stderr);
        },

        setEngine: function (engine) {
            this.engine = engine;
        }
    });
module.exports = Interpreter;}());

},{"./Exception/Exception":4,"./util":51}],7:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util'), Engine = require('./Engine'), Interpreter = require('./Interpreter'), Parser = require('./Parser'), Stream = require('./Stream');
function Language(name, grammarSpec, interpreterSpec) {
        this.name = name;
        this.grammarSpec = grammarSpec;
        this.interpreterSpec = interpreterSpec;
    }
util.extend(Language.prototype, {
        createEngine: function (options) {
            var language = this,
                stderr = new Stream(),
                stdin = new Stream(),
                stdout = new Stream(),
                interpreter = new Interpreter(language.interpreterSpec, stdin, stdout, stderr, options),
                parser = new Parser(language.grammarSpec, stderr),
                engine = new Engine(parser, interpreter);

            interpreter.setEngine(engine);

            return engine;
        },

        createParser: function () {
            var language = this,
                stderr = new Stream(),
                parser = new Parser(language.grammarSpec, stderr);

            return parser;
        },

        getName: function () {
            return this.name;
        }
    });
module.exports = Language;}());

},{"./Engine":2,"./Interpreter":6,"./Parser":8,"./Stream":48,"./util":51}],8:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util'), Component = require('./Component'), Exception = require('./Exception/Exception'), ParseException = require('./Exception/Parse'), Rule = require('./Rule');
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

                rule = new Rule(
                    name,
                    ruleSpec.captureAs || null,
                    ruleSpec.ifNoMatch || null,
                    ruleSpec.processor || null,
                    ruleSpec.options || null
                );
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
module.exports = Parser;}());

},{"./Component":1,"./Exception/Exception":4,"./Exception/Parse":5,"./Rule":46,"./util":51}],9:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util'), SimplePromise = require('./SimplePromise');
var parent = SimplePromise.prototype,
        slice = [].slice;
function Promise() {
        SimplePromise.call(this);
    }
util.inherit(Promise).from(SimplePromise);
util.extend(Promise.prototype, {
        always: function (callback) {
            return this.then(callback, callback);
        },

        done: function (callback) {
            return this.then(callback);
        },

        fail: function (callback) {
            return this.then(null, callback);
        },

        resolve: function () {
            return parent.resolve.call(this, slice.call(arguments));
        },

        then: function (onResolve, onReject) {
            return parent.then.call(this, onResolve ? function (args) {
                onResolve.apply(null, args);
            } : null, onReject);
        }
    });
module.exports = Promise;}());

},{"./SimplePromise":47,"./util":51}],10:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var esprima = require('esprima'), estraverse = require('estraverse'), util = require('./../util');
var Syntax = estraverse.Syntax;
function BlockContext(functionContext) {
        this.functionContext = functionContext;
        this.switchCases = [];
        this.transformNext = null;
    }
util.extend(BlockContext.prototype, {
        addAssignment: function (name) {
            var context = this,
                index = context.functionContext.getNextStatementIndex();

            return {
                assign: function (expressionNode) {
                    if (!expressionNode) {
                        throw new Error('Expression node must be specified');
                    }

                    context.functionContext.addAssignment(index, name);

                    context.switchCases[index] = createSwitchCase(
                        {
                            'type': Syntax.ExpressionStatement,
                            'expression': {
                                'type': Syntax.AssignmentExpression,
                                'operator': '=',
                                'left': {
                                    'type': Syntax.Identifier,
                                    'name': name
                                },
                                'right': expressionNode
                            }
                        },
                        index
                    );
                }
            };
        },

        getSwitchStatement: function () {
            var switchCases = [];

            util.each(this.switchCases, function (switchCase) {
                if (switchCase) {
                    if (util.isArray(switchCase)) {
                        [].push.apply(switchCases, switchCase);
                    } else {
                        switchCases.push(switchCase);
                    }
                }
            });

            return {
                'type': Syntax.SwitchStatement,
                'discriminant': {
                    'type': Syntax.Identifier,
                    'name': 'statementIndex'
                },
                'cases': switchCases
            };
        },

        prepareStatement: function () {
            var context = this,
                endIndex = null,
                index = context.functionContext.getNextStatementIndex();

            return {
                assign: function (statementNode, nextIndex) {
                    var i,
                        switchCases = [];

                    if (context.transformNext) {
                        statementNode = context.transformNext(statementNode);
                        context.transformNext = null;
                    }

                    if (!endIndex) {
                        endIndex = context.functionContext.getCurrentStatementIndex();
                    }

                    for (i = index; i < endIndex - 1; i++) {
                        switchCases.push({
                            type: Syntax.SwitchCase,
                            test: {
                                type: Syntax.Literal,
                                value: i
                            },
                            consequent: i === index ? [
                                esprima.parse('statementIndex = ' + (index + 1) + ';').body[0]
                            ] : []
                        });
                    }

                    switchCases.push(createSwitchCase(statementNode, endIndex - 1, nextIndex));

                    context.switchCases[index] = switchCases;
                },

                captureEndIndex: function () {
                    endIndex = context.functionContext.getCurrentStatementIndex();
                },

                getEndIndex: function () {
                    return endIndex;
                },

                getIndex: function () {
                    return index;
                }
            };
        },

        transformNextStatement: function (transformer) {
            this.transformNext = transformer;
        }
    });
function createSwitchCase(statementNode, index, nextIndex) {
        if (!nextIndex) {
            nextIndex = index + 1;
        }

        return {
            type: Syntax.SwitchCase,
            test: {
                type: Syntax.Literal,
                value: index
            },
            consequent: [
                statementNode,
                esprima.parse('statementIndex = ' + nextIndex + ';').body[0]
            ]
        };
    }
module.exports = BlockContext;}());

},{"./../util":51,"esprima":120,"estraverse":121}],11:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var ELEMENTS = 'elements',
        Syntax = estraverse.Syntax;
function ArrayExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(ArrayExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ArrayExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            return {
                'type': Syntax.ArrayExpression,
                'elements': transpiler.expressionTranspiler.transpileArray(node[ELEMENTS], node, functionContext, blockContext)
            };
        }
    });
module.exports = ArrayExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],12:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var LEFT = 'left',
        OPERATOR = 'operator',
        RIGHT = 'right',
        Syntax = estraverse.Syntax;
function AssignmentExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(AssignmentExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.AssignmentExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var left,
                right,
                transpiler = this;

            left = transpiler.expressionTranspiler.transpile(node[LEFT], node, functionContext, blockContext, {
                assignment: true
            });

            if (node[OPERATOR] === '=') {
                right = node[RIGHT];
            } else {
                right = {
                    'type': Syntax.BinaryExpression,
                    'operator': node[OPERATOR].charAt(0),
                    'left': node[LEFT],
                    'right': node[RIGHT]
                };
            }

            right = transpiler.expressionTranspiler.transpile(right, node, functionContext, blockContext);

            return {
                'type': Syntax.AssignmentExpression,
                'operator': '=',
                'left': left,
                'right': right
            };
        }
    });
module.exports = AssignmentExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],13:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var LEFT = 'left',
        OPERATOR = 'operator',
        RIGHT = 'right',
        Syntax = estraverse.Syntax;
function BinaryExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(BinaryExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.BinaryExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var left,
                right,
                transpiler = this;

            left = transpiler.expressionTranspiler.transpile(node[LEFT], node, functionContext, blockContext);
            right = transpiler.expressionTranspiler.transpile(node[RIGHT], node, functionContext, blockContext);

            return {
                'type': Syntax.BinaryExpression,
                'operator': node[OPERATOR],
                'left': left,
                'right': right
            };
        }
    });
module.exports = BinaryExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],14:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var ARGUMENTS = 'arguments',
        CALLEE = 'callee',
        OBJECT = 'object',
        TYPE = 'type',
        Syntax = estraverse.Syntax;
function CallExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(CallExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.CallExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var args = node[ARGUMENTS],
                assignments,
                callee,
                callNode,
                transpiler = this,
                tempNameForAssignment;

            functionContext.clearLastAssignments();

            callee = transpiler.expressionTranspiler.transpile(node[CALLEE], node, functionContext, blockContext);

            assignments = functionContext.getLastAssignments();

            args = transpiler.expressionTranspiler.transpileArray(args, node, functionContext, blockContext);

            if (node[CALLEE][TYPE] === Syntax.MemberExpression) {
                // Change callee to a '... .call(...)' to preserve thisObj
                args = [
                    assignments.length > 1 ?
                        {
                            'type': Syntax.Identifier,
                            'name': assignments[assignments.length - 2]
                        } :
                        node[CALLEE][OBJECT]
                ].concat(args);

                callee = {
                    'type': Syntax.MemberExpression,
                    'object': callee,
                    'property': {
                        'type': Syntax.Identifier,
                        'name': 'call',
                    },
                    'computed': false
                };
            }

            callNode = {
                'type': Syntax.CallExpression,
                'callee': callee,
                'arguments': args
            };

            if (parent[TYPE] === Syntax.ExpressionStatement) {
                return callNode;
            }

            tempNameForAssignment = functionContext.getTempName();
            blockContext.addAssignment(tempNameForAssignment).assign(callNode);

            return {
                'type': Syntax.Identifier,
                'name': tempNameForAssignment
            };
        }
    });
module.exports = CallExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],15:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var TYPE = 'type',
        hasOwn = {}.hasOwnProperty;
function ExpressionTranspiler() {
        this.transpilers = {};
    }
util.extend(ExpressionTranspiler.prototype, {
        addTranspiler: function (transpiler) {
            this.transpilers[transpiler.getNodeType()] = transpiler;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            if (!hasOwn.call(transpiler.transpilers, node[TYPE])) {
                return node;
            }

            return transpiler.transpilers[node[TYPE]].transpile(node, parent, functionContext, blockContext);
        },

        transpileArray: function (array, parent, functionContext, blockContext) {
            var result = [],
                transpiler = this;

            util.each(array, function (expressionNode) {
                result.push(transpiler.transpile(expressionNode, parent, functionContext, blockContext));
            });

            return result;
        }
    });
module.exports = ExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],16:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var Syntax = estraverse.Syntax;
function FunctionExpressionTranspiler(statementTranspiler, expressionTranspiler, functionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.functionTranspiler = functionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(FunctionExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.FunctionExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            return this.functionTranspiler.transpile(node, parent, functionContext, blockContext);
        }
    });
module.exports = FunctionExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],17:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var LEFT = 'left',
        NAME = 'name',
        TYPE = 'type',
        Syntax = estraverse.Syntax;
function IdentifierTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(IdentifierTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.Identifier;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var isDefined = functionContext.hasVariableDefined(node[NAME]) ||
                (
                    parent[TYPE] === Syntax.AssignmentExpression &&
                    node === parent[LEFT]
                );

            return {
                'type': Syntax.Identifier,
                'name': isDefined ?
                    node[NAME] :
                    functionContext.getTempNameForVariable(node[NAME], blockContext)
            };
        }
    });
module.exports = IdentifierTranspiler;}());

},{"./../../util":51,"estraverse":121}],18:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util'), BlockContext = require('../BlockContext');
var LEFT = 'left',
        OPERATOR = 'operator',
        RIGHT = 'right',
        Syntax = estraverse.Syntax;
function LogicalExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(LogicalExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.LogicalExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var condition,
                left,
                right,
                rightSideBlockContext,
                statement,
                tempName,
                transpiler = this;

            left = transpiler.expressionTranspiler.transpile(node[LEFT], node, functionContext, blockContext);

            statement = blockContext.prepareStatement();

            rightSideBlockContext = new BlockContext(functionContext);

            right = transpiler.expressionTranspiler.transpile(node[RIGHT], node, functionContext, rightSideBlockContext);

            /**
             * Support short-circuit evaluation of the operands -
             * when '&&' and left operand is truthy, evaluate right,
             * when '||' and left operand is truthy, do not,
             * and vice versa.
             */
            condition = node[OPERATOR] === '||' ?
                {
                    'type': Syntax.UnaryExpression,
                    'operator': '!',
                    'prefix': true,
                    'argument': left
                } :
                left;

            statement.assign({
                'type': Syntax.IfStatement,
                'test': {
                    'type': Syntax.LogicalExpression,
                    'operator': '||',
                    'left': {
                        'type': Syntax.BinaryExpression,
                        'operator': '>',
                        'left': {
                            'type': Syntax.Identifier,
                            'name': 'statementIndex'
                        },
                        'right': {
                            'type': Syntax.Literal,
                            'value': statement.getIndex() + 1
                        }
                    },
                    'right': condition
                },
                'consequent': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        rightSideBlockContext.getSwitchStatement()
                    ]
                }
            });

            tempName = functionContext.getTempName();

            blockContext.addAssignment(tempName).assign({
                'type': Syntax.LogicalExpression,
                'operator': node[OPERATOR],
                'left': left,
                'right': right
            });

            return {
                'type': Syntax.Identifier,
                'name': tempName
            };
        }
    });
module.exports = LogicalExpressionTranspiler;}());

},{"../BlockContext":10,"./../../util":51,"estraverse":121}],19:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var OBJECT = 'object',
        PROPERTY = 'property',
        TYPE = 'type',
        Syntax = estraverse.Syntax;
function MemberExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(MemberExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.MemberExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var memberExpression,
                object = this.expressionTranspiler.transpile(node[OBJECT], node, functionContext, blockContext),
                propertyTempName;

            memberExpression = {
                'type': Syntax.MemberExpression,
                'object': object,
                'property': node[PROPERTY]
            };

            if (parent[TYPE] === Syntax.AssignmentExpression) {
                return memberExpression;
            }

            propertyTempName = functionContext.getTempName();

            blockContext.addAssignment(propertyTempName).assign(memberExpression);

            return {
                'type': Syntax.Identifier,
                'name': propertyTempName
            };
        }
    });
module.exports = MemberExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],20:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var PROPERTIES = 'properties',
        Syntax = estraverse.Syntax;
function ObjectExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(ObjectExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ObjectExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            return {
                'type': Syntax.ObjectExpression,
                'properties': transpiler.expressionTranspiler.transpileArray(
                    node[PROPERTIES],
                    node,
                    functionContext,
                    blockContext
                )
            };
        }
    });
module.exports = ObjectExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],21:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var KEY = 'key',
        KIND = 'kind',
        VALUE = 'value',
        Syntax = estraverse.Syntax;
function PropertyTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(PropertyTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.Property;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            return {
                'type': Syntax.Property,
                'key': node[KEY],
                'value': transpiler.expressionTranspiler.transpile(
                    node[VALUE],
                    node,
                    functionContext,
                    blockContext
                ),
                'kind': node[KIND]
            };
        }
    });
module.exports = PropertyTranspiler;}());

},{"./../../util":51,"estraverse":121}],22:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var EXPRESSIONS = 'expressions',
        Syntax = estraverse.Syntax;
function SequenceExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(SequenceExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.SequenceExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var expressions = [],
                transpiler = this;

            util.each(node[EXPRESSIONS], function (expression) {
                expressions.push(
                    transpiler.expressionTranspiler.transpile(
                        expression,
                        node,
                        functionContext,
                        blockContext
                    )
                );
            });

            return {
                'type': Syntax.SequenceExpression,
                'expressions': expressions
            };
        }
    });
module.exports = SequenceExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],23:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var ARGUMENT = 'argument',
        COMPUTED = 'computed',
        NAME = 'name',
        OBJECT = 'object',
        OPERATOR = 'operator',
        PREFIX = 'prefix',
        PROPERTY = 'property',
        TYPE = 'type',
        Syntax = estraverse.Syntax;
function UpdateExpressionTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(UpdateExpressionTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.UpdateExpression;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var expression,
                object = null,
                objectTempName = null,
                resultTempName;

            if (node[ARGUMENT][TYPE] === Syntax.MemberExpression) {
                object = this.expressionTranspiler.transpile(
                    node[ARGUMENT][OBJECT],
                    node,
                    functionContext,
                    blockContext
                );
                object = {
                    'type': Syntax.MemberExpression,
                    'object': object,
                    'property': node[ARGUMENT][COMPUTED] ?
                        this.expressionTranspiler.transpile(
                            node[ARGUMENT][PROPERTY],
                            node[ARGUMENT],
                            functionContext,
                            blockContext
                        ) :
                        node[ARGUMENT][PROPERTY],
                    'computed': node[ARGUMENT][COMPUTED]
                };
                objectTempName = functionContext.getTempName();
                blockContext.addAssignment(objectTempName).assign(object);
                expression = {
                    'type': Syntax.Identifier,
                    'name': objectTempName
                };
            } else {
                expression = this.expressionTranspiler.transpile(
                    node[ARGUMENT],
                    node,
                    functionContext,
                    blockContext
                );
            }

            // Addition/subtraction of 1
            resultTempName = functionContext.getTempName();
            blockContext.addAssignment(resultTempName).assign({
                'type': Syntax.BinaryExpression,
                'left': expression,
                'operator': node[OPERATOR].charAt(0),
                'right': {
                    'type': Syntax.Literal,
                    'value': 1
                }
            });

            // Assignment back to variable/property
            blockContext.prepareStatement().assign({
                'type': Syntax.ExpressionStatement,
                'expression': {
                    'type': Syntax.AssignmentExpression,
                    'left': object ? object : node[ARGUMENT],
                    'operator': '=',
                    'right': {
                        'type': Syntax.Identifier,
                        'name': resultTempName
                    }
                }
            });

            return {
                'type': Syntax.Identifier,
                'name': node[PREFIX] ?
                    resultTempName :
                    functionContext.getLastTempNameForVariable(node[ARGUMENT][NAME])
            };
        }
    });
module.exports = UpdateExpressionTranspiler;}());

},{"./../../util":51,"estraverse":121}],24:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var esprima = require('esprima'), estraverse = require('estraverse'), util = require('./../util');
var DECLARATIONS = 'declarations',
        ID = 'id',
        NAME = 'name',
        Syntax = estraverse.Syntax;
function FunctionContext() {
        this.assignmentVariables = {};
        this.functionDeclarations = [];
        this.labelIndex = -1;
        this.labelUsed = false;
        this.labelUseds = [];
        this.lastAssignments = [];
        this.lastTempNames = {};
        this.nextStatementIndex = 0;
        this.nextTempIndex = 0;
        this.parameters = [];
        this.variables = [];
    }
util.extend(FunctionContext.prototype, {
        addAssignment: function (index, variableName) {
            var context = this;

            context.assignmentVariables[index] = variableName;
            context.lastAssignments.push(variableName);
        },

        addFunctionDeclaration: function (declaration) {
            this.functionDeclarations.push(declaration);
        },

        addParameter: function (name) {
            this.parameters.push(name);
        },

        addVariable: function (name) {
            this.variables.push(name);
        },

        clearLastAssignments: function () {
            this.lastAssignments = [];
        },

        getCurrentStatementIndex: function () {
            return this.nextStatementIndex;
        },

        getLabel: function () {
            var context = this;

            context.labelUsed = true;

            return 'label' + context.labelIndex;
        },

        getLastAssignments: function () {
            var context = this,
                lastAssignments = context.lastAssignments;

            context.lastAssignments = [];

            return lastAssignments;
        },

        getNextStatementIndex: function () {
            return this.nextStatementIndex++;
        },

        getStatements: function (switchStatement) {
            var assignmentProperties = [],
                declaration = esprima.parse('var statementIndex = 0;').body[0],
                functionContext = this,
                index,
                statements = [],
                stateProperties = [],
                stateSetup = esprima.parse('if (Resumable._resumeState_) { statementIndex = Resumable._resumeState_.statementIndex; }').body[0];

            util.each(functionContext.variables, function (name) {
                declaration[DECLARATIONS].push({
                    'type': Syntax.VariableDeclarator,
                    'id': {
                        'type': Syntax.Identifier,
                        'name': name
                    },
                    'init': null
                });
            });

            util.each(functionContext.parameters.concat(functionContext.variables), function (name) {
                stateProperties.push({
                    'type': Syntax.Property,
                    'kind': 'init',
                    'key': {
                        'type': Syntax.Identifier,
                        'name': name
                    },
                    'value': {
                        'type': Syntax.Identifier,
                        'name': name
                    }
                });
            });

            for (index = 0; index < functionContext.nextTempIndex; index++) {
                stateProperties.push({
                    'type': Syntax.Property,
                    'kind': 'init',
                    'key': {
                        'type': Syntax.Identifier,
                        'name': 'temp' + index
                    },
                    'value': {
                        'type': Syntax.Identifier,
                        'name': 'temp' + index
                    }
                });

                declaration.declarations.push({
                    'type': Syntax.VariableDeclarator,
                    'id': {
                        'type': Syntax.Identifier,
                        'name': 'temp' + index
                    },
                    'init': null
                });

                stateSetup.consequent.body.push({
                    'type': Syntax.ExpressionStatement,
                    'expression': {
                        'type': Syntax.AssignmentExpression,
                        'operator': '=',
                        'left': {
                            'type': Syntax.Identifier,
                            'name': 'temp' + index,
                        },
                        'right': esprima.parse('Resumable._resumeState_.temp' + index).body[0].expression
                    }
                });
            }

            stateSetup.consequent.body.push(esprima.parse('Resumable._resumeState_ = null;').body[0]);

            util.each(functionContext.assignmentVariables, function (variableName, statementIndex) {
                assignmentProperties.push({
                    'type': Syntax.Property,
                    'kind': 'init',
                    'key': {
                        'type': Syntax.Literal,
                        'value': statementIndex
                    },
                    'value': {
                        'type': Syntax.Literal,
                        'value': variableName
                    }
                });
            }, {keys: true});

            statements.push(declaration);
            [].push.apply(statements, functionContext.functionDeclarations);
            statements.push({
                type: Syntax.ReturnStatement,
                argument: {
                    type: Syntax.CallExpression,
                    arguments: [
                        {
                            type: Syntax.ThisExpression
                        }
                    ],
                    callee: {
                        type: Syntax.MemberExpression,
                        object: {
                            type: Syntax.FunctionExpression,
                            id: {
                                type: Syntax.Identifier,
                                name: 'resumableScope'
                            },
                            params: [],
                            body: {
                                type: Syntax.BlockStatement,
                                body: [
                                    stateSetup,
                                    {
                                        type: Syntax.TryStatement,
                                        block: {
                                            type: Syntax.BlockStatement,
                                            body: [
                                                switchStatement
                                            ]
                                        },
                                        handler: {
                                            type: Syntax.CatchClause,
                                            param: {
                                                type: Syntax.Identifier,
                                                name: 'e'
                                            },
                                            body: {
                                                type: Syntax.BlockStatement,
                                                body: [
                                                    {
                                                        type: Syntax.IfStatement,
                                                        test: esprima.parse('e instanceof Resumable.PauseException').body[0].expression,
                                                        consequent: {
                                                            type: Syntax.BlockStatement,
                                                            body: [
                                                                {
                                                                    type: Syntax.ExpressionStatement,
                                                                    expression: {
                                                                        type: Syntax.CallExpression,
                                                                        callee: {
                                                                            type: Syntax.MemberExpression,
                                                                            object: {
                                                                                type: Syntax.Identifier,
                                                                                name: 'e'
                                                                            },
                                                                            property: {
                                                                                type: Syntax.Identifier,
                                                                                name: 'add'
                                                                            },
                                                                            computed: false
                                                                        },
                                                                        arguments: [
                                                                            {
                                                                                type: Syntax.ObjectExpression,
                                                                                properties: [
                                                                                    {
                                                                                        type: Syntax.Property,
                                                                                        kind: 'init',
                                                                                        key: {
                                                                                            type: Syntax.Identifier,
                                                                                            name: 'func'
                                                                                        },
                                                                                        value: {
                                                                                            type: Syntax.Identifier,
                                                                                            name: 'resumableScope'
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        type: Syntax.Property,
                                                                                        kind: 'init',
                                                                                        key: {
                                                                                            type: Syntax.Identifier,
                                                                                            name: 'statementIndex'
                                                                                        },
                                                                                        value: {
                                                                                            type: Syntax.BinaryExpression,
                                                                                            operator: '+',
                                                                                            left: {
                                                                                                type: Syntax.Identifier,
                                                                                                name: 'statementIndex'
                                                                                            },
                                                                                            right: {
                                                                                                type: Syntax.Literal,
                                                                                                value: 1
                                                                                            }
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        type: Syntax.Property,
                                                                                        kind: 'init',
                                                                                        key: {
                                                                                            type: Syntax.Identifier,
                                                                                            name: 'assignments'
                                                                                        },
                                                                                        value: {
                                                                                            type: Syntax.ObjectExpression,
                                                                                            properties: assignmentProperties
                                                                                        }
                                                                                    }
                                                                                ].concat(stateProperties)
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        type: Syntax.ThrowStatement,
                                                        argument: {
                                                            type: Syntax.Identifier,
                                                            name: 'e'
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        property: {
                            type: Syntax.Identifier,
                            name: 'call'
                        }
                    }
                }
            });

            return statements;
        },

        getTempName: function () {
            return 'temp' + this.nextTempIndex++;
        },

        getTempNameForVariable: function (variableName, blockContext) {
            var context = this,
                tempName;

            tempName = context.getTempName();

            context.lastTempNames[variableName] = tempName;

            blockContext.addAssignment(tempName).assign({
                'type': Syntax.Identifier,
                'name': variableName
            });

            return tempName;
        },

        getLastTempName: function () {
            return 'temp' + (this.nextTempIndex - 1);
        },

        getLastTempNameForVariable: function (variableName) {
            return this.lastTempNames[variableName];
        },

        hasVariableDefined: function (name) {
            var isDefined = false;

            util.each(this.functionDeclarations, function (functionDeclaration) {
                if (functionDeclaration[ID] && functionDeclaration[ID][NAME] === name) {
                    isDefined = true;
                    return false;
                }
            });

            util.each(this.variables, function (variable) {
                if (variable === name) {
                    isDefined = true;
                }
            });

            return isDefined;
        },

        isLabelUsed: function () {
            var context = this;

            return context.labelUsed;
        },

        popLabelableContext: function () {
            var context = this;

            context.labelUsed = context.labelUseds.pop();
            context.labelIndex--;
        },

        pushLabelableContext: function () {
            var context = this;

            context.labelUseds.push(context.labelUsed);
            context.labelUsed = false;
            context.labelIndex++;
        }
    });
module.exports = FunctionContext;}());

},{"./../util":51,"esprima":120,"estraverse":121}],25:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var esprima = require('esprima'), estraverse = require('estraverse'), util = require('./../util'), BlockContext = require('./BlockContext'), FunctionContext = require('./FunctionContext');
var BODY = 'body',
        ID = 'id',
        NAME = 'name',
        PARAMS = 'params',
        TYPE = 'type',
        Syntax = estraverse.Syntax;
function FunctionTranspiler(statementTranspiler) {
        this.statementTranspiler = statementTranspiler;
    }
util.extend(FunctionTranspiler.prototype, {
        transpile: function (node) {
            var newNode,
                transpiler = this,
                ownFunctionContext = new FunctionContext(),
                ownBlockContext = new BlockContext(ownFunctionContext),
                statements = [];

            util.each(node[PARAMS], function (param) {
                ownFunctionContext.addParameter(param[NAME]);
            });

            if (node[BODY][BODY].length > 0) {
                transpiler.statementTranspiler.transpileArray(node[BODY][BODY], node, ownFunctionContext, ownBlockContext);
                statements = ownFunctionContext.getStatements(ownBlockContext.getSwitchStatement());
            }

            newNode = {
                'type': node[TYPE],
                'id': node[ID],
                'params': node[PARAMS],
                'body': {
                    'type': Syntax.BlockStatement,
                    'body': statements
                }
            };

            return newNode;
        }
    });
module.exports = FunctionTranspiler;}());

},{"./../util":51,"./BlockContext":10,"./FunctionContext":24,"esprima":120,"estraverse":121}],26:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../util');
function PauseException(resumer) {
        this.promise = null;
        this.resumer = resumer;
        this.states = [];
    }
util.extend(PauseException.prototype, {
        add: function (state) {
            this.states.push(state);
        },

        now: function () {
            throw this;
        },

        resume: function (result) {
            var exception = this;

            try {
                exception.resumer(exception.promise, result, exception.states);
            } catch (e) {
                // Just re-throw if another PauseException gets raised,
                // we're just looking for normal errors
                if (e instanceof PauseException) {
                    throw e;
                }

                // Reject the promise for the run with the error thrown
                exception.promise.reject(e);
            }
        },

        setPromise: function (promise) {
            this.promise = promise;
        }
    });
module.exports = PauseException;}());

},{"./../util":51}],27:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var escodegen = require('escodegen'), esprima = require('esprima'), util = require('./../util'), PauseException = require('./PauseException'), Promise = require('./../Promise');
function Resumable(transpiler) {
        this.transpiler = transpiler;
    }
util.extend(Resumable, {
        _resumeState_: null,
        PauseException: PauseException
    });
util.extend(Resumable.prototype, {
        createPause: function () {
            var pause = new PauseException(function (promise, result, states) {
                    var i,
                        lastResult = result,
                        state;

                    for (i = 0; i < states.length; i++) {
                        state = states[i];

                        if (state.assignments[state.statementIndex - 1]) {
                            state[state.assignments[state.statementIndex - 1]] = lastResult;
                        }

                        Resumable._resumeState_ = state;

                        try {
                            lastResult = state.func();
                        } catch (e) {
                            if (e instanceof PauseException) {
                                e.setPromise(promise);

                                return;
                            }

                            throw e;
                        }
                    }

                    promise.resolve();
                });

            return pause;
        },

        execute: function (code, options) {
            var ast = esprima.parse(code),
                expose,
                func,
                names = ['Resumable'],
                promise = new Promise(),
                transpiledCode,
                values = [Resumable];

            options = options || {};
            expose = options.expose || {};

            util.each(expose, function (value, name) {
                names.push(name);
                values.push(value);
            }, {keys: true});

            ast = this.transpiler.transpile(ast);

            transpiledCode = escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            });

            /*jshint evil:true */
            func = new Function(names, 'return ' + transpiledCode);

            try {
                func.apply(null, values)();
            } catch (e) {
                if (e instanceof PauseException) {
                    e.setPromise(promise);
                } else {
                    promise.reject(e);
                }

                return promise;
            }

            promise.resolve();

            return promise;
        }
    });
module.exports = Resumable;}());

},{"./../Promise":9,"./../util":51,"./PauseException":26,"escodegen":102,"esprima":120}],28:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util'), BlockContext = require('../BlockContext');
var BODY = 'body',
        Syntax = estraverse.Syntax;
function BlockStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(BlockStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.BlockStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this,
                ownBlockContext = new BlockContext(functionContext),
                statement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[BODY], node, functionContext, ownBlockContext);

            statement.assign({
                'type': Syntax.BlockStatement,
                'body': [
                    ownBlockContext.getSwitchStatement()
                ]
            });
        }
    });
module.exports = BlockStatementTranspiler;}());

},{"../BlockContext":10,"./../../util":51,"estraverse":121}],29:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var LABEL = 'label',
        Syntax = estraverse.Syntax;
function BreakStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(BreakStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.BreakStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var label = node[LABEL] ?
                node[LABEL] :
                {
                    'type': Syntax.Identifier,
                    'name': functionContext.getLabel()
                };

            blockContext.prepareStatement().assign({
                'type': Syntax.BreakStatement,
                'label': label
            });
        }
    });
module.exports = BreakStatementTranspiler;}());

},{"./../../util":51,"estraverse":121}],30:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var LABEL = 'label',
        Syntax = estraverse.Syntax;
function ContinueStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(ContinueStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ContinueStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var label = node[LABEL] ?
                node[LABEL] :
                {
                    'type': Syntax.Identifier,
                    'name': functionContext.getLabel()
                };

            blockContext.prepareStatement().assign({
                'type': Syntax.ContinueStatement,
                'label': label
            });
        }
    });
module.exports = ContinueStatementTranspiler;}());

},{"./../../util":51,"estraverse":121}],31:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var esprima = require('esprima'), estraverse = require('estraverse'), util = require('./../../util'), BlockContext = require('../BlockContext');
var BODY = 'body',
        TEST = 'test',
        Syntax = estraverse.Syntax;
function DoWhileStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(DoWhileStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.DoWhileStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var forNode,
                ownBlockContext = new BlockContext(functionContext),
                transpiler = this,
                expression,
                statement;

            functionContext.pushLabelableContext();

            statement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[BODY][BODY], node, functionContext, ownBlockContext);

            expression = transpiler.expressionTranspiler.transpile(node[TEST], node, functionContext, ownBlockContext);

            ownBlockContext.prepareStatement().assign({
                'type': Syntax.IfStatement,
                'test': {
                    'type': Syntax.UnaryExpression,
                    'operator': '!',
                    'prefix': true,
                    'argument': expression
                },
                'consequent': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        {
                            'type': Syntax.BreakStatement,
                            'label': {
                                'type': Syntax.Identifier,
                                'name': functionContext.getLabel()
                            }
                        }
                    ]
                }
            });

            forNode = {
                'type': Syntax.ForStatement,
                'init': null,
                'test': null,
                'update': null,
                'body': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        esprima.parse('statementIndex = ' + (statement.getIndex() + 1) + ';').body[0],
                        ownBlockContext.getSwitchStatement()
                    ]
                }
            };

            statement.assign(functionContext.isLabelUsed() ? {
                'type': Syntax.LabeledStatement,
                'label': {
                    'type': Syntax.Identifier,
                    'name': functionContext.getLabel()
                },
                'body': forNode
            } : forNode);

            functionContext.popLabelableContext();
        }
    });
module.exports = DoWhileStatementTranspiler;}());

},{"../BlockContext":10,"./../../util":51,"esprima":120,"estraverse":121}],32:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var EXPRESSION = 'expression',
        Syntax = estraverse.Syntax;
function ExpressionStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(ExpressionStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ExpressionStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var expression = this.expressionTranspiler.transpile(node[EXPRESSION], node, functionContext, blockContext);

            blockContext.prepareStatement().assign({
                'type': Syntax.ExpressionStatement,
                'expression': expression
            });
        }
    });
module.exports = ExpressionStatementTranspiler;}());

},{"./../../util":51,"estraverse":121}],33:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var esprima = require('esprima'), estraverse = require('estraverse'), util = require('./../../util'), BlockContext = require('../BlockContext');
var BODY = 'body',
        INIT = 'init',
        TEST = 'test',
        UPDATE = 'update',
        Syntax = estraverse.Syntax;
function ForStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(ForStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ForStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var forNode,
                ownBlockContext = new BlockContext(functionContext),
                transpiler = this,
                expression,
                statement;

            functionContext.pushLabelableContext();

            // 'Init' expression
            if (node[INIT]) {
                expression = transpiler.expressionTranspiler.transpile(
                    node[INIT],
                    node,
                    functionContext,
                    blockContext
                );
                blockContext.prepareStatement().assign({
                    'type': Syntax.ExpressionStatement,
                    'expression': expression
                });
            }

            statement = blockContext.prepareStatement();

            // 'Test' expression
            if (node[TEST]) {
                expression = transpiler.expressionTranspiler.transpile(
                    node[TEST],
                    node,
                    functionContext,
                    ownBlockContext
                );
                ownBlockContext.prepareStatement().assign({
                    'type': Syntax.IfStatement,
                    'test': {
                        'type': Syntax.UnaryExpression,
                        'operator': '!',
                        'prefix': true,
                        'argument': expression
                    },
                    'consequent': {
                        'type': Syntax.BlockStatement,
                        'body': [
                            {
                                'type': Syntax.BreakStatement,
                                'label': {
                                    'type': Syntax.Identifier,
                                    'name': functionContext.getLabel()
                                }
                            }
                        ]
                    }
                });
            }

            transpiler.statementTranspiler.transpileArray(
                node[BODY][BODY],
                node,
                functionContext,
                ownBlockContext
            );

            // 'Update' expression
            if (node[UPDATE]) {
                expression = transpiler.expressionTranspiler.transpile(
                    node[UPDATE],
                    node,
                    functionContext,
                    ownBlockContext
                );
                ownBlockContext.prepareStatement().assign({
                    'type': Syntax.ExpressionStatement,
                    'expression': expression
                });
            }

            forNode = {
                'type': Syntax.ForStatement,
                'init': null,
                'test': null,
                'update': null,
                'body': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        ownBlockContext.getSwitchStatement(),
                        esprima.parse('statementIndex = ' + (statement.getIndex() + 1) + ';').body[0]
                    ]
                }
            };

            statement.assign(functionContext.isLabelUsed() ? {
                'type': Syntax.LabeledStatement,
                'label': {
                    'type': Syntax.Identifier,
                    'name': functionContext.getLabel()
                },
                'body': forNode
            } : forNode);

            functionContext.popLabelableContext();
        }
    });
module.exports = ForStatementTranspiler;}());

},{"../BlockContext":10,"./../../util":51,"esprima":120,"estraverse":121}],34:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var Syntax = estraverse.Syntax;
function FunctionDeclarationTranspiler(statementTranspiler, expressionTranspiler, functionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.functionTranspiler = functionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(FunctionDeclarationTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.FunctionDeclaration;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var newNode = this.functionTranspiler.transpile(node, parent, functionContext, blockContext);

            functionContext.addFunctionDeclaration(newNode);
        }
    });
module.exports = FunctionDeclarationTranspiler;}());

},{"./../../util":51,"estraverse":121}],35:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var ALTERNATE = 'alternate',
        CONSEQUENT = 'consequent',
        TEST = 'test',
        Syntax = estraverse.Syntax;
function IfStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(IfStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.IfStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var alternateStatement,
                consequentStatement,
                transpiler = this,
                expression = transpiler.expressionTranspiler.transpile(node[TEST], node, functionContext, blockContext);

            consequentStatement = blockContext.prepareStatement();

            consequentStatement.assign({
                'type': Syntax.IfStatement,
                'test': {
                    'type': Syntax.LogicalExpression,
                    'operator': '||',
                    'left': {
                        'type': Syntax.BinaryExpression,
                        'operator': '>',
                        'left': {
                            'type': Syntax.Identifier,
                            'name': 'statementIndex'
                        },
                        'right': {
                            'type': Syntax.Literal,
                            'value': consequentStatement.getIndex() + 1
                        }
                    },
                    'right': expression
                },
                'consequent': transpiler.statementTranspiler.transpileBlock(node[CONSEQUENT], node, functionContext)
            });

            if (node[ALTERNATE]) {
                alternateStatement = blockContext.prepareStatement();

                alternateStatement.assign({
                    'type': Syntax.IfStatement,
                    'test': {
                        'type': Syntax.LogicalExpression,
                        'operator': '||',
                        'left': {
                            'type': Syntax.BinaryExpression,
                            'operator': '>',
                            'left': {
                                'type': Syntax.Identifier,
                                'name': 'statementIndex'
                            },
                            'right': {
                                'type': Syntax.Literal,
                                'value': alternateStatement.getIndex() + 1
                            }
                        },
                        'right': {
                            'type': Syntax.UnaryExpression,
                            'operator': '!',
                            'prefix': true,
                            'argument': expression
                        }
                    },
                    'consequent': transpiler.statementTranspiler.transpileBlock(node[ALTERNATE], node, functionContext)
                });
            }
        }
    });
module.exports = IfStatementTranspiler;}());

},{"./../../util":51,"estraverse":121}],36:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var BODY = 'body',
        LABEL = 'label',
        Syntax = estraverse.Syntax;
function LabeledStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(LabeledStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.LabeledStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var label = node[LABEL],
                transpiler = this;

            blockContext.transformNextStatement(function (node) {
                return {
                    'type': Syntax.LabeledStatement,
                    'label': label,
                    'body': node
                };
            });

            transpiler.statementTranspiler.transpile(node[BODY], node, functionContext, blockContext);
        }
    });
module.exports = LabeledStatementTranspiler;}());

},{"./../../util":51,"estraverse":121}],37:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util'), BlockContext = require('../BlockContext'), FunctionContext = require('../FunctionContext');
var BODY = 'body',
        Syntax = estraverse.Syntax;
function ProgramTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(ProgramTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.Program;
        },

        transpile: function (node) {
            var transpiler = this,
                functionContext = new FunctionContext(),
                blockContext = new BlockContext(functionContext);

            transpiler.statementTranspiler.transpileArray(node[BODY], node, functionContext, blockContext);

            return {
                'type': Syntax.Program,
                'body': [
                    {
                        'type': Syntax.ExpressionStatement,
                        'expression': {
                            'type': Syntax.FunctionExpression,
                            'id': null,
                            'params': [],
                            'body': {
                                'type': Syntax.BlockStatement,
                                'body': functionContext.getStatements(blockContext.getSwitchStatement())
                            }
                        }
                    }
                ]
            };
        }
    });
module.exports = ProgramTranspiler;}());

},{"../BlockContext":10,"../FunctionContext":24,"./../../util":51,"estraverse":121}],38:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var ARGUMENT = 'argument',
        Syntax = estraverse.Syntax;
function ReturnStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(ReturnStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ReturnStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var expression = this.expressionTranspiler.transpile(node[ARGUMENT], node, functionContext, blockContext);

            blockContext.prepareStatement().assign({
                'type': Syntax.ReturnStatement,
                'argument': expression
            });
        }
    });
module.exports = ReturnStatementTranspiler;}());

},{"./../../util":51,"estraverse":121}],39:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util'), BlockContext = require('../BlockContext');
var BODY = 'body',
        TYPE = 'type',
        hasOwn = {}.hasOwnProperty,
        Syntax = estraverse.Syntax;
function StatementTranspiler(expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.transpilers = {};
    }
util.extend(StatementTranspiler.prototype, {
        addTranspiler: function (transpiler) {
            this.transpilers[transpiler.getNodeType()] = transpiler;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            if (!hasOwn.call(transpiler.transpilers, node[TYPE])) {
                throw new Error('Unsupported type "' + node[TYPE] + '"');
            }

            return transpiler.transpilers[node[TYPE]].transpile(node, parent, functionContext, blockContext);
        },

        transpileBlock: function (node, parent, functionContext) {
            var transpiler = this,
                ownBlockContext = new BlockContext(functionContext);

            if (node[TYPE] === Syntax.BlockStatement) {
                transpiler.transpileArray(node[BODY], parent, functionContext, ownBlockContext);
            } else {
                transpiler.transpile(node, parent, functionContext, ownBlockContext);
            }

            return {
                'type': Syntax.BlockStatement,
                'body': [
                    ownBlockContext.getSwitchStatement()
                ]
            };
        },

        transpileArray: function (array, parent, functionContext, blockContext) {
            var transpiler = this;

            util.each(array, function (statementNode) {
                transpiler.transpile(statementNode, parent, functionContext, blockContext);
            });
        }
    });
module.exports = StatementTranspiler;}());

},{"../BlockContext":10,"./../../util":51,"estraverse":121}],40:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var ARGUMENT = 'argument',
        Syntax = estraverse.Syntax;
function ThrowStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(ThrowStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.ThrowStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var expression = this.expressionTranspiler.transpile(node[ARGUMENT], node, functionContext, blockContext);

            blockContext.prepareStatement().assign({
                'type': Syntax.ThrowStatement,
                'argument': expression
            });
        }
    });
module.exports = ThrowStatementTranspiler;}());

},{"./../../util":51,"estraverse":121}],41:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var esprima = require('esprima'), estraverse = require('estraverse'), util = require('./../../util'), BlockContext = require('../BlockContext');
var BLOCK = 'block',
        BODY = 'body',
        HANDLERS = 'handlers',
        FINALIZER = 'finalizer',
        NAME = 'name',
        PARAM = 'param',
        Syntax = estraverse.Syntax;
function TryStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(TryStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.TryStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var handlers = [],
                ownBlockContext = new BlockContext(functionContext),
                statement,
                transpiler = this,
                tryNode;

            statement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[BLOCK][BODY], node, functionContext, ownBlockContext);

            tryNode = {
                'type': Syntax.TryStatement,
                'block': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        ownBlockContext.getSwitchStatement()
                    ]
                }
            };

            if (node[HANDLERS]) {
                handlers = [];

                util.each(node[HANDLERS], function (handler) {
                    var catchClauseBlockContext = new BlockContext(functionContext);

                    transpiler.statementTranspiler.transpileArray(handler[BODY][BODY], handler, functionContext, catchClauseBlockContext);

                    handlers.push({
                        'type': Syntax.CatchClause,
                        'param': handler[PARAM],
                        'body': {
                            'type': Syntax.BlockStatement,
                            'body': [
                                {
                                    'type': Syntax.IfStatement,
                                    'test': esprima.parse(handler[PARAM][NAME] + ' instanceof Resumable.PauseException').body[0].expression,
                                    'consequent': {
                                        'type': Syntax.BlockStatement,
                                        'body': [
                                            {
                                                'type': Syntax.ThrowStatement,
                                                'argument': handler[PARAM]
                                            }
                                        ]
                                    }
                                },
                                catchClauseBlockContext.getSwitchStatement()
                            ]
                        }
                    });
                });

                tryNode[HANDLERS] = handlers;
            }

            if (node[FINALIZER]) {
                tryNode[FINALIZER] = node[FINALIZER];
            }

            statement.assign(tryNode);
        }
    });
module.exports = TryStatementTranspiler;}());

},{"../BlockContext":10,"./../../util":51,"esprima":120,"estraverse":121}],42:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util');
var DECLARATIONS = 'declarations',
        ID = 'id',
        INIT = 'init',
        NAME = 'name',
        Syntax = estraverse.Syntax;
function VariableDeclarationTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(VariableDeclarationTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.VariableDeclaration;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this;

            util.each(node[DECLARATIONS], function (declaration) {
                var expression;

                functionContext.addVariable(declaration[ID][NAME]);

                if (declaration[INIT] !== null) {
                    expression = transpiler.expressionTranspiler.transpile(
                        declaration[INIT],
                        node,
                        functionContext,
                        blockContext
                    );

                    blockContext.prepareStatement().assign({
                        'type': Syntax.ExpressionStatement,
                        'expression': {
                            'type': Syntax.AssignmentExpression,
                            'operator': '=',
                            'left': declaration[ID],
                            'right': expression
                        }
                    });
                }
            });
        }
    });
module.exports = VariableDeclarationTranspiler;}());

},{"./../../util":51,"estraverse":121}],43:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var esprima = require('esprima'), estraverse = require('estraverse'), util = require('./../../util'), BlockContext = require('../BlockContext');
var BODY = 'body',
        TEST = 'test',
        Syntax = estraverse.Syntax;
function WhileStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(WhileStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.WhileStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var forNode,
                ownBlockContext = new BlockContext(functionContext),
                transpiler = this,
                expression,
                statement;

            functionContext.pushLabelableContext();

            statement = blockContext.prepareStatement();

            expression = transpiler.expressionTranspiler.transpile(node[TEST], node, functionContext, ownBlockContext);

            ownBlockContext.prepareStatement().assign({
                'type': Syntax.IfStatement,
                'test': {
                    'type': Syntax.UnaryExpression,
                    'operator': '!',
                    'prefix': true,
                    'argument': expression
                },
                'consequent': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        {
                            'type': Syntax.BreakStatement,
                            'label': {
                                'type': Syntax.Identifier,
                                'name': functionContext.getLabel()
                            }
                        }
                    ]
                }
            });

            transpiler.statementTranspiler.transpileArray(node[BODY][BODY], node, functionContext, ownBlockContext);

            forNode = {
                'type': Syntax.ForStatement,
                'init': null,
                'test': null,
                'update': null,
                'body': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        ownBlockContext.getSwitchStatement(),
                        esprima.parse('statementIndex = ' + (statement.getIndex() + 1) + ';').body[0]
                    ]
                }
            };

            statement.assign(functionContext.isLabelUsed() ? {
                'type': Syntax.LabeledStatement,
                'label': {
                    'type': Syntax.Identifier,
                    'name': functionContext.getLabel()
                },
                'body': forNode
            } : forNode);

            functionContext.popLabelableContext();
        }
    });
module.exports = WhileStatementTranspiler;}());

},{"../BlockContext":10,"./../../util":51,"esprima":120,"estraverse":121}],44:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var estraverse = require('estraverse'), util = require('./../../util'), BlockContext = require('../BlockContext');
var BODY = 'body',
        OBJECT = 'object',
        Syntax = estraverse.Syntax;
function WithStatementTranspiler(statementTranspiler, expressionTranspiler) {
        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(WithStatementTranspiler.prototype, {
        getNodeType: function () {
            return Syntax.WithStatement;
        },

        transpile: function (node, parent, functionContext, blockContext) {
            var transpiler = this,
                object = this.expressionTranspiler.transpile(node[OBJECT], node, functionContext, blockContext),
                ownBlockContext = new BlockContext(functionContext),
                statement = blockContext.prepareStatement();

            transpiler.statementTranspiler.transpileArray(node[BODY][BODY], node, functionContext, ownBlockContext);

            statement.assign({
                'type': Syntax.WithStatement,
                'object': object,
                'body': {
                    'type': Syntax.BlockStatement,
                    'body': [
                        ownBlockContext.getSwitchStatement()
                    ]
                }
            });
        }
    });
module.exports = WithStatementTranspiler;}());

},{"../BlockContext":10,"./../../util":51,"estraverse":121}],45:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var esprima = require('esprima'), estraverse = require('estraverse'), util = require('./../util'), ArrayExpressionTranspiler = require('./ExpressionTranspiler/ArrayExpressionTranspiler'), AssignmentExpressionTranspiler = require('./ExpressionTranspiler/AssignmentExpressionTranspiler'), BinaryExpressionTranspiler = require('./ExpressionTranspiler/BinaryExpressionTranspiler'), BlockStatementTranspiler = require('./StatementTranspiler/BlockStatementTranspiler'), BreakStatementTranspiler = require('./StatementTranspiler/BreakStatementTranspiler'), CallExpressionTranspiler = require('./ExpressionTranspiler/CallExpressionTranspiler'), ContinueStatementTranspiler = require('./StatementTranspiler/ContinueStatementTranspiler'), DoWhileStatementTranspiler = require('./StatementTranspiler/DoWhileStatementTranspiler'), ExpressionStatementTranspiler = require('./StatementTranspiler/ExpressionStatementTranspiler'), ExpressionTranspiler = require('./ExpressionTranspiler/ExpressionTranspiler'), ForStatementTranspiler = require('./StatementTranspiler/ForStatementTranspiler'), FunctionDeclarationTranspiler = require('./StatementTranspiler/FunctionDeclarationTranspiler'), FunctionExpressionTranspiler = require('./ExpressionTranspiler/FunctionExpressionTranspiler'), FunctionTranspiler = require('./FunctionTranspiler'), IdentifierTranspiler = require('./ExpressionTranspiler/IdentifierTranspiler'), IfStatementTranspiler = require('./StatementTranspiler/IfStatementTranspiler'), LabeledStatementTranspiler = require('./StatementTranspiler/LabeledStatementTranspiler'), LogicalExpressionTranspiler = require('./ExpressionTranspiler/LogicalExpressionTranspiler'), MemberExpressionTranspiler = require('./ExpressionTranspiler/MemberExpressionTranspiler'), ObjectExpressionTranspiler = require('./ExpressionTranspiler/ObjectExpressionTranspiler'), ProgramTranspiler = require('./StatementTranspiler/ProgramTranspiler'), PropertyTranspiler = require('./ExpressionTranspiler/PropertyTranspiler'), ReturnStatementTranspiler = require('./StatementTranspiler/ReturnStatementTranspiler'), SequenceExpressionTranspiler = require('./ExpressionTranspiler/SequenceExpressionTranspiler'), StatementTranspiler = require('./StatementTranspiler/StatementTranspiler'), ThrowStatementTranspiler = require('./StatementTranspiler/ThrowStatementTranspiler'), TryStatementTranspiler = require('./StatementTranspiler/TryStatementTranspiler'), UpdateExpressionTranspiler = require('./ExpressionTranspiler/UpdateExpressionTranspiler'), VariableDeclarationTranspiler = require('./StatementTranspiler/VariableDeclarationTranspiler'), WhileStatementTranspiler = require('./StatementTranspiler/WhileStatementTranspiler'), WithStatementTranspiler = require('./StatementTranspiler/WithStatementTranspiler');
require('escodegen');
function Transpiler() {
        var expressionTranspiler = new ExpressionTranspiler(),
            statementTranspiler = new StatementTranspiler(),
            functionTranspiler = new FunctionTranspiler(statementTranspiler);

        util.each([
            BlockStatementTranspiler,
            BreakStatementTranspiler,
            ContinueStatementTranspiler,
            DoWhileStatementTranspiler,
            ExpressionStatementTranspiler,
            ForStatementTranspiler,
            IfStatementTranspiler,
            LabeledStatementTranspiler,
            ProgramTranspiler,
            ReturnStatementTranspiler,
            ThrowStatementTranspiler,
            TryStatementTranspiler,
            VariableDeclarationTranspiler,
            WhileStatementTranspiler,
            WithStatementTranspiler
        ], function (Class) {
            statementTranspiler.addTranspiler(new Class(statementTranspiler, expressionTranspiler));
        });

        statementTranspiler.addTranspiler(
            new FunctionDeclarationTranspiler(
                statementTranspiler,
                expressionTranspiler,
                functionTranspiler
            )
        );

        util.each([
            ArrayExpressionTranspiler,
            AssignmentExpressionTranspiler,
            BinaryExpressionTranspiler,
            CallExpressionTranspiler,
            IdentifierTranspiler,
            LogicalExpressionTranspiler,
            MemberExpressionTranspiler,
            ObjectExpressionTranspiler,
            PropertyTranspiler,
            SequenceExpressionTranspiler,
            UpdateExpressionTranspiler
        ], function (Class) {
            expressionTranspiler.addTranspiler(new Class(statementTranspiler, expressionTranspiler));
        });

        expressionTranspiler.addTranspiler(
            new FunctionExpressionTranspiler(
                statementTranspiler,
                expressionTranspiler,
                functionTranspiler
            )
        );

        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }
util.extend(Transpiler.prototype, {
        transpile: function (ast) {
            return this.statementTranspiler.transpile(ast, null);
        }
    });
module.exports = Transpiler;}());

},{"./../util":51,"./ExpressionTranspiler/ArrayExpressionTranspiler":11,"./ExpressionTranspiler/AssignmentExpressionTranspiler":12,"./ExpressionTranspiler/BinaryExpressionTranspiler":13,"./ExpressionTranspiler/CallExpressionTranspiler":14,"./ExpressionTranspiler/ExpressionTranspiler":15,"./ExpressionTranspiler/FunctionExpressionTranspiler":16,"./ExpressionTranspiler/IdentifierTranspiler":17,"./ExpressionTranspiler/LogicalExpressionTranspiler":18,"./ExpressionTranspiler/MemberExpressionTranspiler":19,"./ExpressionTranspiler/ObjectExpressionTranspiler":20,"./ExpressionTranspiler/PropertyTranspiler":21,"./ExpressionTranspiler/SequenceExpressionTranspiler":22,"./ExpressionTranspiler/UpdateExpressionTranspiler":23,"./FunctionTranspiler":25,"./StatementTranspiler/BlockStatementTranspiler":28,"./StatementTranspiler/BreakStatementTranspiler":29,"./StatementTranspiler/ContinueStatementTranspiler":30,"./StatementTranspiler/DoWhileStatementTranspiler":31,"./StatementTranspiler/ExpressionStatementTranspiler":32,"./StatementTranspiler/ForStatementTranspiler":33,"./StatementTranspiler/FunctionDeclarationTranspiler":34,"./StatementTranspiler/IfStatementTranspiler":35,"./StatementTranspiler/LabeledStatementTranspiler":36,"./StatementTranspiler/ProgramTranspiler":37,"./StatementTranspiler/ReturnStatementTranspiler":38,"./StatementTranspiler/StatementTranspiler":39,"./StatementTranspiler/ThrowStatementTranspiler":40,"./StatementTranspiler/TryStatementTranspiler":41,"./StatementTranspiler/VariableDeclarationTranspiler":42,"./StatementTranspiler/WhileStatementTranspiler":43,"./StatementTranspiler/WithStatementTranspiler":44,"escodegen":102,"esprima":120,"estraverse":121}],46:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util');
function Rule(name, captureName, ifNoMatch, processor, options) {
        this.captureName = captureName;
        this.component = null;
        this.ifNoMatch = ifNoMatch;
        this.name = name;
        this.options = options;
        this.processor = processor;
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

            if (rule.processor) {
                match.components = rule.processor(match.components);
            }

            return match;
        },

        setComponent: function (component) {
            this.component = component;
        }
    });
module.exports = Rule;}());

},{"./util":51}],47:[function(require,module,exports){
/*
 * Modular - JavaScript AMD Framework
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/modular/
 *
 * Implements the AMD specification - see https://github.com/amdjs/amdjs-api/wiki/AMD
 *
 * Released under the MIT license
 * https://github.com/asmblah/modular/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util');
var PENDING = 0,
        REJECTED = 1,
        RESOLVED = 2;
function Promise() {
        this.mode = PENDING;
        this.thens = [];
        this.value = null;
    }
util.extend(Promise.prototype, {
        reject: function (exception) {
            var promise = this;

            if (promise.mode === PENDING) {
                promise.mode = REJECTED;
                promise.value = exception;

                util.each(promise.thens, function (callbacks) {
                    if (callbacks.onReject) {
                        callbacks.onReject(exception);
                    }
                });
            }

            return promise;
        },

        resolve: function (result) {
            var promise = this;

            if (promise.mode === PENDING) {
                promise.mode = RESOLVED;
                promise.value = result;

                util.each(promise.thens, function (callbacks) {
                    if (callbacks.onResolve) {
                        callbacks.onResolve(result);
                    }
                });
            }

            return promise;
        },

        then: function (onResolve, onReject) {
            var promise = this;

            if (promise.mode === PENDING) {
                promise.thens.push({
                    onReject: onReject,
                    onResolve: onResolve
                });
            } else if (promise.mode === REJECTED) {
                if (onReject) {
                    onReject(promise.value);
                }
            } else if (promise.mode === RESOLVED) {
                if (onResolve) {
                    onResolve(promise.value);
                }
            }

            return promise;
        }
    });
module.exports = Promise;}());

},{"./util":51}],48:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util'), EventEmitter = require('./EventEmitter');
function Stream() {
        EventEmitter.call(this);

        this.data = '';
    }
util.inherit(Stream).from(EventEmitter);
util.extend(Stream.prototype, {
        read: function (length) {
            var data,
                stream = this;

            if (!length && length !== 0) {
                data = stream.data;
                stream.data = '';
            } else {
                data = stream.data.substr(0, length);
                stream.data = stream.data.substr(length);
            }

            return data;
        },

        readAll: function () {
            var stream = this;

            return stream.read(stream.data.length);
        },

        write: function (data) {
            var stream = this;

            stream.data += data;
            stream.emit('data', data);
        }
    });
module.exports = Stream;}());

},{"./EventEmitter":3,"./util":51}],49:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./util'), Engine = require('./Engine'), Exception = require('./Exception/Exception'), Language = require('./Language');
var hasOwn = {}.hasOwnProperty;
function Uniter(options) {
        this.languages = {};
        this.options = options || {};
    }
util.extend(Uniter.prototype, {
        createEngine: function (name, options) {
            var language,
                uniter = this;

            options = util.extend({}, uniter.options, options);

            if (!hasOwn.call(uniter.languages, name)) {
                throw new Exception('Uniter.createEngine() :: Language with name "' + name + '" is not registered');
            }

            language = uniter.languages[name];

            /*engine.globalScope.define({
                'const': {
                    '__WINDOW__': engine.global
                },
                'function': {
                    'fopen': {
                        args: [{type: 'string'}, {type: 'string'}],
                        options: {async: true},
                        handler: function (promise, path, mode) {

                        }
                    }
                },
                'class': {
                    DOMDocument: DOMDocument
                }
            });*/

            return language.createEngine(options);
        },

        createParser: function (name) {
            var language,
                uniter = this;

            if (!hasOwn.call(uniter.languages, name)) {
                throw new Exception('Uniter.createParser() :: Language with name "' + name + '" is not registered');
            }

            language = uniter.languages[name];

            return language.createParser();
        },

        registerLanguage: function (language) {
            var name,
                uniter = this;

            if (!(language instanceof Language)) {
                throw new Exception('Uniter.registerLanguage() :: "language" must be a valid Language object');
            }

            name = language.getName();

            if (hasOwn.call(uniter.languages, name)) {
                throw new Exception('Uniter.registerLanguage() :: Language with name "' + name + '" is already registered');
            }

            uniter.languages[name] = language;
        }
    });
module.exports = Uniter;}());

},{"./Engine":2,"./Exception/Exception":4,"./Language":7,"./util":51}],50:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var phpGrammarSpec = require('./../languages/PHP/grammar'), phpInterpreterSpec = require('./../languages/PHP/interpreter'), Language = require('./Language'), Uniter = require('./Uniter');
var uniter = new Uniter();
uniter.registerLanguage(new Language('PHP', phpGrammarSpec, phpInterpreterSpec));
module.exports = uniter;}());

},{"./../languages/PHP/grammar":52,"./../languages/PHP/interpreter":55,"./Language":7,"./Uniter":49}],51:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var global = /*jshint evil: true */new Function('return this;')()/*jshint evil: false */,
        hasOwn = {}.hasOwnProperty,
        inheritFrom = Object.create || function (from) {
            function F() {}
            F.prototype = from;
            return new F();
        },
        toString = {}.toString,
        undef,
        util;
util = {
        copy: function (to, from) {
            var key;

            for (key in from) {
                if (hasOwn.call(from, key)) {
                    to[key] = from[key];
                }
            }
        },

        each: function (obj, callback, options) {
            var key,
                length;

            if (!obj || typeof obj !== 'object') {
                return;
            }

            options = options || {};

            if (('length' in obj) && !options.keys) {
                for (key = 0, length = obj.length; key < length; key += 1) { // Keep JSLint happy with '+= 1'
                    if (callback.call(obj[key], obj[key], key, obj) === false) {
                        break;
                    }
                }
            } else {
                for (key in obj) {
                    if (hasOwn.call(obj, key)) {
                        if (callback.call(obj[key], obj[key], key, obj) === false) {
                            break;
                        }
                    }
                }
            }
        },

        extend: function (target, source1, source2) {
            util.each([source1, source2], function (obj) {
                util.each(obj, function (val, key) {
                    target[key] = val;
                }, { keys: true });
            });

            return target;
        },

        extendConfig: function (target, sources) {
            util.each(sources, function (obj) {
                util.each(obj, function (val, key) {
                    target[key] = (key === 'paths') ? util.extend({}, target[key], val) : val;
                }, { keys: true });
            });

            return target;
        },

        from: function (from) {
            return {
                to: function (to, callback) {
                    var number;

                    for (number = from; number <= to; number += 1) {
                        callback(number, number - from);
                    }
                }
            };
        },

        getType: function (obj) {
            /*jshint eqnull: true */

            return obj != null && {}.toString.call(obj).match(/\[object ([\s\S]*)\]/)[1];
        },

        global: global,

        getLineNumber: function (text, offset) {
            function getCount(string, substring) {
                return string.split(substring).length;
            }

            return getCount(text.substr(0, offset), '\n');
        },

        heredoc: function (fn, variables) {
            var match = function () {}.toString.call(fn).match(/\/\*<<<(\w+)[\r\n](?:([\s\S]*)[\r\n])?\1\s*\*\//),
                string;

            if (!match) {
                throw new Error('util.heredoc() :: Function does not contain a heredoc');
            }

            string = match[2] || '';

            string = util.stringTemplate(string, variables);

            return string;
        },

        inherit: function (To) {
            return {
                from: function (From) {
                    To.prototype = inheritFrom(From.prototype);
                    To.prototype.constructor = To;
                }
            };
        },

        isNumber: function (value) {
            return toString.call(value) === '[object Number]';
        },

        isArray: function (value) {
            return toString.call(value) === '[object Array]';
        },

        isBoolean: function (value) {
            return toString.call(value) === '[object Boolean]';
        },

        isFunction: function (value) {
            return toString.call(value) === '[object Function]';
        },

        isPlainObject: function (value) {
            return toString.call(value) === '[object Object]' && !util.isUndefined(value);
        },

        isString: function (value) {
            return typeof value === 'string' || toString.call(value) === '[object String]';
        },

        isUndefined: function (obj) {
            return obj === undef;
        },

        regexEscape: function (text) {
            // See http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
            return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        },

        sortObject: function (object) {
            var result;

            if (!util.isPlainObject(object)) {
                return object;
            }

            result = {};

            util.each(Object.keys(object).sort(), function (name) {
                result[name] = util.sortObject(object[name]);
            });

            return result;
        },

        stringTemplate: function (string, variables) {
            util.each(variables, function (value, name) {
                var pattern = new RegExp(('${' + name + '}').replace(/[^a-z0-9]/g, '\\$&'), 'g');

                string = string.replace(pattern, value);
            }, {keys: true});

            return string;
        }
    };
module.exports = util;}());

},{}],52:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*
 * PHP Grammar
 */

/*global define */
(function () {'use strict';
var util = require('./../../js/util'), PHPErrorHandler = require('./grammar/ErrorHandler'), PHPGrammarState = require('./grammar/State');
var uppercaseReplacements = [{
            pattern: /.*/g,
            replacement: function (all) {
                return all.toUpperCase();
            }
        }],
        stringEscapeReplacements = [{
            pattern: /\\([\$efnrtv\\"])/g,
            replacement: function (all, chr) {
                return {
                    'e': '\x1B', // Escape
                    'f': '\f',   // Form feed
                    'n': '\n',   // Linefeed
                    'r': '\r',   // Carriage-return
                    't': '\t',   // Horizontal tab
                    'v': '\x0B', // Vertical tab (JS '\v' escape not supported in IE < 9)
                    '\\': '\\',
                    '$': '$',
                    '"': '"'
                }[chr];
            }
        }];
module.exports = {
        ErrorHandler: PHPErrorHandler,
        State: PHPGrammarState,
        ignore: 'N_IGNORE',
        rules: {
            'T_ABSTRACT': /abstract\b/i,
            'T_AND_EQUAL': /&=/i,
            'T_ARRAY': /array\b/i,
            'T_ARRAY_CAST': /\(\s*array\s*\)/i,
            'T_AS': /as\b/i,

            // Anything below ASCII 32 except \t (0x09), \n (0x0a) and \r (0x0d)
            'T_BAD_CHARACTER': /(?![\u0009\u000A\u000D])[\u0000-\u001F]/,

            'T_BOOLEAN_AND': /&&/i,
            'T_BOOLEAN_OR': /\|\|/,
            'T_BOOL_CAST': /\(\s*bool(ean)?\s*\)/i,
            'T_BREAK': /break\b/i,
            'T_CALLABLE': /callable\b/i,
            'T_CASE': /case\b/i,
            'T_CATCH': /catch\b/i,
            'T_CLASS': /class\b/i,
            'T_CLASS_C': /__CLASS__/i,
            'T_CLONE': /clone/i,
            'T_CLOSE_TAG': /[?%]>\n?/,
            'T_COMMENT': /(?:\/\/|#)(.*?)[\r\n]+|\/\*(?!\*)([\s\S]*?)\*\//,
            'T_CONCAT_EQUAL': /\.=/,
            'T_CONST': /const\b/i,
            'T_CONSTANT_ENCAPSED_STRING': {oneOf: [
                // Single-quoted
                {what: /'((?:[^']|\\')*)'/, captureIndex: 1},
                // Double-quoted
                {what: /"((?:(?!\$\{?[\$a-z0-9_]+)(?:[^\\"]|\\[\s\S]))*)"/, captureIndex: 1, replace: stringEscapeReplacements}
            ]},
            'T_CONTINUE': /continue\b/i,
            'T_CURLY_OPEN': /\{(?=\$)/,
            'T_DEC': /--/i,
            'T_DECLARE': /declare\b/i,
            'T_DEFAULT': /default\b/i,
            'T_DIR': /__DIR__\b/i,
            'T_DIV_EQUAL': /\/=/,

            // See http://www.php.net/manual/en/language.types.float.php
            'T_DNUMBER': /\d+\.\d+|\d\.\d+e\d+|\d+e[+-]\d+/i,

            'T_DOC_COMMENT': /\/\*\*([\s\S]*?)\*\//,
            'T_DO': /do\b/i,
            'T_DOLLAR_OPEN_CURLY_BRACES': /\$\{/,
            'T_DOUBLE_ARROW': /=>/,
            'T_DOUBLE_CAST': /\((real|double|float)\)/i,

            // Also defined as T_PAAMAYIM_NEKUDOTAYIM
            'T_DOUBLE_COLON': /::/i,

            'T_ECHO': /echo\b/i,
            'T_ELSE': /else\b/i,
            'T_ELSEIF': /elseif\b/i,
            'T_EMPTY': /empty\b/i,
            'T_ENCAPSED_AND_WHITESPACE': /(?:[^"\${]|\\["\${])+/,
            'T_ENDDECLARE': /enddeclare\b/i,
            'T_ENDFOR': /endfor\b/i,
            'T_ENDFOREACH': /endforeach\b/i,
            'T_ENDIF': /endif\b/i,
            'T_ENDSWITCH': /endswitch\b/i,
            'T_ENDWHILE': /endwhile\b/i,

            // Token gets defined as a pushed token after a Heredoc is found
            'T_END_HEREDOC': /(?!)/,

            'T_EVAL': /eval\b/i,
            'T_EXIT': /(?:exit|die)\b/i,
            'T_EXTENDS': /extends\b/i,
            'T_FILE': /__FILE__\b/i,
            'T_FINAL': /final\b/i,
            'T_FINALLY': /finally\b/i,
            'T_FOR': /for\b/i,
            'T_FOREACH': /foreach\b/i,
            'T_FUNCTION': /function\b/i,
            'T_FUNC_C': /__FUNCTION__\b/i,
            'T_GLOBAL': /global\b/i,
            'T_GOTO': /goto\b/i,
            'T_HALT_COMPILER': /__halt_compiler(?=\(\)|\s|;)/,
            'T_IF': /if\b/i,
            'T_IMPLEMENTS': /implements\b/i,
            'T_INC': /\+\+/,
            'T_INCLUDE': /include\b/i,
            'T_INCLUDE_ONCE': /include_once\b/i,
            'T_INLINE_HTML': /(?:[^<]|<[^?%]|<\?(?!php)[\s\S]{3})+/,
            'T_INSTANCEOF': /instanceof\b/i,
            'T_INSTEADOF': /insteadof\b/i,
            'T_INT_CAST': /\(\s*int(eger)?\s*\)/i,
            'T_INTERFACE': /interface\b/i,
            'T_ISSET': /isset\b/i,
            'T_IS_EQUAL': /==(?!=)/i,
            'T_IS_GREATER_OR_EQUAL': />=/,
            'T_IS_IDENTICAL': /===/i,
            'T_IS_NOT_EQUAL': /!=|<>/,
            'T_IS_NOT_IDENTICAL': /!==/,
            'T_IS_SMALLER_OR_EQUAL': /<=/,
            'T_LINE': /__LINE__\b/i,
            'T_LIST': /list\b/i,
            'T_LNUMBER': /\d+|0x[0-9a-f]/i,
            'T_LOGICAL_AND': /and\b/i,
            'T_LOGICAL_OR': /or\b/i,
            'T_LOGICAL_XOR': /xor\b/i,
            'T_METHOD_C': /__METHOD__\b/i,
            'T_MINUS_EQUAL': /-=/i,

            // Not used anymore (PHP 4 only)
            'T_ML_COMMENT': /(?!)/,

            'T_MOD_EQUAL': /%=/i,
            'T_MUL_EQUAL': /\*=/,
            'T_NAMESPACE': /namespace\b/i,
            'T_NS_C': /__NAMESPACE__\b/i,
            'T_NS_SEPARATOR': /\\/,
            'T_NEW': /new\b/i,
            'T_NUM_STRING': /\d+/,
            'T_OBJECT_CAST': /\(\s*object\s*\)/i,
            'T_OBJECT_OPERATOR': /->/,

            // Not used anymore (PHP 4 only)
            'T_OLD_FUNCTION': /old_function\b/i,

            'T_OPEN_TAG': /(?:<\?(php)?|<%)\s?(?!=)/,

            'T_OPEN_TAG_WITH_ECHO': /<[?%]=/,
            'T_OR_EQUAL': /\|=/,

            // Also defined as T_DOUBLE_COLON
            'T_PAAMAYIM_NEKUDOTAYIM': /::/i,

            'T_PLUS_EQUAL': /\+=/,
            'T_PRINT': /print\b/i,
            'T_PRIVATE': /private\b/i,
            'T_PUBLIC': /public\b/i,
            'T_PROTECTED': /protected\b/i,
            'T_REQUIRE': /require\b/i,
            'T_REQUIRE_ONCE': /require_once\b/i,
            'T_RETURN': /return\b/i,
            'T_SL': /<</,
            'T_SL_EQUAL': /<<=/,
            'T_SR': />>/,
            'T_SR_EQUAL': />>=/,
            'T_START_HEREDOC': /<<<(["']?)([\$a-z0-9_]+)\1\n?/,
            'T_STATIC': /static\b/i,
            'T_STRING': /(?![\$0-9])[\$a-z0-9_]+/i,
            'T_STRING_CAST': /\(\s*string\s*\)/i,
            'T_STRING_VARNAME': /(?![\$0-9])[\$a-z0-9_]+/,
            'T_SWITCH': /switch\b/i,
            'T_THROW': /throw\b/i,
            'T_TRAIT': /trait\b/i,
            'T_TRAIT_C': /__TRAIT__\b/i,
            'T_TRY': /try\b/i,
            'T_UNSET': /unset\b/i,
            'T_UNSET_CAST': /\(\s*unset\s*\)/i,
            'T_USE': /use\b/i,
            'T_VAR': /var\b/i,
            'T_VARIABLE': {what: /\$([a-z0-9_]+)/i, captureIndex: 1},
            'T_WHILE': /while\b/i,
            'T_WHITESPACE': /[\r\n\t ]+/,
            'T_XOR_EQUAL': /\^=/i,
            'T_YIELD': /yield\b/i,

            'N_ARGUMENT': {
                oneOf: ['N_DECORATED_ARGUMENT', 'N_VARIABLE']
            },
            'N_DECORATED_ARGUMENT': {
                captureAs: 'N_ARGUMENT',
                components: {oneOf: [
                    [{name: 'variable', rule: 'N_VARIABLE'}, (/=/), {name: 'value', rule: 'N_TERM'}],
                    [{name: 'type', oneOf: ['N_NAMESPACE', 'T_STRING']}, {name: 'variable', rule: 'N_VARIABLE'}, (/=/), {name: 'value', rule: 'N_TERM'}],
                    [{name: 'type', oneOf: ['N_NAMESPACE', 'T_STRING']}, {name: 'variable', rule: 'N_VARIABLE'}]
                ]}
            },
            'N_ARRAY_INDEX': {
                components: 'N_EXPRESSION_LEVEL_2_A'
            },
            'N_ARRAY_LITERAL': {
                components: ['T_ARRAY', (/\(/), {name: 'elements', zeroOrMoreOf: [{oneOf: ['N_KEY_VALUE_PAIR', 'N_EXPRESSION']}, {what: (/(,|(?=\)))()/), captureIndex: 2}]}, (/\)/)]
            },
            'N_BOOLEAN': {
                components: {name: 'bool', what: (/true|false/i)}
            },
            'N_BREAK_STATEMENT': {
                components: ['T_BREAK', {name: 'levels', oneOf: ['N_INTEGER', 'N_JUMP_ONE_LEVEL']}, (/;/)]
            },
            'N_CASE': {
                components: ['T_CASE', {name: 'expression', what: 'N_EXPRESSION'}, (/:/), {name: 'body', zeroOrMoreOf: 'N_STATEMENT'}]
            },
            'N_CLASS_STATEMENT': {
                components: ['T_CLASS', {name: 'className', rule: 'T_STRING'}, {optionally: ['T_EXTENDS', {name: 'extend', oneOf: ['N_NAMESPACE', 'T_STRING']}]}, {optionally: ['T_IMPLEMENTS', {name: 'implement', zeroOrMoreOf: [{oneOf: ['N_NAMESPACE', 'T_STRING']}, {what: (/(,|(?=\{))()/), captureIndex: 2}]}]}, (/\{/), {name: 'members', zeroOrMoreOf: {oneOf: ['N_INSTANCE_PROPERTY_DEFINITION', 'N_STATIC_PROPERTY_DEFINITION', 'N_METHOD_DEFINITION', 'N_STATIC_METHOD_DEFINITION', 'N_CONSTANT_DEFINITION']}}, (/\}/)]
            },
            'N_CLOSURE': {
                components: ['T_FUNCTION', (/\(/), {name: 'args', zeroOrMoreOf: ['N_ARGUMENT', {what: (/(,|(?=\)))()/), captureIndex: 2}]}, (/\)/), {oneOf: [['T_USE', (/\(/), {name: 'bindings', zeroOrMoreOf: ['N_VARIABLE', {what: (/(,|(?=\)))()/), captureIndex: 2}]}, (/\)/)], {name: 'bindings', zeroOrMoreOf: {what: (/(?!)/)}}]}, {name: 'body', what: 'N_STATEMENT'}]
            },
            'N_COMMA_EXPRESSION': {
                components: {optionally: [{name: 'expressions', zeroOrMoreOf: ['N_EXPRESSION', {what: (/(,|(?=[;\)]))()/), captureIndex: 2}]}, (/(?=[;\)])/)]}
            },
            'N_COMPOUND_STATEMENT': {
                components: [(/\{/), {name: 'statements', zeroOrMoreOf: 'N_STATEMENT'}, (/\}/)]
            },
            'N_CONSTANT_DEFINITION': {
                components: ['T_CONST', {name: 'constant', what: 'T_STRING'}, (/=/), {name: 'value', oneOf: ['N_CLASS_CONSTANT', 'N_TERM']}, (/;/)]
            },
            'N_CONTINUE_STATEMENT': {
                components: ['T_CONTINUE', {name: 'levels', oneOf: ['N_INTEGER', 'N_JUMP_ONE_LEVEL']}, (/;/)]
            },
            'N_DEFAULT_CASE': {
                components: ['T_DEFAULT', (/:/), {name: 'body', zeroOrMoreOf: 'N_STATEMENT'}]
            },
            'N_ECHO_STATEMENT': {
                components: ['T_ECHO', {name: 'expression', what: 'N_EXPRESSION'}, (/;/)]
            },
            'N_EMPTY_STATEMENT': {
                components: (/;/)
            },
            'N_EXPRESSION': {
                components: {oneOf: ['N_EXPRESSION_LEVEL_21']}
            },

            /*
             * Operator precedence: see http://php.net/manual/en/language.operators.precedence.php
             */
            // Precedence level 0 (highest) - single terms and bracketed expressions
            'N_EXPRESSION_LEVEL_0': {
                components: [{oneOf: ['N_TERM', [(/\(/), 'N_EXPRESSION', (/\)/)]]}]
            },
            'N_EXPRESSION_LEVEL_1_A': {
                captureAs: 'N_NEW_EXPRESSION',
                components: {oneOf: [
                    [
                        'T_NEW',
                        {name: 'className', oneOf: ['N_NAMESPACED_REFERENCE', 'N_EXPRESSION_LEVEL_0']},
                        {optionally: [
                            (/\(/),
                            {name: 'args', zeroOrMoreOf: ['N_EXPRESSION', {what: (/(,|(?=\)))()/), captureIndex: 2}]},
                            (/\)/)
                        ]}
                    ],
                    {name: 'next', what: 'N_EXPRESSION_LEVEL_0'}
                ]},
                ifNoMatch: {component: 'className', capture: 'next'}
            },
            'N_DO_WHILE_STATEMENT': {
                components: ['T_DO', {name: 'body', what: 'N_STATEMENT'}, 'T_WHILE', (/\(/), {name: 'condition', what: 'N_EXPRESSION'}, (/\)/), (/;/)]
            },
            'N_EXPRESSION_LEVEL_1_B': {
                captureAs: 'N_FUNCTION_CALL',
                components: {oneOf: [
                    [
                        {name: 'func', oneOf: ['N_NAMESPACED_REFERENCE', 'N_EXPRESSION_LEVEL_1_A']},
                        [
                            (/\(/),
                            {name: 'args', zeroOrMoreOf: ['N_EXPRESSION', {what: (/(,|(?=\)))()/), captureIndex: 2}]},
                            (/\)/)
                        ]
                    ],
                    {name: 'next', what: 'N_EXPRESSION_LEVEL_1_A'}
                ]},
                ifNoMatch: {component: 'func', capture: 'next'}
            },
            'N_EXPRESSION_LEVEL_1_D': {
                captureAs: 'N_UNARY_EXPRESSION',
                components: [{name: 'operator', optionally: 'T_CLONE'}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_1_B'}],
                ifNoMatch: {component: 'operator', capture: 'operand'},
                options: {prefix: true}
            },

            'N_EXPRESSION_LEVEL_2_A': {
                captureAs: 'N_CLASS_CONSTANT',
                components: {oneOf: [
                    [
                        {name: 'className', oneOf: ['N_NAMESPACED_REFERENCE', 'N_EXPRESSION_LEVEL_1_D']},
                        'T_DOUBLE_COLON',
                        {name: 'constant', what: ['T_STRING', (/(?!\()/)]}
                    ],
                    {name: 'next', what: 'N_EXPRESSION_LEVEL_1_D'}
                ]},
                ifNoMatch: {component: 'constant', capture: 'next'}
            },
            'N_CLASS_CONSTANT': 'N_EXPRESSION_LEVEL_2_A',
            'N_EMPTY_ARRAY_INDEX': {
                captureAs: 'N_ARRAY_INDEX',
                components: {name: 'indices', what: [(/\[/), (/\]/)]},
                options: {indices: true}
            },
            'N_EXPRESSION_LEVEL_2_B': {
                components: [
                    {
                        name: 'expression',
                        oneOf: ['N_EXPRESSION_LEVEL_2_A', 'N_NAMESPACED_REFERENCE']
                    },
                    {
                        name: 'member',
                        zeroOrMoreOf: {
                            oneOf: [
                                // Array index
                                {
                                    name: 'array_index',
                                    oneOf: [
                                        'N_EMPTY_ARRAY_INDEX',
                                        {
                                            name: 'indices',
                                            oneOrMoreOf: [
                                                (/\[/), {name: 'index', what: 'N_EXPRESSION'}, (/\]/)
                                            ]
                                        }
                                    ]
                                },
                                // Method call
                                {
                                    name: 'method_call',
                                    what: {
                                        name: 'calls',
                                        oneOrMoreOf: [
                                            'T_OBJECT_OPERATOR',
                                            {name: 'func', oneOf: ['N_STRING', 'N_VARIABLE']},
                                            (/\(/),
                                            {
                                                name: 'args',
                                                zeroOrMoreOf: ['N_EXPRESSION', {
                                                    what: (/(,|(?=\)))()/),
                                                    captureIndex: 2
                                                }]
                                            },
                                            (/\)/)
                                        ]
                                    }
                                },
                                // Object property
                                {
                                    name: 'object_property',
                                    what: {
                                        name: 'properties',
                                        oneOrMoreOf: [
                                            'T_OBJECT_OPERATOR',
                                            {name: 'property', what: 'N_INSTANCE_MEMBER'},
                                            (/(?!\()/)
                                        ]
                                    }
                                },
                                // Static method call
                                {
                                    name: 'static_method_call',
                                    what: [
                                        'T_DOUBLE_COLON',
                                        {name: 'method', oneOf: ['N_STRING', 'N_VARIABLE', 'N_VARIABLE_EXPRESSION']},
                                        (/\(/),
                                        {name: 'args', zeroOrMoreOf: ['N_EXPRESSION', {what: (/(,|(?=\)))()/), captureIndex: 2}]},
                                        (/\)/)
                                    ]
                                },
                                // Static object property
                                {
                                    name: 'static_property',
                                    what: [
                                        'T_DOUBLE_COLON',
                                        {name: 'property', what: 'N_STATIC_MEMBER'}
                                    ]
                                }
                            ]
                        }
                    }
                ],
                processor: function (node) {
                    var result;

                    if (!node || !node.expression) {
                        return node;
                    }

                    result = node.expression;

                    util.each(node.member, function (member) {
                        if (member.array_index) {
                            result = {
                                name: 'N_ARRAY_INDEX',
                                array: result,
                                indices: member.array_index.indices
                            };
                        } else if (member.method_call) {
                            result = {
                                name: 'N_METHOD_CALL',
                                object: result,
                                calls: member.method_call.calls
                            };
                        } else if (member.object_property) {
                            result = {
                                name: 'N_OBJECT_PROPERTY',
                                object: result,
                                properties: member.object_property.properties
                            };
                        } else if (member.static_method_call) {
                            result = {
                                name: 'N_STATIC_METHOD_CALL',
                                className: result,
                                method: member.static_method_call.method,
                                args: member.static_method_call.args
                            };
                        } else if (member.static_property) {
                            result = {
                                name: 'N_STATIC_PROPERTY',
                                className: result,
                                property: member.static_property.property
                            };
                        }
                    });

                    return result;
                }
            },
            'N_EXPRESSION_LEVEL_3_A': {
                oneOf: ['N_UNARY_PREFIX_EXPRESSION', 'N_UNARY_SUFFIX_EXPRESSION', 'N_EXPRESSION_LEVEL_2_B']
            },
            'N_EXPRESSION_LEVEL_3_B': {
                oneOf: ['N_ARRAY_CAST', 'N_EXPRESSION_LEVEL_3_A']
            },
            'N_ARRAY_CAST': {
                components: ['T_ARRAY_CAST', {name: 'value', rule: 'N_EXPRESSION_LEVEL_3_A'}]
            },
            'N_UNARY_PREFIX_EXPRESSION': {
                captureAs: 'N_UNARY_EXPRESSION',
                components: [{name: 'operator', oneOf: ['T_INC', 'T_DEC', (/~/)]}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_2_B'}],
                ifNoMatch: {component: 'operator', capture: 'operand'},
                options: {prefix: true}
            },
            'N_UNARY_SUFFIX_EXPRESSION': {
                captureAs: 'N_UNARY_EXPRESSION',
                components: [{name: 'operand', what: 'N_EXPRESSION_LEVEL_2_B'}, {name: 'operator', oneOf: ['T_INC', 'T_DEC']}],
                ifNoMatch: {component: 'operator', capture: 'operand'},
                options: {prefix: false}
            },
            'N_EXPRESSION_LEVEL_4': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_3_B'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', what: 'T_INSTANCEOF'}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_3_B'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_5': {
                captureAs: 'N_UNARY_EXPRESSION',
                components: [{name: 'operator', optionally: (/!/)}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_4'}],
                ifNoMatch: {component: 'operator', capture: 'operand'},
                options: {prefix: true}
            },
            'N_EXPRESSION_LEVEL_6': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_5'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', oneOf: [(/\*/), (/\//), (/%/)]}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_5'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_7_A': {
                captureAs: 'N_UNARY_EXPRESSION',
                components: [{name: 'operator', optionally: (/([+-])(?!\1)/)}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_6'}],
                ifNoMatch: {component: 'operator', capture: 'operand'},
                options: {prefix: true}
            },
            'N_EXPRESSION_LEVEL_7_B': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_7_A'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', oneOf: [(/\+/), (/-/), (/\./)]}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_7_A'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_8': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_7_B'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', oneOf: ['T_SL', 'T_SR']}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_7_B'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_9': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_8'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', oneOf: ['T_IS_SMALLER_OR_EQUAL', (/</), 'T_IS_GREATER_OR_EQUAL', (/>/)]}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_8'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_10': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_9'}, {name: 'right', wrapInArray: true, optionally: [{name: 'operator', oneOf: ['T_IS_IDENTICAL', 'T_IS_EQUAL', 'T_IS_NOT_IDENTICAL', 'T_IS_NOT_EQUAL']}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_9'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_11': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_10'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', what: (/&/)}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_10'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_12': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_11'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', what: (/\^/)}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_11'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_13': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_12'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', what: (/\|/)}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_12'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_14': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_13'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', what: (/&&/)}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_13'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_15': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_14'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', what: (/\|\|/)}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_14'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_16': {
                captureAs: 'N_TERNARY',
                components: [{name: 'condition', what: 'N_EXPRESSION_LEVEL_15'}, {name: 'options', zeroOrMoreOf: [(/\?/), {name: 'consequent', what: 'N_EXPRESSION_LEVEL_15'}, (/:/), {name: 'alternate', what: 'N_EXPRESSION_LEVEL_15'}]}],
                ifNoMatch: {component: 'options', capture: 'condition'}
            },
            'N_EXPRESSION_LEVEL_17_A': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_16'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', what: (/=/)}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_16'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_17_B': {
                captureAs: 'N_PRINT_EXPRESSION',
                components: {oneOf: [
                    [
                        'T_PRINT',
                        {name: 'operand', what: 'N_EXPRESSION_LEVEL_17_A'},
                    ],
                    {name: 'next', what: 'N_EXPRESSION_LEVEL_17_A'}
                ]},
                ifNoMatch: {component: 'operand', capture: 'next'}
            },
            'N_EXPRESSION_LEVEL_18': {
                captureAs: 'N_EXPRESSION',
                components: [{name: 'left', what: 'N_EXPRESSION_LEVEL_17_B'}, {name: 'right', zeroOrMoreOf: [{name: 'operator', what: 'T_LOGICAL_AND'}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_17_B'}]}],
                ifNoMatch: {component: 'right', capture: 'left'}
            },
            'N_EXPRESSION_LEVEL_19': {
                components: 'N_EXPRESSION_LEVEL_18'
            },
            'N_EXPRESSION_LEVEL_20': {
                components: 'N_EXPRESSION_LEVEL_19'
            },
            'N_EXPRESSION_LEVEL_21': {
                components: 'N_EXPRESSION_LEVEL_20'
            },
            'N_EXPRESSION_STATEMENT': {
                components: [{name: 'expression', what: 'N_EXPRESSION'}, (/;/)]
            },
            'N_FLOAT': {
                components: {name: 'number', what: 'T_DNUMBER'}
            },
            'N_FOR_STATEMENT': {
                components: ['T_FOR', (/\(/), {name: 'initializer', what: 'N_COMMA_EXPRESSION'}, (/;/), {name: 'condition', what: 'N_COMMA_EXPRESSION'}, (/;/), {name: 'update', what: 'N_COMMA_EXPRESSION'}, (/\)/), {name: 'body', what: 'N_STATEMENT'}]
            },
            'N_FOREACH_STATEMENT': {
                components: ['T_FOREACH', (/\(/), {name: 'array', rule: 'N_EXPRESSION'}, 'T_AS', {optionally: [{name: 'key', oneOf: ['N_ARRAY_INDEX', 'N_VARIABLE']}, 'T_DOUBLE_ARROW']}, {name: 'value', oneOf: ['N_ARRAY_INDEX', 'N_VARIABLE']}, (/\)/), {name: 'body', what: 'N_STATEMENT'}]
            },
            'N_FUNCTION_STATEMENT': {
                components: ['T_FUNCTION', {name: 'func', what: 'T_STRING'}, (/\(/), {name: 'args', zeroOrMoreOf: ['N_ARGUMENT', {what: (/(,|(?=\)))()/), captureIndex: 2}]}, (/\)/), {name: 'body', what: 'N_STATEMENT'}]
            },
            'N_GOTO_STATEMENT': {
                components: ['T_GOTO', {name: 'label', what: 'T_STRING'}, (/;/)]
            },
            'N_IF_STATEMENT': {
                components: ['T_IF', (/\(/), {name: 'condition', what: 'N_EXPRESSION'}, (/\)/), {name: 'consequentStatement', what: 'N_STATEMENT'}, {optionally: [(/else(\b|(?=if\b))/), {name: 'alternateStatement', what: 'N_STATEMENT'}]}]
            },
            'N_IGNORE': {
                components: {oneOrMoreOf: {oneOf: ['T_WHITESPACE', 'T_COMMENT', 'T_DOC_COMMENT']}}
            },
            'N_INCLUDE_EXPRESSION': {
                components: ['T_INCLUDE', {name: 'path', what: 'N_EXPRESSION'}]
            },
            'N_INLINE_HTML_STATEMENT': [{oneOf: ['T_CLOSE_TAG', '<BOF>']}, {name: 'html', what: 'T_INLINE_HTML'}, {oneOf: ['T_OPEN_TAG', '<EOF>']}],
            'N_INSTANCE_MEMBER': {
                components: {oneOf: ['N_STRING', 'N_VARIABLE', [(/\{/), 'N_EXPRESSION', (/\}/)]]}
            },
            'N_INSTANCE_PROPERTY_DEFINITION': {
                components: [{name: 'visibility', oneOf: ['T_PUBLIC', 'T_PRIVATE', 'T_PROTECTED']}, {name: 'variable', what: 'N_VARIABLE'}, {optionally: [(/=/), {name: 'value', what: 'N_TERM'}]}, (/;/)]
            },
            'N_INTEGER': {
                components: {name: 'number', what: 'T_LNUMBER'}
            },
            'N_INTERFACE_METHOD_DEFINITION': {
                components: [{name: 'visibility', oneOf: ['T_PUBLIC', 'T_PRIVATE', 'T_PROTECTED']}, 'T_FUNCTION', {name: 'func', what: 'T_STRING'}, (/\(/), {name: 'args', zeroOrMoreOf: ['N_ARGUMENT', {what: (/(,|(?=\)))()/), captureIndex: 2}]}, (/\)/), (/;/)]
            },
            'N_INTERFACE_STATEMENT': {
                components: ['T_INTERFACE', {name: 'interfaceName', rule: 'T_STRING'}, {optionally: ['T_EXTENDS', {name: 'extend', oneOf: ['N_NAMESPACE', 'T_STRING']}]}, (/\{/), {name: 'members', zeroOrMoreOf: {oneOf: ['N_INTERFACE_METHOD_DEFINITION', 'N_STATIC_INTERFACE_METHOD_DEFINITION', 'N_CONSTANT_DEFINITION', 'N_INSTANCE_PROPERTY_DEFINITION', 'N_STATIC_PROPERTY_DEFINITION', 'N_METHOD_DEFINITION', 'N_STATIC_METHOD_DEFINITION']}}, (/\}/)]
            },
            'N_ISSET': {
                components: ['T_ISSET', (/\(/), {name: 'variables', zeroOrMoreOf: ['N_EXPRESSION', {what: (/(,|(?=\)))()/), captureIndex: 2}]}, (/\)/)]
            },
            'N_JUMP_ONE_LEVEL': {
                captureAs: 'N_INTEGER',
                components: {name: 'number', what: (/()/)},
                options: {number: '1'}
            },
            'N_KEY_VALUE_PAIR': {
                components: [{name: 'key', what: 'N_EXPRESSION'}, 'T_DOUBLE_ARROW', {name: 'value', what: 'N_EXPRESSION'}]
            },
            'N_LABEL_STATEMENT': {
                components: [{name: 'label', what: [(/(?!default\b)/i), 'T_STRING']}, (/:/)]
            },
            'N_LIST': {
                components: ['T_LIST', (/\(/), {name: 'elements', zeroOrMoreOf: {oneOf: [[{oneOf: ['N_VARIABLE', 'N_ARRAY_INDEX']}, {what: (/(,|(?=\)))()/), captureIndex: 2}], 'N_VOID']}}, (/\)/)]
            },
            'N_MAGIC_CONSTANT': {
                components: {oneOf: ['N_MAGIC_DIR_CONSTANT', 'N_MAGIC_FILE_CONSTANT', 'N_MAGIC_LINE_CONSTANT']}
            },
            'N_MAGIC_DIR_CONSTANT': {
                components: {what: 'T_DIR', replace: uppercaseReplacements, allowMerge: false}
            },
            'N_MAGIC_FILE_CONSTANT': {
                components: {what: 'T_FILE', replace: uppercaseReplacements, allowMerge: false}
            },
            'N_MAGIC_LINE_CONSTANT': {
                components: {what: 'T_LINE', replace: uppercaseReplacements, captureOffsetAs: 'offset'}
            },
            'N_METHOD_DEFINITION': {
                components: [{name: 'visibility', oneOf: ['T_PUBLIC', 'T_PRIVATE', 'T_PROTECTED']}, 'T_FUNCTION', {name: 'func', what: 'T_STRING'}, (/\(/), {name: 'args', zeroOrMoreOf: ['N_ARGUMENT', {what: (/(,|(?=\)))()/), captureIndex: 2}]}, (/\)/), {name: 'body', what: 'N_STATEMENT'}]
            },
            'N_NAMESPACE': {
                components: [(/(?!(?:new|use)\b)/i), {optionally: 'T_STRING'}, {oneOrMoreOf: ['T_NS_SEPARATOR', 'T_STRING']}]
            },
            'N_NAMESPACE_STATEMENT': {
                components: ['T_NAMESPACE', {name: 'namespace', oneOf: ['N_NAMESPACE', 'T_STRING']}, (/;/), {name: 'statements', zeroOrMoreOf: 'N_NAMESPACE_SCOPED_STATEMENT'}]
            },
            'N_NAMESPACED_REFERENCE': {
                captureAs: 'N_STRING',
                components: {name: 'string', what: 'N_NAMESPACE'}
            },
            'N_NULL': {
                allowMerge: false,
                what: (/null\b/i)
            },
            'N_PROGRAM': {
                components: [{optionally: 'T_OPEN_TAG'}, {name: 'statements', zeroOrMoreOf: 'N_STATEMENT'}, {oneOf: ['T_CLOSE_TAG', {what: '<EOF>'}]}]
            },
            'N_RETURN_STATEMENT': {
                components: ['T_RETURN', {name: 'expression', optionally: 'N_EXPRESSION'}, (/;/)]
            },
            'N_STATEMENT': {
                components: {oneOf: ['N_NAMESPACE_SCOPED_STATEMENT', 'N_NAMESPACE_STATEMENT']}
            },
            'N_NAMESPACE_SCOPED_STATEMENT': {
                components: {oneOf: ['N_COMPOUND_STATEMENT', 'N_RETURN_STATEMENT', 'N_INLINE_HTML_STATEMENT', 'N_EMPTY_STATEMENT', 'N_ECHO_STATEMENT', 'N_BREAK_STATEMENT', 'N_CONTINUE_STATEMENT', 'N_EXPRESSION_STATEMENT', 'N_FUNCTION_STATEMENT', 'N_IF_STATEMENT', 'N_FOREACH_STATEMENT', 'N_FOR_STATEMENT', 'N_WHILE_STATEMENT', 'N_DO_WHILE_STATEMENT', 'N_CLASS_STATEMENT', 'N_INTERFACE_STATEMENT', 'N_SWITCH_STATEMENT', 'N_LABEL_STATEMENT', 'N_GOTO_STATEMENT', 'N_USE_STATEMENT', 'N_THROW_STATEMENT']}
            },
            'N_REQUIRE_EXPRESSION': {
                components: ['T_REQUIRE', {name: 'path', what: 'N_EXPRESSION'}]
            },
            'N_REQUIRE_ONCE_EXPRESSION': {
                components: ['T_REQUIRE_ONCE', {name: 'path', what: 'N_EXPRESSION'}]
            },
            'N_SELF': {
                allowMerge: false,
                what: /self\b(?=\s*::)/
            },
            'N_STATIC_INTERFACE_METHOD_DEFINITION': {
                components: [
                    {oneOf: [
                        [{name: 'visibility', rule: 'N_VISIBILITY'}, 'T_STATIC'],
                        ['T_STATIC', {name: 'visibility', rule: 'N_VISIBILITY'}],
                        'T_STATIC'
                    ]},
                    'T_FUNCTION',
                    {name: 'method', what: 'T_STRING'},
                    (/\(/),
                    {name: 'args', zeroOrMoreOf: ['N_ARGUMENT', {what: (/(,|(?=\)))()/), captureIndex: 2}]},
                    (/\)/),
                    (/;/)
                ]            },
            'N_STATIC_MEMBER': {
                components: {oneOf: ['N_STATIC_VARIABLE', 'N_STATIC_VARIABLE_EXPRESSION']}
            },
            'N_STATIC_METHOD_DEFINITION': {
                components: [
                    {oneOf: [
                        [{name: 'visibility', rule: 'N_VISIBILITY'}, 'T_STATIC'],
                        ['T_STATIC', {name: 'visibility', rule: 'N_VISIBILITY'}],
                        'T_STATIC'
                    ]},
                    'T_FUNCTION',
                    {name: 'method', what: 'T_STRING'},
                    (/\(/),
                    {name: 'args', zeroOrMoreOf: ['N_ARGUMENT', {what: (/(,|(?=\)))()/), captureIndex: 2}]},
                    (/\)/),
                    {name: 'body', what: 'N_STATEMENT'}
                ]
            },
            'N_STATIC_VARIABLE': {
                captureAs: 'N_STRING',
                components: {name: 'string', rule: 'T_VARIABLE'}
            },
            'N_STATIC_VARIABLE_EXPRESSION': {
                oneOf: [
                    [(/\$/), 'N_VARIABLE'],
                    [(/\$\{/), 'N_EXPRESSION', (/\}/)]
                ]
            },
            'N_STATIC_PROPERTY_DEFINITION': {
                components: [
                    {oneOf: [
                        [{name: 'visibility', rule: 'N_VISIBILITY'}, 'T_STATIC'],
                        ['T_STATIC', {name: 'visibility', rule: 'N_VISIBILITY'}],
                        'T_STATIC'
                    ]},
                    {name: 'variable', what: 'N_VARIABLE'}, {optionally: [(/=/), {name: 'value', what: 'N_TERM'}]}, (/;/)
                ]
            },
            'N_STRING': {
                components: {name: 'string', what: 'T_STRING'}
            },
            'N_STRING_EXPRESSION': {
                components: [(/"/), {name: 'parts', oneOrMoreOf: {oneOf: ['N_STRING_VARIABLE', 'N_STRING_VARIABLE_EXPRESSION', 'N_STRING_TEXT']}}, (/"/)]
            },
            'N_STRING_LITERAL': {
                components: {oneOf: [{name: 'string', what: 'T_CONSTANT_ENCAPSED_STRING'}, 'N_STRING_EXPRESSION']}
            },
            'N_STRING_TEXT': {
                captureAs: 'N_STRING_LITERAL',
                components: {name: 'string', what: (/(?:[^\\"\$]|\\[\s\S]|\$(?=\$))+/), ignoreWhitespace: false, replace: stringEscapeReplacements}
            },
            'N_STRING_VARIABLE': {
                captureAs: 'N_VARIABLE',
                components: [
                    {oneOf: [
                        {name: 'variable', what: 'T_VARIABLE'},
                        {name: 'variable', what: (/\$\{([a-z0-9_]+)\}/i), captureIndex: 1}
                    ]}
                ]
            },
            'N_STRING_VARIABLE_EXPRESSION': {
                captureAs: 'N_VARIABLE_EXPRESSION',
                components: [
                    {oneOf: [
                        {name: 'expression', what: [(/\$\{(?=\$)/), 'N_VARIABLE', (/\}/)]}
                    ]}
                ]
            },
            'N_SWITCH_STATEMENT': {
                components: ['T_SWITCH', (/\(/), {name: 'expression', what: 'N_EXPRESSION'}, (/\)/), (/\{/), {name: 'cases', zeroOrMoreOf: {oneOf: ['N_CASE', 'N_DEFAULT_CASE']}}, (/\}/)]
            },
            'N_TERM': {
                components: {oneOf: ['N_VARIABLE', 'N_FLOAT', 'N_INTEGER', 'N_BOOLEAN', 'N_STRING_LITERAL', 'N_ARRAY_LITERAL', 'N_LIST', 'N_ISSET', 'N_CLOSURE', 'N_MAGIC_CONSTANT', 'N_REQUIRE_EXPRESSION', 'N_REQUIRE_ONCE_EXPRESSION', 'N_INCLUDE_EXPRESSION', 'N_SELF', 'N_NULL', 'N_NAMESPACED_REFERENCE', 'N_STRING']}
            },
            'N_THROW_STATEMENT': {
                components: ['T_THROW', {name: 'expression', rule: 'N_EXPRESSION'}, (/;/)]
            },
            'N_USE_STATEMENT': {
                components: ['T_USE', {name: 'uses', oneOrMoreOf: [{name: 'source', oneOf: ['N_NAMESPACE', 'T_STRING']}, {optionally: ['T_AS', {name: 'alias', what: 'T_STRING'}]}]}, (/;/)]
            },
            'N_VARIABLE': {
                components: [
                    {optionally: {name: 'reference', what: (/&/)}},
                    {oneOf: [
                        {name: 'variable', what: 'T_VARIABLE'},
                        {name: 'variable', what: (/\$\{([a-z0-9_]+)\}/i), captureIndex: 1}
                    ]}
                ]
            },
            'N_VARIABLE_EXPRESSION': {
                components: {
                    name: 'expression',
                    rule: 'N_STATIC_VARIABLE_EXPRESSION'
                }
            },
            'N_VISIBILITY': {
                oneOf: ['T_PUBLIC', 'T_PRIVATE', 'T_PROTECTED']
            },
            'N_VOID': {
                components: {name: 'value', what: (/,()/), captureIndex: 1}
            },
            'N_WHILE_STATEMENT': {
                components: ['T_WHILE', (/\(/), {name: 'condition', what: 'N_EXPRESSION'}, (/\)/), (/\{/), {name: 'statements', zeroOrMoreOf: 'N_STATEMENT'}, (/\}/)]
            }
        },
        start: 'N_PROGRAM'
    };}());

},{"./../../js/util":51,"./grammar/ErrorHandler":53,"./grammar/State":54}],53:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), PHPParseError = require('./../interpreter/Error/Parse');
function ErrorHandler(stderr, state) {
        this.state = state;
        this.stderr = stderr;
    }
util.extend(ErrorHandler.prototype, {
        handle: function (parseException) {
            var handler = this,
                text = parseException.getText(),
                error,
                what;

            if (parseException.unexpectedEndOfInput()) {
                what = '$end';
            } else {
                what = '\'' + text.substr(parseException.getFurthestMatchEnd(), 1) + '\'';
            }

            error = new PHPParseError(PHPParseError.SYNTAX_UNEXPECTED, {
                'file': handler.state.getPath(),
                'line': parseException.getLineNumber(),
                'what': what
            });

            if (handler.state.isMainProgram()) {
                handler.stderr.write(error.message);
            }

            throw error;
        }
    });
module.exports = ErrorHandler;}());

},{"./../../../js/util":51,"./../interpreter/Error/Parse":63}],54:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var phpUtil = require('../util'), util = require('./../../../js/util');
function State() {
        this.path = null;
    }
util.extend(State.prototype, {
        getPath: function () {
            return phpUtil.normalizeModulePath(this.path);
        },

        isMainProgram: function () {
            return this.path === null;
        },

        setPath: function (path) {
            this.path = path;
        }
    });
module.exports = State;}());

},{"../util":99,"./../../../js/util":51}],55:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*
 * PHP Interpreter
 */

/*global define */
(function () {'use strict';
var util = require('./../../js/util'), Call = require('./interpreter/Call'), Exception = require('./../../js/Exception/Exception'), KeyValuePair = require('./interpreter/KeyValuePair'), LabelRepository = require('./interpreter/LabelRepository'), List = require('./interpreter/List'), NamespaceScope = require('./interpreter/NamespaceScope'), ObjectValue = require('./interpreter/Value/Object'), PHPEnvironment = require('./interpreter/Environment'), PHPError = require('./interpreter/Error'), PHPFatalError = require('./interpreter/Error/Fatal'), PHPState = require('./interpreter/State'), Promise = require('./../../js/Promise'), Scope = require('./interpreter/Scope');
var INCLUDE_OPTION = 'include',
        binaryOperatorToMethod = {
            '+': 'add',
            '-': 'subtract',
            '*': 'multiply',
            '/': 'divide',
            '.': 'concat',
            '<<': 'shiftLeftBy',
            '>>': 'shiftRightBy',
            '==': 'isEqualTo',
            '!=': 'isNotEqualTo',
            '===': 'isIdenticalTo',
            '!==': 'isNotIdenticalTo',
            '<': 'isLessThan',
            '=': {
                'false': 'setValue',
                'true': 'setReference'
            }
        },
        hasOwn = {}.hasOwnProperty,
        unaryOperatorToMethod = {
            prefix: {
                '+': 'toPositive',
                '-': 'toNegative',
                '++': 'preIncrement',
                '--': 'preDecrement',
                '~': 'onesComplement',
                '!': 'logicalNot'
            },
            suffix: {
                '++': 'postIncrement',
                '--': 'postDecrement'
            }
        };
function evaluateModule(state, code, context, stdin, stdout, stderr) {
        function include(path) {
            var done = false,
                promise = new Promise(),
                pause = null,
                result;

            function completeWith(moduleResult) {
                if (pause) {
                    pause.resume(moduleResult);
                } else {
                    result = moduleResult;
                }
            }

            promise.done(function (contents) {
                done = true;

                engine.execute(contents, path).done(function (resultNative) {
                    // TODO: This is inefficient, we should just have access to the Value object
                    completeWith(valueFactory.coerce(resultNative));
                }).fail(function (exception) {
                    throw exception;
                });
            }).fail(function () {
                done = true;

                callStack.raiseError(PHPError.E_WARNING, 'include(' + path + '): failed to open stream: No such file or directory');
                callStack.raiseError(PHPError.E_WARNING, 'include(): Failed opening \'' + path + '\' for inclusion');

                completeWith(valueFactory.createNull());
            });

            if (!options[INCLUDE_OPTION]) {
                throw new Exception('include() :: No "include" transport is available for loading the module.');
            }

            options[INCLUDE_OPTION](path, promise);

            if (done) {
                return result;
            }

            pause = resumable.createPause();
            pause.now();
        }

        var engine = state.getEngine(),
            exports = {},
            globalNamespace = state.getGlobalNamespace(),
            valueFactory = state.getValueFactory(),
            promise = new Promise(),
            referenceFactory = state.getReferenceFactory(),
            callStack = state.getCallStack(),
            globalScope = state.getGlobalScope(),
            options = state.getOptions(),
            resumable = state.getResumable(),
            tools = {
                createClosure: function (func, scope) {
                    func.scopeWhenCreated = scope;

                    return tools.valueFactory.createObject(
                        func,
                        globalNamespace.getClass('Closure')
                    );
                },
                createInstance: function (namespaceScope, classNameValue, args) {
                    var className = classNameValue.getNative(),
                        classObject = namespaceScope.getClass(className);

                    return classObject.instantiate(args);
                },
                createKeyValuePair: function (key, value) {
                    return new KeyValuePair(key, value);
                },
                createList: function (elements) {
                    return new List(elements);
                },
                createNamespaceScope: function (namespace) {
                    return new NamespaceScope(globalNamespace, namespace);
                },
                getPath: function () {
                    return valueFactory.createString(context.path);
                },
                getPathDirectory: function () {
                    return valueFactory.createString(state.getPath().replace(/\/[^\/]+$/, ''));
                },
                implyArray: function (variable) {
                    // Undefined variables and variables containing null may be implicitly converted to arrays
                    if (!variable.isDefined() || variable.getValue().getType() === 'null') {
                        variable.setValue(valueFactory.createArray([]));
                    }

                    return variable.getValue();
                },
                implyObject: function (variable) {
                    return variable.getValue();
                },
                include: include,
                popCall: function () {
                    callStack.pop();
                },
                pushCall: function (thisObject, currentClass) {
                    var call;

                    if (!valueFactory.isValue(thisObject)) {
                        thisObject = null;
                    }

                    call = new Call(new Scope(callStack, valueFactory, thisObject, currentClass));

                    callStack.push(call);

                    return call;
                },
                referenceFactory: referenceFactory,
                requireOnce: include,
                require: include,
                throwNoActiveClassScope: function () {
                    throw new PHPFatalError(PHPFatalError.SELF_WHEN_NO_ACTIVE_CLASS);
                },
                valueFactory: valueFactory
            },
            PHPException = state.getPHPExceptionClass();

        // Push the 'main' global scope call onto the stack
        callStack.push(new Call(globalScope));

        code = 'var namespaceScope = tools.createNamespaceScope(namespace), namespaceResult, scope = globalScope, currentClass = null;' + code;

        // Program returns null rather than undefined if nothing is returned
        code += 'return tools.valueFactory.createNull();';

        code = 'exports.result = (function () {' + code + '}());';

        resumable.execute(code, {
            expose: {
                exports: exports,
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                tools: tools,
                callStack: callStack,
                globalScope: globalScope,
                namespace: globalNamespace
            }
        }).done(function () {
            promise.resolve(exports.result.getNative(), exports.result.getType());
        }).fail(function (exception) {
            if (exception instanceof ObjectValue) {
                // Uncaught PHP Exceptions become E_FATAL errors
                (function (value) {
                    var exception = value.getNative();

                    if (!exception instanceof PHPException) {
                        throw new Exception('Weird value class thrown: ' + value.getClassName());
                    }

                    exception = new PHPFatalError(PHPFatalError.UNCAUGHT_EXCEPTION, {name: value.getClassName()});

                    if (context.mainProgram) {
                        stderr.write(exception.message);
                    }

                    promise.reject(exception);
                }(exception));

                return promise;
            }

            if (exception instanceof PHPError) {
                if (context.mainProgram) {
                    stderr.write(exception.message);
                }

                return promise.reject(exception);
            }

            throw exception;
        });

        return promise;
    }
function hoistDeclarations(statements) {
        var declarations = [],
            nonDeclarations = [];

        util.each(statements, function (statement) {
            if (/^N_(CLASS|FUNCTION)_STATEMENT$/.test(statement.name)) {
                declarations.push(statement);
            } else {
                nonDeclarations.push(statement);
            }
        });

        return declarations.concat(nonDeclarations);
    }
function interpretFunction(argNodes, bindingNodes, statementNode, interpret) {
        var args = [],
            argumentAssignments = '',
            bindingAssignments = '',
            body = interpret(statementNode);

        util.each(bindingNodes, function (bindingNode) {
            var methodSuffix = bindingNode.reference ? 'Reference' : 'Value',
                variableName = bindingNode.variable;

            bindingAssignments += 'scope.getVariable("' + variableName + '").set' + methodSuffix + '(parentScope.getVariable("' + variableName + '").get' + methodSuffix + '());';
        });

        // Copy passed values for any arguments
        util.each(argNodes, function (argNode, index) {
            var valueCode = '$',
                variable;

            if (argNode.name === 'N_ARGUMENT') {
                variable = argNode.variable.variable;
                valueCode += variable;

                if (argNode.value) {
                    valueCode += ' || ' + interpret(argNode.value);
                }
            } else {
                variable = argNode.variable;
                valueCode += variable;

                if (!argNode.reference) {
                    valueCode += '.getValue()';
                }
            }

            if (argNode.reference) {
                argumentAssignments += 'scope.getVariable("' + variable + '").setReference(' + valueCode + '.getReference());';
            } else {
                argumentAssignments += 'scope.getVariable("' + variable + '").setValue(' + valueCode + ');';
            }

            args[index] = '$' + variable;
        });

        // Prepend parts in correct order
        body = argumentAssignments + bindingAssignments + body;

        // Add scope handling logic
        body = 'var scope = tools.pushCall(this, currentClass).getScope(); try { ' + body + ' } finally { tools.popCall(); }';

        // Build function expression
        body = 'function (' + args.join(', ') + ') {' + body + '}';

        if (bindingNodes && bindingNodes.length > 0) {
            body = '(function (parentScope) { return ' + body + '; }(scope))';
        }

        return body;
    }
function processBlock(statements, interpret, context) {
        var code = '',
            labelRepository = context.labelRepository,
            statementDatas = [];

        util.each(statements, function (statement) {
            var labels = {},
                gotos = {},
                statementCode;

            function onPendingLabel(label) {
                gotos[label] = true;
            }

            function onFoundLabel(label) {
                labels[label] = true;
            }

            labelRepository.on('pending label', onPendingLabel);
            labelRepository.on('found label', onFoundLabel);

            statementCode = interpret(statement, context);
            labelRepository.off('pending label', onPendingLabel);
            labelRepository.off('found label', onFoundLabel);

            statementDatas.push({
                code: statementCode,
                gotos: gotos,
                labels: labels,
                prefix: '',
                suffix: ''
            });
        });

        util.each(statementDatas, function (statementData, index) {
            if (index > 0) {
                util.each(Object.keys(statementData.labels), function (label) {
                    statementDatas[0].prefix = 'if (!' + 'goingToLabel_' + label + ') {' + statementDatas[0].prefix;
                    statementData.prefix = '}' + statementData.prefix;
                });
            }
        });

        util.each(statementDatas, function (statementData, statementIndex) {
            util.each(Object.keys(statementData.gotos), function (label) {
                if (!hasOwn.call(statementData.labels, label)) {
                    // This is a goto to a label in another statement: find the statement containing the label
                    util.each(statementDatas, function (otherStatementData, otherStatementIndex) {
                        if (otherStatementData !== statementData) {
                            if (hasOwn.call(otherStatementData.labels, label)) {
                                // We have found the label we are trying to jump to
                                if (otherStatementIndex > statementIndex) {
                                    // The label is after the goto (forward jump)
                                    statementData.prefix = label + ': {' + statementData.prefix;
                                    otherStatementData.prefix = '}' + otherStatementData.prefix;
                                } else {
                                    // The goto is after the label (backward jump)
                                    otherStatementData.prefix += 'continue_' + label + ': do {';
                                    statementData.suffix += '} while (goingToLabel_' + label + ');';
                                }
                            }
                        }
                    });
                }
            });
        });

        util.each(statementDatas, function (statementData) {
            code += statementData.prefix + statementData.code + statementData.suffix;
        });

        return code;
    }
module.exports = {
        Environment: PHPEnvironment,
        State: PHPState,
        nodes: {
            'N_ARRAY_CAST': function (node, interpret) {
                return interpret(node.value, {getValue: true}) + '.coerceToArray()';
            },
            'N_ARRAY_INDEX': function (node, interpret, context) {
                var arrayVariableCode,
                    indexValues = [],
                    suffix = '';

                if (node.indices !== true) {
                    util.each(node.indices, function (index) {
                        indexValues.push(interpret(index.index, {assignment: false, getValue: true}));
                    });
                }

                if (context.assignment) {
                    arrayVariableCode = 'tools.implyArray(' + interpret(node.array, {getValue: false}) + ')';
                } else {
                    suffix = '.getValue()';
                    arrayVariableCode = interpret(node.array, {getValue: true});
                }

                if (indexValues.length > 0) {
                    return arrayVariableCode + '.getElementByKey(' + indexValues.join(').getValue().getElementByKey(') + ')' + suffix;
                }

                return arrayVariableCode + '.getElementByKey(tools.valueFactory.createInteger(' + arrayVariableCode + '.getLength()))' + suffix;
            },
            'N_ARRAY_LITERAL': function (node, interpret) {
                var elementValues = [];

                util.each(node.elements, function (element) {
                    elementValues.push(interpret(element));
                });

                return 'tools.valueFactory.createArray([' + elementValues.join(', ') + '])';
            },
            'N_BOOLEAN': function (node) {
                return 'tools.valueFactory.createBoolean(' + node.bool + ')';
            },
            'N_BREAK_STATEMENT': function (node, interpret, context) {
                return 'break switch_' + (context.switchCase.depth - (node.levels.number - 1)) + ';';
            },
            'N_CASE': function (node, interpret, context) {
                var body = '';

                util.each(node.body, function (statement) {
                    body += interpret(statement);
                });

                return 'if (switchMatched_' + context.switchCase.depth + ' || switchExpression_' + context.switchCase.depth + '.isEqualTo(' + interpret(node.expression) + ').getNative()) {switchMatched_' + context.switchCase.depth + ' = true; ' + body + '}';
            },
            'N_CLASS_CONSTANT': function (node, interpret) {
                return interpret(node.className, {getValue: true, allowBareword: true}) + '.getConstantByName(' + JSON.stringify(node.constant) + ', namespaceScope)';
            },
            'N_CLASS_STATEMENT': function (node, interpret) {
                var code,
                    constantCodes = [],
                    methodCodes = [],
                    propertyCodes = [],
                    staticPropertyCodes = [],
                    superClass = node.extend ? 'namespaceScope.getClass(' + JSON.stringify(node.extend) + ')' : 'null',
                    interfaces = JSON.stringify(node.implement || []);

                util.each(node.members, function (member) {
                    var data = interpret(member, {inClass: true});

                    if (member.name === 'N_INSTANCE_PROPERTY_DEFINITION') {
                        propertyCodes.push('"' + data.name + '": ' + data.value);
                    } else if (member.name === 'N_STATIC_PROPERTY_DEFINITION') {
                        staticPropertyCodes.push('"' + data.name + '": {visibility: ' + data.visibility + ', value: ' + data.value + '}');
                    } else if (member.name === 'N_METHOD_DEFINITION' || member.name === 'N_STATIC_METHOD_DEFINITION') {
                        methodCodes.push('"' + data.name + '": ' + data.body);
                    } else if (member.name === 'N_CONSTANT_DEFINITION') {
                        constantCodes.push('"' + data.name + '": ' + data.value);
                    }
                });

                code = '{superClass: ' + superClass + ', interfaces: ' + interfaces + ', staticProperties: {' + staticPropertyCodes.join(', ') + '}, properties: {' + propertyCodes.join(', ') + '}, methods: {' + methodCodes.join(', ') + '}, constants: {' + constantCodes.join(', ') + '}}';

                return '(function () {var currentClass = namespace.defineClass(' + JSON.stringify(node.className) + ', ' + code + ', namespaceScope);}());';
            },
            'N_CLOSURE': function (node, interpret) {
                var func = interpretFunction(node.args, node.bindings, node.body, interpret);

                return 'tools.createClosure(' + func + ', scope)';
            },
            'N_COMMA_EXPRESSION': function (node, interpret) {
                var expressionCodes = [];

                util.each(node.expressions, function (expression) {
                    expressionCodes.push(interpret(expression));
                });

                return expressionCodes.join(',');
            },
            'N_COMPOUND_STATEMENT': function (node, interpret, context) {
                return processBlock(node.statements, interpret, context);
            },
            'N_CONSTANT_DEFINITION': function (node, interpret) {
                return {
                    name: node.constant,
                    value: 'function () { return ' + (node.value ? interpret(node.value) : 'null') + '; }'
                };
            },
            'N_CONTINUE_STATEMENT': function (node, interpret, context) {
                return 'break switch_' + (context.switchCase.depth - (node.levels.number - 1)) + ';';
            },
            'N_DEFAULT_CASE': function (node, interpret, context) {
                var body = '';

                util.each(node.body, function (statement) {
                    body += interpret(statement);
                });

                return 'if (!switchMatched_' + context.switchCase.depth + ') {switchMatched_' + context.switchCase.depth + ' = true; ' + body + '}';
            },
            'N_DO_WHILE_STATEMENT': function (node, interpret/*, context*/) {
                var code = interpret(node.body);

                return 'do {' + code + '} while (' + interpret(node.condition) + '.coerceToBoolean().getNative());';
            },
            'N_ECHO_STATEMENT': function (node, interpret) {
                return 'stdout.write(' + interpret(node.expression) + '.coerceToString().getNative());';
            },
            'N_EXPRESSION': function (node, interpret) {
                var isAssignment = node.right[0].operator === '=',
                    expressionEnd = '',
                    expressionStart = interpret(node.left, {assignment: isAssignment, getValue: !isAssignment});

                util.each(node.right, function (operation, index) {
                    var getValueIfApplicable,
                        isReference = false,
                        method,
                        rightOperand,
                        valuePostProcess = '';

                    if (isAssignment && operation.operand.reference) {
                        isReference = true;
                        valuePostProcess = '.getReference()';
                    }

                    getValueIfApplicable = (!isAssignment || index === node.right.length - 1) && !isReference;

                    rightOperand = interpret(operation.operand, {getValue: getValueIfApplicable});

                    if (operation.operator === '&&') {
                        expressionStart = 'tools.valueFactory.createBoolean(' +
                            expressionStart +
                            '.coerceToBoolean().getNative() && (' +
                            rightOperand +
                            valuePostProcess +
                            '.coerceToBoolean().getNative()';
                        expressionEnd += '))';
                    } else {
                        method = binaryOperatorToMethod[operation.operator];

                        if (!method) {
                            throw new Exception('Unsupported binary operator "' + operation.operator + '"');
                        }

                        if (util.isPlainObject(method)) {
                            method = method[isReference];
                        }

                        expressionStart += '.' + method + '(' + rightOperand + valuePostProcess;
                        expressionEnd += ')';
                    }
                });

                return expressionStart + expressionEnd;
            },
            'N_EXPRESSION_STATEMENT': function (node, interpret) {
                return interpret(node.expression) + ';';
            },
            'N_FLOAT': function (node) {
                return 'tools.valueFactory.createFloat(' + node.number + ')';
            },
            'N_FOR_STATEMENT': function (node, interpret) {
                var bodyCode = interpret(node.body),
                    conditionCode = interpret(node.condition),
                    initializerCode = interpret(node.initializer),
                    updateCode = interpret(node.update);

                if (conditionCode) {
                    conditionCode += '.coerceToBoolean().getNative()';
                }

                return 'for (' + initializerCode + ';' + conditionCode + ';' + updateCode + ') {' + bodyCode + '}';
            },
            'N_FOREACH_STATEMENT': function (node, interpret, context) {
                var arrayValue = interpret(node.array),
                    arrayVariable,
                    code = '',
                    key = node.key ? interpret(node.key, {getValue: false}) : null,
                    lengthVariable,
                    pointerVariable,
                    value = interpret(node.value, {getValue: false});

                if (!context.foreach) {
                    context.foreach = {
                        depth: 0
                    };
                } else {
                    context.foreach.depth++;
                }

                arrayVariable = 'array_' + context.foreach.depth;

                // Cache the value being iterated over and reset the internal array pointer before the loop
                code += 'var ' + arrayVariable + ' = ' + arrayValue + '.reset();';

                lengthVariable = 'length_' + context.foreach.depth;
                code += 'var ' + lengthVariable + ' = ' + arrayVariable + '.getLength();';
                pointerVariable = 'pointer_' + context.foreach.depth;
                code += 'var ' + pointerVariable + ' = 0;';

                // Loop management
                code += 'while (' + pointerVariable + ' < ' + lengthVariable + ') {';

                if (key) {
                    // Iterator key variable (if specified)
                    code += key + '.setValue(' + arrayVariable + '.getKeyByIndex(' + pointerVariable + '));';
                }

                // Iterator value variable
                code += value + '.set' + (node.value.reference ? 'Reference' : 'Value') + '(' + arrayVariable + '.getElementByIndex(' + pointerVariable + ')' + (node.value.reference ? '' : '.getValue()') + ');';

                // Set pointer to next element at start of loop body as per spec
                code += pointerVariable + '++;';

                code += interpret(node.body);

                code += '}';

                return code;
            },
            'N_FUNCTION_STATEMENT': function (node, interpret, context) {
                var func;

                context.labelRepository = new LabelRepository();

                func = interpretFunction(node.args, null, node.body, interpret);

                return 'namespace.defineFunction(' + JSON.stringify(node.func) + ', ' + func + ');';
            },
            'N_FUNCTION_CALL': function (node, interpret) {
                var args = [];

                util.each(node.args, function (arg) {
                    args.push(interpret(arg, {getValue: false}));
                });

                return '(' + interpret(node.func, {getValue: true, allowBareword: true}) + '.call([' + args.join(', ') + '], namespaceScope) || tools.valueFactory.createNull())';
            },
            'N_GOTO_STATEMENT': function (node, interpret, context) {
                var code = '',
                    label = node.label;

                context.labelRepository.addPending(label);

                code += 'goingToLabel_' + label + ' = true;';

                if (context.labelRepository.hasBeenFound(label)) {
                    code += ' continue continue_' + label + ';';
                } else {
                    code += ' break ' + label + ';';
                }

                return code;
            },
            'N_IF_STATEMENT': function (node, interpret, context) {
                // Consequent statements are executed if the condition is truthy,
                // Alternate statements are executed if the condition is falsy
                var alternateCode,
                    code = '',
                    conditionCode = interpret(node.condition) + '.coerceToBoolean().getNative()',
                    consequentCode,
                    consequentPrefix = '',
                    gotosJumpingIn = {},
                    labelRepository = context.labelRepository;

                function onPendingLabel(label) {
                    delete gotosJumpingIn[label];
                }

                function onFoundLabel(label) {
                    gotosJumpingIn[label] = true;
                }

                labelRepository.on('pending label', onPendingLabel);
                labelRepository.on('found label', onFoundLabel);

                consequentCode = interpret(node.consequentStatement);
                labelRepository.off('pending label', onPendingLabel);
                labelRepository.off('found label', onFoundLabel);

                util.each(Object.keys(gotosJumpingIn), function (label) {
                    conditionCode = 'goingToLabel_' + label + ' || (' + conditionCode + ')';
                });

                consequentCode = '{' + consequentPrefix + consequentCode + '}';

                alternateCode = node.alternateStatement ? ' else ' + interpret(node.alternateStatement) : '';

                code += 'if (' + conditionCode + ') ' + consequentCode + alternateCode;

                return code;
            },
            'N_INCLUDE_EXPRESSION': function (node, interpret) {
                return 'tools.include(' + interpret(node.path) + '.getNative())';
            },
            'N_INLINE_HTML_STATEMENT': function (node) {
                return 'stdout.write(' + JSON.stringify(node.html) + ');';
            },
            'N_INSTANCE_PROPERTY_DEFINITION': function (node, interpret) {
                return {
                    name: node.variable.variable,
                    value: node.value ? interpret(node.value) : 'null'
                };
            },
            'N_INTEGER': function (node) {
                return 'tools.valueFactory.createInteger(' + node.number + ')';
            },
            'N_INTERFACE_METHOD_DEFINITION': function (node, interpret) {
                return {
                    name: interpret(node.func),
                    body: '{isStatic: false, abstract: true}'
                };
            },
            'N_INTERFACE_STATEMENT': function (node, interpret) {
                var code,
                    constantCodes = [],
                    methodCodes = [],
                    superClass = node.extend ? 'namespaceScope.getClass(' + JSON.stringify(node.extend) + ')' : 'null';

                util.each(node.members, function (member) {
                    var data = interpret(member, {inClass: true});

                    if (member.name === 'N_INSTANCE_PROPERTY_DEFINITION' || member.name === 'N_STATIC_PROPERTY_DEFINITION') {
                        throw new PHPFatalError(PHPFatalError.INTERFACE_PROPERTY_NOT_ALLOWED);
                    } else if (member.name === 'N_METHOD_DEFINITION' || member.name === 'N_STATIC_METHOD_DEFINITION') {
                        throw new PHPFatalError(PHPFatalError.INTERFACE_METHOD_BODY_NOT_ALLOWED, {
                            className: node.interfaceName,
                            methodName: member.func || member.method
                        });
                    } else if (member.name === 'N_INTERFACE_METHOD_DEFINITION' || member.name === 'N_STATIC_INTERFACE_METHOD_DEFINITION') {
                        methodCodes.push('"' + data.name + '": ' + data.body);
                    } else if (member.name === 'N_CONSTANT_DEFINITION') {
                        constantCodes.push('"' + data.name + '": ' + data.value);
                    }
                });

                code = '{superClass: ' + superClass + ', staticProperties: {}, properties: {}, methods: {' + methodCodes.join(', ') + '}, constants: {' + constantCodes.join(', ') + '}}';

                return '(function () {var currentClass = namespace.defineClass(' + JSON.stringify(node.interfaceName) + ', ' + code + ', namespaceScope);}());';
            },
            'N_INTERFACE_STATIC_METHOD_DEFINITION': function (node, interpret) {
                return {
                    name: interpret(node.func),
                    body: '{isStatic: false, abstract: true}'
                };
            },
            'N_ISSET': function (node, interpret) {
                var issets = [];

                util.each(node.variables, function (variable) {
                    issets.push(interpret(variable, {getValue: false}) + '.isSet()');
                });

                return '(function (scope) {scope.suppressErrors();' +
                    'var result = tools.valueFactory.createBoolean(' + issets.join(' && ') + ');' +
                    'scope.unsuppressErrors(); return result;}(scope))';
            },
            'N_KEY_VALUE_PAIR': function (node, interpret) {
                return 'tools.createKeyValuePair(' + interpret(node.key) + ', ' + interpret(node.value) + ')';
            },
            'N_LABEL_STATEMENT': function (node, interpret, context) {
                var label = node.label;

                context.labelRepository.found(label);

                return '';
            },
            'N_LIST': function (node, interpret) {
                var elementsCodes = [];

                util.each(node.elements, function (element) {
                    elementsCodes.push(interpret(element, {getValue: false}));
                });

                return 'tools.createList([' + elementsCodes.join(',') + '])';
            },
            'N_MAGIC_DIR_CONSTANT': function () {
                return 'tools.getPathDirectory()';
            },
            'N_MAGIC_FILE_CONSTANT': function () {
                return 'tools.getPath()';
            },
            'N_MAGIC_LINE_CONSTANT': function (node) {
                return 'tools.valueFactory.createInteger(' + node.offset.line + ')';
            },
            'N_METHOD_CALL': function (node, interpret) {
                var code = '';

                util.each(node.calls, function (call) {
                    var args = [];

                    util.each(call.args, function (arg) {
                        args.push(interpret(arg));
                    });

                    code += '.callMethod(' + interpret(call.func, {allowBareword: true}) + '.getNative(), [' + args.join(', ') + '])';
                });

                return interpret(node.object, {getValue: true}) + code;
            },
            'N_METHOD_DEFINITION': function (node, interpret) {
                return {
                    name: interpret(node.func),
                    body: '{isStatic: false, method: ' + interpretFunction(node.args, null, node.body, interpret) + '}'
                };
            },
            'N_NAMESPACE_STATEMENT': function (node, interpret) {
                var body = '';

                util.each(hoistDeclarations(node.statements), function (statement) {
                    body += interpret(statement);
                });

                return 'if (namespaceResult = (function (globalNamespace) {var namespace = globalNamespace.getDescendant(' + JSON.stringify(node.namespace) + '), namespaceScope = tools.createNamespaceScope(namespace);' + body + '}(namespace))) { return namespaceResult; }';
            },
            'N_NEW_EXPRESSION': function (node, interpret) {
                var args = [];

                util.each(node.args, function (arg) {
                    args.push(interpret(arg));
                });

                return 'tools.createInstance(namespaceScope, ' + interpret(node.className, {allowBareword: true}) + ', [' + args.join(', ') + '])';
            },
            'N_NULL': function () {
                return 'tools.valueFactory.createNull()';
            },
            'N_OBJECT_PROPERTY': function (node, interpret, context) {
                var objectVariableCode,
                    propertyCode = '',
                    suffix = '';

                if (context.assignment) {
                    objectVariableCode = 'tools.implyObject(' + interpret(node.object, {getValue: false}) + ')';
                } else {
                    suffix = '.getValue()';
                    objectVariableCode = interpret(node.object, {getValue: true});
                }

                util.each(node.properties, function (property, index) {
                    var nameValue = interpret(property.property, {assignment: false, getValue: false, allowBareword: true});

                    propertyCode += '.getInstancePropertyByName(' + nameValue + ')';

                    if (index < node.properties.length - 1) {
                        propertyCode += '.getValue()';
                    }
                });

                return objectVariableCode + propertyCode + suffix;
            },
            'N_PRINT_EXPRESSION': function (node, interpret) {
                return '(stdout.write(' + interpret(node.operand, {getValue: true}) + '.coerceToString().getNative()), tools.valueFactory.createInteger(1))';
            },
            'N_PROGRAM': function (node, interpret, state, stdin, stdout, stderr) {
                var body = '',
                    context = {
                        labelRepository: new LabelRepository(),
                        mainProgram: state.isMainProgram(),
                        path: state.getPath()
                    },
                    labels;

                try {
                    body += processBlock(hoistDeclarations(node.statements), interpret, context);
                } catch (exception) {
                    if (exception instanceof PHPError) {
                        stderr.write(exception.message);

                        return new Promise().reject(exception);
                    }
                }

                labels = context.labelRepository.getLabels();

                if (labels.length > 0) {
                    body = 'var goingToLabel_' + labels.join(' = false, goingToLabel_') + ' = false;' + body;
                }

                return evaluateModule(state, body, context, stdin, stdout, stderr);
            },
            'N_REQUIRE_EXPRESSION': function (node, interpret) {
                return 'tools.require(' + interpret(node.path) + '.getNative())';
            },
            'N_REQUIRE_ONCE_EXPRESSION': function (node, interpret) {
                return 'tools.requireOnce(' + interpret(node.path) + '.getNative())';
            },
            'N_RETURN_STATEMENT': function (node, interpret) {
                var expression = interpret(node.expression);

                return 'return ' + (expression ? expression : 'tools.valueFactory.createNull()') + ';';
            },
            'N_SELF': function (node, interpret, context) {
                if (context.inClass) {
                    return 'tools.valueFactory.createString(currentClass.getUnprefixedName())';
                }

                return 'tools.throwNoActiveClassScope()';
            },
            'N_STATIC_METHOD_CALL': function (node, interpret) {
                var args = [];

                util.each(node.args, function (arg) {
                    args.push(interpret(arg));
                });

                return interpret(node.className, {allowBareword: true}) + '.callStaticMethod(' + interpret(node.method, {allowBareword: true}) + ', [' + args.join(', ') + '], namespaceScope)';
            },
            'N_STATIC_METHOD_DEFINITION': function (node, interpret) {
                return {
                    name: interpret(node.method),
                    body: '{isStatic: true, method: ' + interpretFunction(node.args, null, node.body, interpret) + '}'
                };
            },
            'N_STATIC_PROPERTY': function (node, interpret, context) {
                var classVariableCode = interpret(node.className, {getValue: true, allowBareword: true}),
                    propertyCode = '.getStaticPropertyByName(' + interpret(node.property, {assignment: false, getValue: true, allowBareword: true}) + ', namespaceScope)',
                    suffix = '';

                if (!context.assignment) {
                    suffix = '.getValue()';
                }

                return classVariableCode + propertyCode + suffix;
            },
            'N_STATIC_PROPERTY_DEFINITION': function (node, interpret) {
                return {
                    name: node.variable.variable,
                    visibility: JSON.stringify(node.visibility),
                    value: node.value ? interpret(node.value) : 'tools.valueFactory.createNull()'
                };
            },
            'N_STRING': function (node, interpret, context) {
                if (context.allowBareword) {
                    return 'tools.valueFactory.createBarewordString(' + JSON.stringify(node.string) + ')';
                }

                return 'namespaceScope.getConstant(' + JSON.stringify(node.string) + ')';
            },
            'N_STRING_EXPRESSION': function (node, interpret) {
                var codes = [];

                util.each(node.parts, function (part) {
                    codes.push(interpret(part) + '.coerceToString().getNative()');
                });

                return 'tools.valueFactory.createString(' + codes.join(' + ') + ')';
            },
            'N_STRING_LITERAL': function (node) {
                return 'tools.valueFactory.createString(' + JSON.stringify(node.string) + ')';
            },
            'N_SWITCH_STATEMENT': function (node, interpret, context) {
                var code = '',
                    expressionCode = interpret(node.expression),
                    switchCase = {
                        depth: context.switchCase ? context.switchCase.depth + 1 : 0
                    },
                    subContext = {
                        switchCase: switchCase
                    };

                code += 'var switchExpression_' + switchCase.depth + ' = ' + expressionCode + ',' +
                    ' switchMatched_' + switchCase.depth + ' = false;';

                util.each(node.cases, function (caseNode) {
                    code += interpret(caseNode, subContext);
                });

                return 'switch_' + switchCase.depth + ': {' + code + '}';
            },
            'N_TERNARY': function (node, interpret) {
                var expression = '(' + interpret(node.condition) + ')';

                util.each(node.options, function (option) {
                    expression = '(' + expression + '.coerceToBoolean().getNative() ? ' + interpret(option.consequent) + ' : ' + interpret(option.alternate) + ')';
                });

                return expression;
            },
            'N_THROW_STATEMENT': function (node, interpret) {
                return 'throw ' + interpret(node.expression) + ';';
            },
            'N_UNARY_EXPRESSION': function (node, interpret) {
                var operator = node.operator,
                    operand = interpret(node.operand, {getValue: operator !== '++' && operator !== '--'});

                return operand + '.' + unaryOperatorToMethod[node.prefix ? 'prefix' : 'suffix'][operator] + '()';
            },
            'N_USE_STATEMENT': function (node) {
                var code = '';

                util.each(node.uses, function (use) {
                    if (use.alias) {
                        code += 'namespaceScope.use(' + JSON.stringify(use.source) + ', ' + JSON.stringify(use.alias) + ');';
                    } else {
                        code += 'namespaceScope.use(' + JSON.stringify(use.source) + ');';
                    }
                });

                return code;
            },
            'N_VARIABLE': function (node, interpret, context) {
                return 'scope.getVariable("' + node.variable + '")' + (context.getValue !== false ? '.getValue()' : '');
            },
            'N_VARIABLE_EXPRESSION': function (node, interpret, context) {
                return 'scope.getVariable(' + interpret(node.expression) + '.getNative())' + (context.getValue !== false ? '.getValue()' : '');
            },
            'N_VOID': function () {
                return 'tools.referenceFactory.createNull()';
            },
            'N_WHILE_STATEMENT': function (node, interpret, context) {
                var code = '';

                context.labelRepository.on('found label', function () {
                    throw new PHPFatalError(PHPFatalError.GOTO_DISALLOWED);
                });

                util.each(node.statements, function (statement) {
                    code += interpret(statement);
                });

                return 'while (' + interpret(node.condition) + '.coerceToBoolean().getNative()) {' + code + '}';
            }
        }
    };}());

},{"./../../js/Exception/Exception":4,"./../../js/Promise":9,"./../../js/util":51,"./interpreter/Call":56,"./interpreter/Environment":60,"./interpreter/Error":61,"./interpreter/Error/Fatal":62,"./interpreter/KeyValuePair":64,"./interpreter/LabelRepository":65,"./interpreter/List":66,"./interpreter/NamespaceScope":68,"./interpreter/Scope":75,"./interpreter/State":76,"./interpreter/Value/Object":84}],56:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util');
function Call(scope) {
        this.scope = scope;
    }
util.extend(Call.prototype, {
        getScope: function () {
            return this.scope;
        }
    });
module.exports = Call;}());

},{"./../../../js/util":51}],57:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), PHPError = require('./Error');
function CallStack(stderr) {
        this.calls = [];
        this.stderr = stderr;
    }
util.extend(CallStack.prototype, {
        getCurrent: function () {
            var chain = this;

            return chain.calls[chain.calls.length - 1];
        },

        pop: function () {
            this.calls.pop();
        },

        push: function (call) {
            this.calls.push(call);
        },

        raiseError: function (level, message) {
            var call,
                chain = this,
                calls = chain.calls,
                error,
                index = 0;

            for (index = calls.length - 1; index >= 0; --index) {
                call = calls[index];

                if (call.getScope().suppressesErrors()) {
                    return;
                }
            }

            error = new PHPError(level, message);

            chain.stderr.write(error.getMessage() + '\n');
        }
    });
module.exports = CallStack;}());

},{"./../../../js/util":51,"./Error":61}],58:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), PHPError = require('./Error'), PHPFatalError = require('./Error/Fatal'), StaticPropertyReference = require('./Reference/StaticProperty');
var IS_STATIC = 'isStatic',
        VALUE = 'value',
        VISIBILITY = 'visibility',
        hasOwn = {}.hasOwnProperty;
function Class(valueFactory, callStack, name, constructorName, InternalClass, staticPropertiesData, constants, superClass, interfaceNames, namespaceScope) {
        var classObject = this,
            staticProperties = {};

        this.callStack = callStack;
        this.constants = constants;
        this.constructorName = constructorName;
        this.interfaceNames = interfaceNames || [];
        this.InternalClass = InternalClass;
        this.name = name;
        this.namespaceScope = namespaceScope;
        this.staticProperties = staticProperties;
        this.superClass = superClass;
        this.valueFactory = valueFactory;

        util.each(staticPropertiesData, function (data, name) {
            staticProperties[name] = new StaticPropertyReference(classObject, name, data[VISIBILITY], data[VALUE]);
        });
    }
util.extend(Class.prototype, {
        callStaticMethod: function (name, args) {
            var classObject = this,
                defined = true,
                method,
                prototype = classObject.InternalClass.prototype,
                otherPrototype;

            // Allow methods inherited via the prototype chain up to but not including Object.prototype
            if (!hasOwn.call(prototype, name)) {
                otherPrototype = prototype;

                do {
                    otherPrototype = Object.getPrototypeOf(otherPrototype);
                    if (!otherPrototype || otherPrototype === Object.prototype) {
                        defined = false;
                        break;
                    }
                } while (!hasOwn.call(otherPrototype, name));
            }

            method = prototype[name];

            if (!defined || !util.isFunction(method)) {
                throw new PHPFatalError(PHPFatalError.CALL_TO_UNDEFINED_METHOD, {
                    className: classObject.name,
                    methodName: name
                });
            }

            if (!method[IS_STATIC]) {
                classObject.callStack.raiseError(PHPError.E_STRICT, 'Non-static method ' + method.data.classObject.name + '::' + name + '() should not be called statically');
            }

            return classObject.valueFactory.coerce(method.apply(null, args));
        },

        extends: function (superClass) {
            var classObject = this;

            return classObject.superClass && (classObject.superClass.name === superClass.name || classObject.superClass.extends(superClass));
        },

        getConstantByName: function (name) {
            var classObject = this,
                i,
                interfaceObject;

            if (hasOwn.call(classObject.constants, name)) {
                return classObject.constants[name]();
            }

            if (classObject.superClass) {
                return classObject.superClass.getConstantByName(name);
            }

            for (i = 0; i < classObject.interfaceNames.length; i++) {
                interfaceObject = classObject.namespaceScope.getClass(classObject.interfaceNames[i]);

                try {
                    return interfaceObject.getConstantByName(name);
                } catch (e) {}
            }

            throw new PHPFatalError(PHPFatalError.UNDEFINED_CLASS_CONSTANT, {
                name: name
            });
        },

        getInternalClass: function () {
            return this.InternalClass;
        },

        getName: function () {
            return this.name;
        },

        getUnprefixedName: function () {
            return this.name.replace(/^.*\\/, '');
        },

        getStaticPropertyByName: function (name) {
            var classObject = this,
                currentClass,
                staticProperty;

            if (!hasOwn.call(classObject.staticProperties, name)) {
                throw new PHPFatalError(PHPFatalError.UNDECLARED_STATIC_PROPERTY, {
                    className: classObject.name,
                    propertyName: name
                });
            }

            staticProperty = classObject.staticProperties[name];

            // Property is private; may only be read from methods of this class and not derivatives
            if (staticProperty.getVisibility() === 'private') {
                currentClass = classObject.callStack.getCurrent().getScope().getCurrentClass();

                if (!currentClass || currentClass.name !== classObject.name) {
                    throw new PHPFatalError(PHPFatalError.CANNOT_ACCESS_PROPERTY, {
                        className: classObject.name,
                        propertyName: name,
                        visibility: 'private'
                    });
                }
            // Property is protected; may be read from methods of this class and methods of derivatives
            } else if (staticProperty.getVisibility() === 'protected') {
                currentClass = classObject.callStack.getCurrent().getScope().getCurrentClass();

                if (!currentClass || (classObject.name !== currentClass.name && !currentClass.extends(classObject))) {
                    throw new PHPFatalError(PHPFatalError.CANNOT_ACCESS_PROPERTY, {
                        className: classObject.name,
                        propertyName: name,
                        visibility: 'protected'
                    });
                }
            }

            return staticProperty;
        },

        hasStaticPropertyByName: function (name) {
            return hasOwn.call(this.staticProperties, name);
        },

        instantiate: function (args) {
            var classObject = this,
                nativeObject = new classObject.InternalClass(),
                objectValue = classObject.valueFactory.createObject(nativeObject, classObject);

            if (classObject.constructorName) {
                objectValue.callMethod(classObject.constructorName, args);
            }

            return objectValue;
        }
    });
module.exports = Class;}());

},{"./../../../js/util":51,"./Error":61,"./Error/Fatal":62,"./Reference/StaticProperty":72}],59:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util');
var MAGIC_AUTOLOAD_FUNCTION = '__autoload';
function ClassAutoloader(valueFactory) {
        this.globalNamespace = null;
        this.splStack = null;
        this.valueFactory = valueFactory;
    }
util.extend(ClassAutoloader.prototype, {
        appendAutoloadCallable: function (autoloadCallable) {
            var autoloader = this,
                splStack = autoloader.splStack;

            if (!splStack) {
                splStack = [];
                autoloader.splStack = splStack;
            }

            splStack.push(autoloadCallable);
        },

        autoloadClass: function (name) {
            var autoloader = this,
                globalNamespace = autoloader.globalNamespace,
                magicAutoloadFunction,
                splStack = autoloader.splStack;

            if (splStack) {
                util.each(splStack, function (autoloadCallable) {
                    autoloadCallable.call([autoloader.valueFactory.createString(name)], globalNamespace);
                });
            } else {
                magicAutoloadFunction = globalNamespace.getOwnFunction(MAGIC_AUTOLOAD_FUNCTION);

                if (magicAutoloadFunction) {
                    magicAutoloadFunction(autoloader.valueFactory.createString(name));
                }
            }
        },

        setGlobalNamespace: function (globalNamespace) {
            this.globalNamespace = globalNamespace;
        }
    });
module.exports = ClassAutoloader;}());

},{"./../../../js/util":51}],60:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util');
function PHPEnvironment(state) {
        this.state = state;
    }
util.extend(PHPEnvironment.prototype, {
        getGlobalScope: function () {
            return this.state.getGlobalScope();
        }
    });
module.exports = PHPEnvironment;}());

},{"./../../../js/util":51}],61:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), Exception = require('./../../../js/Exception/Exception');
function PHPError(level, message) {
        Exception.call(this, 'PHP ' + level + ': ' + message);
    }
util.inherit(PHPError).from(Exception);
util.extend(PHPError, {
        E_ERROR: 'Error',
        E_FATAL: 'Fatal error',
        E_NOTICE: 'Notice',
        E_PARSE: 'Parse error',
        E_STRICT: 'Strict standards',
        E_WARNING: 'Warning'
    });
module.exports = PHPError;}());

},{"./../../../js/Exception/Exception":4,"./../../../js/util":51}],62:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), PHPError = require('../Error');
var MESSAGE_PREFIXES = {
            1: 'Unsupported operand types',
            2: 'Call to undefined function ${name}()',
            3: 'Class \'${name}\' not found',
            4: 'Call to undefined method ${className}::${methodName}()',
            5: '\'goto\' into loop or switch statement is disallowed',
            6: '${name}() must take exactly 1 argument',
            7: 'Class name must be a valid object or a string',
            8: 'Access to undeclared static property: ${className}::$${propertyName}',
            9: 'Call to undefined method ${className}::${methodName}()',
            10: 'Cannot access self:: when no class scope is active',
            11: 'Undefined constant \'${name}\'',
            12: 'Uncaught exception \'${name}\'',
            13: 'Cannot access ${visibility} property ${className}::$${propertyName}',
            14: 'Function name must be a string',
            15: 'Undefined class constant \'${name}\'',
            16: 'Interfaces may not include member variables',
            17: 'Interface function ${className}::${methodName}() cannot contain body',
            18: 'Cannot use ${source} as ${alias} because the name is already in use',
            19: 'Call to a member function ${name}() on a non-object'
        };
function PHPFatalError(code, variables) {
        PHPError.call(this, PHPError.E_FATAL, util.stringTemplate(MESSAGE_PREFIXES[code], variables));
    }
util.inherit(PHPFatalError).from(PHPError);
util.extend(PHPFatalError, {
        UNSUPPORTED_OPERAND_TYPES: 1,
        CALL_TO_UNDEFINED_FUNCTION: 2,
        CLASS_NOT_FOUND: 3,
        UNDEFINED_METHOD: 4,
        GOTO_DISALLOWED: 5,
        EXPECT_EXACTLY_1_ARG: 6,
        CLASS_NAME_NOT_VALID: 7,
        UNDECLARED_STATIC_PROPERTY: 8,
        CALL_TO_UNDEFINED_METHOD: 9,
        SELF_WHEN_NO_ACTIVE_CLASS: 10,
        UNDEFINED_CONSTANT: 11,
        UNCAUGHT_EXCEPTION: 12,
        CANNOT_ACCESS_PROPERTY: 13,
        FUNCTION_NAME_MUST_BE_STRING: 14,
        UNDEFINED_CLASS_CONSTANT: 15,
        INTERFACE_PROPERTY_NOT_ALLOWED: 16,
        INTERFACE_METHOD_BODY_NOT_ALLOWED: 17,
        NAME_ALREADY_IN_USE: 18,
        NON_OBJECT_METHOD_CALL: 19
    });
module.exports = PHPFatalError;}());

},{"../Error":61,"./../../../../js/util":51}],63:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), PHPError = require('../Error');
var MESSAGE_PREFIXES = {
            1: 'syntax error, unexpected ${what} in ${file} on line ${line}'
        };
function PHPParseError(code, variables) {
        PHPError.call(this, PHPError.E_PARSE, util.stringTemplate(MESSAGE_PREFIXES[code], variables));
    }
util.inherit(PHPParseError).from(PHPError);
util.extend(PHPParseError, {
        SYNTAX_UNEXPECTED: 1
    });
module.exports = PHPParseError;}());

},{"../Error":61,"./../../../../js/util":51}],64:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util');
function KeyValuePair(key, value) {
        this.key = key;
        this.value = value;
    }
util.extend(KeyValuePair.prototype, {
        getKey: function () {
            return this.key;
        },
        getValue: function () {
            return this.value;
        }
    });
module.exports = KeyValuePair;}());

},{"./../../../js/util":51}],65:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), EventEmitter = require('./../../../js/EventEmitter');
function LabelRepository() {
        EventEmitter.call(this);

        this.foundLabels = {};
        this.labels = {};
        this.pendingLabels = {};
    }
util.inherit(LabelRepository).from(EventEmitter);
util.extend(LabelRepository.prototype, {
        addPending: function (label) {
            var repository = this;

            repository.labels[label] = true;
            repository.pendingLabels[label] = true;
            repository.emit('pending label', label);
        },

        found: function (label) {
            var repository = this;

            repository.foundLabels[label] = true;
            repository.labels[label] = true;
            delete repository.pendingLabels[label];
            repository.emit('found label', label);
        },

        getLabels: function () {
            return Object.keys(this.labels);
        },

        hasBeenFound: function (label) {
            var repository = this;

            return repository.foundLabels[label] === true;
        },

        hasPending: function () {
            return Object.keys(this.pendingLabels).length > 0;
        },

        isPending: function (label) {
            return this.pendingLabels[label] === true;
        }
    });
module.exports = LabelRepository;}());

},{"./../../../js/EventEmitter":3,"./../../../js/util":51}],66:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util');
function List(elements) {
        this.elements = elements;
    }
util.extend(List.prototype, {
        setValue: function (value) {
            var listElements = this.elements;

            if (value.getType() !== 'array') {
                throw new Error('Unsupported');
            }

            util.each(listElements, function (reference, index) {
                reference.setValue(value.getElementByIndex(index).getValue());
            });

            return value;
        }
    });
module.exports = List;}());

},{"./../../../js/util":51}],67:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), Class = require('./Class'), PHPError = require('./Error'), PHPFatalError = require('./Error/Fatal');
var IS_STATIC = 'isStatic',
        hasOwn = {}.hasOwnProperty;
function Namespace(callStack, valueFactory, classAutoloader, parent, name) {
        this.callStack = callStack;
        this.children = {};
        this.classAutoloader = classAutoloader;
        this.classes = {};
        this.constants = {};
        this.functions = {};
        this.name = name;
        this.parent = parent;
        this.valueFactory = valueFactory;
    }
util.extend(Namespace.prototype, {
        defineClass: function (name, definition, namespaceScope) {
            var classObject,
                constants,
                constructorName = null,
                methodData = {},
                namespace = this,
                staticProperties,
                InternalClass;

            if (util.isFunction(definition)) {
                InternalClass = definition;
            } else {
                InternalClass = function () {
                    var instance = this;

                    if (definition.superClass) {
                        definition.superClass.getInternalClass().call(this);
                    }

                    util.each(definition.properties, function (value, name) {
                        instance[name] = value;
                    });
                };

                // Prevent native 'constructor' property from erroneously being detected as PHP class method
                delete InternalClass.prototype.constructor;

                if (definition.superClass) {
                    InternalClass.prototype = Object.create(definition.superClass.getInternalClass().prototype);
                }

                util.each(definition.methods, function (data, methodName) {
                    // PHP5-style __construct magic method takes precedence
                    if (methodName === '__construct') {
                        if (constructorName) {
                            namespace.callStack.raiseError(PHPError.E_STRICT, 'Redefining already defined constructor for class ' + name);
                        }

                        constructorName = methodName;
                    }

                    if (!constructorName && methodName === name) {
                        constructorName = methodName;
                    }

                    data.method[IS_STATIC] = data[IS_STATIC];
                    data.method.data = methodData;

                    InternalClass.prototype[methodName] = data.method;
                });

                staticProperties = definition.staticProperties;
                constants = definition.constants;
            }

            classObject = new Class(
                namespace.valueFactory,
                namespace.callStack,
                namespace.getPrefix() + name,
                constructorName,
                InternalClass,
                staticProperties,
                constants,
                definition.superClass,
                definition.interfaces,
                namespaceScope
            );

            methodData.classObject = classObject;

            namespace.classes[name.toLowerCase()] = classObject;

            return classObject;
        },

        defineConstant: function (name, value, options) {
            var caseInsensitive;

            options = options || {};

            caseInsensitive = options.caseInsensitive;

            if (caseInsensitive) {
                name = name.toLowerCase();
            }

            this.constants[name] = {
                caseInsensitive: caseInsensitive,
                value: value
            };
        },

        defineFunction: function (name, func) {
            var namespace = this;

            if (namespace.name === '') {
                if (/__autoload/i.test(name) && func.length !== 1) {
                    throw new PHPFatalError(PHPFatalError.EXPECT_EXACTLY_1_ARG, {name: name.toLowerCase()});
                }
            }

            namespace.functions[name] = func;
        },

        getClass: function (name) {
            var lowerName = name.toLowerCase(),
                match = name.match(/^(.*?)\\([^\\]+)$/),
                namespace = this,
                path,
                subNamespace;

            if (match) {
                path = match[1];
                name = match[2];

                subNamespace = namespace.getDescendant(path);

                return subNamespace.getClass(name);
            }

            if (!hasOwn.call(namespace.classes, lowerName)) {
                // Try to autoload the class
                namespace.classAutoloader.autoloadClass(namespace.getPrefix() + name);

                // Raise an error if it is still not defined
                if (!hasOwn.call(namespace.classes, lowerName)) {
                    throw new PHPFatalError(PHPFatalError.CLASS_NOT_FOUND, {name: namespace.getPrefix() + name});
                }
            }

            return namespace.classes[lowerName];
        },

        getConstant: function (name, usesNamespace) {
            var lowercaseName,
                namespace = this;

            if (!hasOwn.call(namespace.constants, name)) {
                lowercaseName = name.toLowerCase();

                if (!hasOwn.call(namespace.constants, lowercaseName) || !namespace.constants[lowercaseName].caseInsensitive) {
                    if (usesNamespace) {
                        throw new PHPFatalError(PHPFatalError.UNDEFINED_CONSTANT, {name: namespace.getPrefix() + name});
                    } else {
                        namespace.callStack.raiseError(PHPError.E_NOTICE, 'Use of undefined constant ' + name + ' - assumed \'' + name + '\'');

                        return this.valueFactory.createString(name);
                    }
                }

                name = lowercaseName;
            }

            return namespace.constants[name].value;
        },

        getDescendant: function (name) {
            var namespace = this;

            util.each(name.split('\\'), function (part) {
                if (!hasOwn.call(namespace.children, part)) {
                    namespace.children[part] = new Namespace(
                        namespace.callStack,
                        namespace.valueFactory,
                        namespace.classAutoloader,
                        namespace,
                        part
                    );
                }

                namespace = namespace.children[part];
            });

            return namespace;
        },

        getFunction: function (name) {
            var globalNamespace,
                match,
                namespace = this,
                path,
                subNamespace;

            if (util.isFunction(name)) {
                return name;
            }

            match = name.match(/^(.*?)\\([^\\]+)$/);

            if (match) {
                path = match[1];
                name = match[2];

                subNamespace = namespace.getDescendant(path);

                return subNamespace.getFunction(name);
            }

            if (hasOwn.call(namespace.functions, name)) {
                return namespace.functions[name];
            }

            globalNamespace = namespace.getGlobal();

            if (hasOwn.call(globalNamespace.functions, name)) {
                return globalNamespace.functions[name];
            }

            throw new PHPFatalError(PHPFatalError.CALL_TO_UNDEFINED_FUNCTION, {name: namespace.getPrefix() + name});
        },

        getGlobal: function () {
            var namespace = this;

            return namespace.name === '' ? namespace : namespace.getParent().getGlobal();
        },

        getGlobalNamespace: function () {
            return this.getGlobal();
        },

        getOwnFunction: function (name) {
            var namespace = this;

            if (hasOwn.call(namespace.functions, name)) {
                return namespace.functions[name];
            }

            return null;
        },

        getParent: function () {
            return this.parent;
        },

        getPrefix: function () {
            var namespace = this;

            if (namespace.name === '') {
                return '';
            }

            return (namespace.parent ? namespace.parent.getPrefix() : '') + namespace.name + '\\';
        }
    });
module.exports = Namespace;}());

},{"./../../../js/util":51,"./Class":58,"./Error":61,"./Error/Fatal":62}],68:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), PHPFatalError = require('./Error/Fatal');
var hasOwn = {}.hasOwnProperty;
function NamespaceScope(globalNamespace, namespace) {
        this.globalNamespace = globalNamespace;
        this.imports = {};
        this.namespace = namespace;
    }
util.extend(NamespaceScope.prototype, {
        getClass: function (name) {
            var match,
                scope = this,
                namespace = scope.namespace,
                path,
                prefix;

            // Check whether the entire class name is aliased
            if (hasOwn.call(scope.imports, name)) {
                name = scope.imports[name];
                namespace = scope.globalNamespace;
            }

            // Check whether the class path is absolute, so no 'use's apply
            if (name.charAt(0) === '\\') {
                match = name.match(/^\\(.*?)\\([^\\]+)$/);

                if (match) {
                    path = match[1];
                    name = match[2];
                    namespace = scope.globalNamespace.getDescendant(path);
                } else {
                    name = name.substr(1);
                }
            // Check whether the namespace prefix is an alias
            } else {
                match = name.match(/^([^\\]+)(.*?)\\([^\\]+)$/);

                if (match) {
                    prefix = match[1];
                    path = match[2];

                    if (hasOwn.call(scope.imports, prefix)) {
                        namespace = scope.globalNamespace.getDescendant(scope.imports[prefix].substr(1) + path);
                        name = match[3];
                    }
                }
            }

            return namespace.getClass(name);
        },

        getConstant: function (name) {
            var match,
                scope = this,
                namespace = scope.namespace,
                path,
                prefix,
                usesNamespace;

            // Check whether the constant path is absolute, so no 'use's apply
            if (name.charAt(0) === '\\') {
                usesNamespace = true;
                match = name.match(/^\\(.*?)\\([^\\]+)$/);

                if (match) {
                    path = match[1];
                    name = match[2];
                    namespace = scope.globalNamespace.getDescendant(path);
                } else {
                    name = name.substr(1);
                }
            // Check whether the namespace prefix is an alias
            } else {
                match = name.match(/^([^\\]+)(.*?)\\([^\\]+)$/);

                if (match) {
                    usesNamespace = true;
                    prefix = match[1];
                    path = match[2];
                    name = match[3];

                    if (hasOwn.call(scope.imports, prefix)) {
                        namespace = scope.globalNamespace.getDescendant(scope.imports[prefix].substr(1) + path);
                    } else {
                        // Not an alias: look up the namespace path relative to this namespace
                        // (ie. 'namespace Test { echo Our\CONSTANT; }' -> 'echo \Test\Our\CONSTANT;')
                        namespace = scope.globalNamespace.getDescendant(namespace.getPrefix() + prefix + path);
                    }
                }
            }

            return namespace.getConstant(name, usesNamespace);
        },

        getFunction: function (name) {
            var match,
                scope = this,
                namespace = scope.namespace,
                path,
                prefix;

            // Check whether the function path is absolute, so no 'use's apply
            if (name.charAt(0) === '\\') {
                match = name.match(/^\\(.*?)\\([^\\]+)$/);

                if (match) {
                    path = match[1];
                    name = match[2];
                    namespace = scope.globalNamespace.getDescendant(path);
                } else {
                    name = name.substr(1);
                }
            // Check whether the namespace prefix is an alias
            } else {
                match = name.match(/^([^\\]+)(.*?)\\([^\\]+)$/);

                if (match) {
                    prefix = match[1];
                    path = match[2];
                    name = match[3];

                    if (hasOwn.call(scope.imports, prefix)) {
                        namespace = scope.globalNamespace.getDescendant(scope.imports[prefix].substr(1) + path);
                    } else {
                        // Not an alias: look up the namespace path relative to this namespace
                        // (ie. 'namespace Test { Our\Func(); }' -> '\Test\Our\Func();')
                        namespace = scope.globalNamespace.getDescendant(namespace.getPrefix() + prefix + path);
                    }
                }
            }

            return namespace.getFunction(name);
        },

        getGlobalNamespace: function () {
            return this.globalNamespace;
        },

        use: function (source, alias) {
            var scope = this,
                normalizedSource = source;

            if (!alias) {
                alias = source.replace(/^.*?([^\\]+)$/, '$1');
            }

            if (normalizedSource.charAt(0) !== '\\') {
                normalizedSource = '\\' + normalizedSource;
            }

            if (scope.imports[alias]) {
                throw new PHPFatalError(
                    PHPFatalError.NAME_ALREADY_IN_USE,
                    {
                        alias: alias,
                        source: source
                    }
                );
            }

            scope.imports[alias] = normalizedSource;
        }
    });
module.exports = NamespaceScope;}());

},{"./../../../js/util":51,"./Error/Fatal":62}],69:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), PHPError = require('../Error');
function ElementReference(valueFactory, callStack, arrayValue, key, value) {
        this.arrayValue = arrayValue;
        this.key = key;
        this.reference = null;
        this.callStack = callStack;
        this.value = value;
        this.valueFactory = valueFactory;
    }
util.extend(ElementReference.prototype, {
        clone: function () {
            var element = this;

            return new ElementReference(element.valueFactory, element.callStack, element.arrayValue, element.key, element.value);
        },

        getKey: function () {
            return this.key;
        },

        getValue: function () {
            var element = this;

            // Special value of native null (vs. NullValue) represents undefined
            if (!element.value && !element.reference) {
                element.callStack.raiseError(PHPError.E_NOTICE, 'Undefined ' + element.arrayValue.referToElement(element.key.getNative()));
                return element.valueFactory.createNull();
            }

            return element.value ? element.value : element.reference.getValue();
        },

        isDefined: function () {
            var element = this;

            return element.value || element.reference;
        },

        isReference: function () {
            return !!this.reference;
        },

        setReference: function (reference) {
            var element = this;

            element.reference = reference;
            element.value = null;
        },

        setValue: function (value) {
            var element = this,
                isFirstElement = (element.arrayValue.getLength() === 0);

            if (element.reference) {
                element.reference.setValue(value);
            } else {
                element.value = value.getForAssignment();
            }

            if (isFirstElement) {
                element.arrayValue.setPointer(element.arrayValue.getKeys().indexOf(element.key.getNative().toString()));
            }
        }
    });
module.exports = ElementReference;}());

},{"../Error":61,"./../../../../js/util":51}],70:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util');
function NullReference(valueFactory, options) {
        options = options || {};

        this.onSet = options.onSet;
        this.valueFactory = valueFactory;
    }
util.extend(NullReference.prototype, {
        getValue: function () {
            return this.valueFactory.createNull();
        },

        setValue: function () {
            var reference = this;

            if (reference.onSet) {
                reference.onSet();
            }
        }
    });
module.exports = NullReference;}());

},{"./../../../../js/util":51}],71:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), PHPError = require('../Error');
var hasOwn = {}.hasOwnProperty;
function PropertyReference(valueFactory, callStack, objectValue, key) {
        this.objectValue = objectValue;
        this.key = key;
        this.reference = null;
        this.callStack = callStack;
        this.valueFactory = valueFactory;
    }
util.extend(PropertyReference.prototype, {
        clone: function () {
            var property = this;

            return new PropertyReference(
                property.valueFactory,
                property.callStack,
                property.objectValue,
                property.key
            );
        },

        getKey: function () {
            return this.key;
        },

        getValue: function () {
            var property = this,
                nativeObject = property.objectValue.getNative(),
                nativeKey = property.key.getNative();

            // Special value of native null (vs. NullValue) represents undefined
            if (!property.isDefined()) {
                property.callStack.raiseError(
                    PHPError.E_NOTICE,
                    'Undefined ' + property.objectValue.referToElement(
                        nativeKey
                    )
                );

                return property.valueFactory.createNull();
            }

            return property.reference ?
                property.reference.getValue() :
                property.valueFactory.coerce(
                    nativeObject[nativeKey]
                );
        },

        isDefined: function () {
            var defined = true,
                otherObject,
                property = this,
                nativeObject = property.objectValue.getNative(),
                nativeKey = property.key.getNative();

            if (property.reference) {
                return true;
            }

            // Allow properties inherited via the prototype chain up to but not including Object.prototype
            if (!hasOwn.call(nativeObject, nativeKey)) {
                otherObject = nativeObject;

                do {
                    otherObject = Object.getPrototypeOf(otherObject);
                    if (!otherObject || otherObject === Object.prototype) {
                        defined = false;
                        break;
                    }
                } while (!hasOwn.call(otherObject, nativeKey));
            }

            return defined;
        },

        isReference: function () {
            return !!this.reference;
        },

        setReference: function (reference) {
            var property = this;

            property.reference = reference;
        },

        setValue: function (value) {
            var property = this,
                nativeObject = property.objectValue.getNative(),
                nativeKey = property.key.getNative(),
                isFirstProperty = (property.objectValue.getLength() === 0);

            if (property.reference) {
                property.reference.setValue(value);
            } else {
                nativeObject[nativeKey] = value.getForAssignment();
            }

            if (isFirstProperty) {
                property.objectValue.setPointer(
                    property.objectValue.getKeys().indexOf(
                        property.key.getNative().toString()
                    )
                );
            }
        }
    });
module.exports = PropertyReference;}());

},{"../Error":61,"./../../../../js/util":51}],72:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util');
function StaticPropertyReference(classObject, name, visibility, value) {
        this.classObject = classObject;
        this.name = name;
        this.reference = null;
        this.value = value;
        this.visibility = visibility;
    }
util.extend(StaticPropertyReference.prototype, {
        getName: function () {
            return this.name;
        },

        getValue: function () {
            var property = this;

            return property.value ? property.value : property.reference.getValue();
        },

        getVisibility: function () {
            return this.visibility;
        },

        isReference: function () {
            return !!this.reference;
        },

        setReference: function (reference) {
            var property = this;

            property.reference = reference;
            property.value = null;
        },

        setValue: function (value) {
            var property = this;

            if (property.reference) {
                property.reference.setValue(value);
            } else {
                property.value = value.getForAssignment();
            }
        }
    });
module.exports = StaticPropertyReference;}());

},{"./../../../../js/util":51}],73:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util');
function VariableReference(variable) {
        this.variable = variable;
    }
util.extend(VariableReference.prototype, {
        getValue: function () {
            return this.variable.getValue();
        },

        setValue: function (value) {
            this.variable.setValue(value);
        }
    });
module.exports = VariableReference;}());

},{"./../../../../js/util":51}],74:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), NullReference = require('./Reference/Null');
function ReferenceFactory(valueFactory) {
        this.valueFactory = valueFactory;
    }
util.extend(ReferenceFactory.prototype, {
        createNull: function () {
            return new NullReference(this.valueFactory);
        }
    });
module.exports = ReferenceFactory;}());

},{"./../../../js/util":51,"./Reference/Null":70}],75:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), Variable = require('./Variable');
var hasOwn = {}.hasOwnProperty;
function Scope(callStack, valueFactory, thisObject, currentClass) {
        var thisObjectVariable;

        this.currentClass = currentClass;
        this.errorsSuppressed = false;
        this.callStack = callStack;
        this.thisObject = thisObject;
        this.valueFactory = valueFactory;
        this.variables = {};

        if (thisObject) {
            thisObjectVariable = new Variable(callStack, valueFactory, 'this');
            thisObjectVariable.setValue(thisObject);
            this.variables['this'] = thisObjectVariable;
        }
    }
util.extend(Scope.prototype, {
        defineVariable: function (name) {
            var scope = this,
                variable = new Variable(scope.callStack, scope.valueFactory, name);

            scope.variables[name] = variable;

            return variable;
        },

        defineVariables: function (names) {
            var scope = this;

            util.each(names, function (name) {
                scope.defineVariable(name);
            });
        },

        expose: function (object, name) {
            var scope = this,
                valueFactory = scope.valueFactory;

            scope.defineVariable(name).setValue(valueFactory.coerce(object));
        },

        getCurrentClass: function () {
            return this.currentClass;
        },

        getThisObject: function () {
            return this.thisObject;
        },

        getVariable: function (name) {
            var scope = this;

            if (!hasOwn.call(scope.variables, name)) {
                // Implicitly define the variable
                scope.variables[name] = new Variable(scope.callStack, scope.valueFactory, name);
            }

            return scope.variables[name];
        },

        suppressErrors: function () {
            this.errorsSuppressed = true;
        },

        suppressesErrors: function () {
            return this.errorsSuppressed;
        },

        unsuppressErrors: function () {
            this.errorsSuppressed = false;
        }
    });
module.exports = Scope;}());

},{"./../../../js/util":51,"./Variable":87}],76:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var builtinTypes = require('./builtin/builtins'), phpUtil = require('../util'), util = require('./../../../js/util'), CallStack = require('./CallStack'), ClassAutoloader = require('./ClassAutoloader'), Namespace = require('./Namespace'), ReferenceFactory = require('./ReferenceFactory'), Resumable = require('./../../../js/Resumable/Resumable'), ResumableTranspiler = require('./../../../js/Resumable/Transpiler'), Scope = require('./Scope'), ValueFactory = require('./ValueFactory');
var EXCEPTION_CLASS = 'Exception';
function PHPState(stdout, stderr, engine, options) {
        var callStack = new CallStack(stderr),
            valueFactory = new ValueFactory(callStack),
            classAutoloader = new ClassAutoloader(valueFactory),
            globalNamespace = new Namespace(callStack, valueFactory, classAutoloader, null, '');

        classAutoloader.setGlobalNamespace(globalNamespace);
        valueFactory.setGlobalNamespace(globalNamespace);

        this.callStack = callStack;
        this.engine = engine;
        this.globalNamespace = globalNamespace;
        this.globalScope = new Scope(callStack, valueFactory, null, null);
        this.options = options;
        this.path = null;
        this.referenceFactory = new ReferenceFactory(valueFactory);
        this.callStack = callStack;
        this.classAutoloader = classAutoloader;
        this.resumable = new Resumable(new ResumableTranspiler());
        this.stdout = stdout;
        this.valueFactory = valueFactory;
        this.PHPException = null;

        setUpState(this);
    }
util.extend(PHPState.prototype, {
        getCallStack: function () {
            return this.callStack;
        },

        getEngine: function () {
            return this.engine;
        },

        getGlobalNamespace: function () {
            return this.globalNamespace;
        },

        getGlobalScope: function () {
            return this.globalScope;
        },

        getOptions: function () {
            return this.options;
        },

        getPath: function () {
            return phpUtil.normalizeModulePath(this.path);
        },

        getPHPExceptionClass: function () {
            return this.PHPException;
        },

        getReferenceFactory: function () {
            return this.referenceFactory;
        },

        getResumable: function () {
            return this.resumable;
        },

        getValueFactory: function () {
            return this.valueFactory;
        },

        isMainProgram: function () {
            return this.path === null;
        },

        setPath: function (path) {
            this.path = path;
        }
    });
function setUpState(state) {
        var globalNamespace = state.globalNamespace,
            internals = {
                callStack: state.callStack,
                classAutoloader: state.classAutoloader,
                globalNamespace: globalNamespace,
                resumable: state.resumable,
                stdout: state.stdout,
                valueFactory: state.valueFactory
            };

        util.each(builtinTypes.functionGroups, function (groupFactory) {
            var groupBuiltins = groupFactory(internals);

            util.each(groupBuiltins, function (fn, name) {
                globalNamespace.defineFunction(name, fn);
            });
        });

        util.each(builtinTypes.classes, function (classFactory, name) {
            var Class = classFactory(internals);

            if (name === EXCEPTION_CLASS) {
                state.PHPException = Class;
            }

            globalNamespace.defineClass(name, Class);
        });
    }
module.exports = PHPState;}());

},{"../util":99,"./../../../js/Resumable/Resumable":27,"./../../../js/Resumable/Transpiler":45,"./../../../js/util":51,"./CallStack":57,"./ClassAutoloader":59,"./Namespace":67,"./ReferenceFactory":74,"./Scope":75,"./ValueFactory":86,"./builtin/builtins":88}],77:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), NullReference = require('./Reference/Null'), PHPError = require('./Error'), PHPFatalError = require('./Error/Fatal');
function Value(factory, callStack, type, value) {
        this.factory = factory;
        this.callStack = callStack;
        this.type = type;
        this.value = value;
    }
util.extend(Value.prototype, {
        addToArray: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        addToFloat: function (floatValue) {
            var leftValue = this;

            // Coerce to float and return a float if either operand is a float
            return leftValue.factory.createFloat(leftValue.coerceToFloat().getNative() + floatValue.getNative());
        },

        addToString: function (stringValue) {
            return stringValue.coerceToNumber().add(this.coerceToNumber());
        },

        callMethod: function (name) {
            throw new PHPFatalError(PHPFatalError.NON_OBJECT_METHOD_CALL, {
                name: name
            });
        },

        callStaticMethod: function () {
            throw new PHPFatalError(PHPFatalError.CLASS_NAME_NOT_VALID);
        },

        coerceToArray: function () {
            var value = this;

            return value.factory.createArray([value]);
        },

        coerceToFloat: function () {
            var value = this;

            return value.factory.createFloat(Number(value.value));
        },

        concat: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createString(leftValue.coerceToString().getNative() + rightValue.coerceToString().getNative());
        },

        getConstantByName: function () {
            throw new PHPFatalError(PHPFatalError.CLASS_NAME_NOT_VALID);
        },

        getElementByKey: function () {
            var callStack = this.callStack;

            return new NullReference(this.factory, {
                onSet: function () {
                    callStack.raiseError(PHPError.E_WARNING, 'Cannot use a scalar value as an array');
                }
            });
        },

        getForAssignment: function () {
            return this;
        },

        getInstancePropertyByName: function () {
            throw new Error('Unimplemented');
        },

        getLength: function () {
            return this.coerceToString().getLength();
        },

        getNative: function () {
            return this.value;
        },

        getStaticPropertyByName: function () {
            throw new PHPFatalError(PHPFatalError.CLASS_NAME_NOT_VALID);
        },

        getType: function () {
            return this.type;
        },

        getValue: function () {
            return this;
        },

        isEqualTo: function (rightValue) {
            /*jshint eqeqeq:false */
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.value == leftValue.value);
        },

        isEqualToArray: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isEqualToFloat: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isEqualToInteger: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isEqualToNull: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isEqualToObject: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isIdenticalTo: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.type === leftValue.type && rightValue.value === leftValue.value);
        },

        isIdenticalToArray: function (rightValue) {
            return this.isIdenticalTo(rightValue);
        },

        isIdenticalToObject: function (rightValue) {
            return this.isIdenticalTo(rightValue);
        },

        isNotEqualTo: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(!leftValue.isEqualTo(rightValue).getNative());
        },

        isNotIdenticalTo: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(!leftValue.isIdenticalTo(rightValue).getNative());
        },

        isSet: function () {
            // All values except NULL are classed as 'set'
            return true;
        },

        logicalAnd: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(
                leftValue.coerceToBoolean().getNative() &&
                rightValue.coerceToBoolean().getNative()
            );
        },

        logicalNot: function () {
            var value = this;

            return value.factory.createBoolean(!value.coerceToBoolean().getNative());
        },

        toValue: function () {
            return this;
        },

        unwrapForJS: function () {
            return this.getNative();
        }
    });
module.exports = Value;}());

},{"./../../../js/util":51,"./Error":61,"./Error/Fatal":62,"./Reference/Null":70}],78:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), ElementReference = require('../Reference/Element'), KeyValuePair = require('../KeyValuePair'), NullReference = require('../Reference/Null'), PHPError = require('../Error'), PHPFatalError = require('../Error/Fatal'), Value = require('../Value'), Variable = require('../Variable');
var hasOwn = {}.hasOwnProperty;
function ArrayValue(factory, callStack, orderedElements, type) {
        var elements = [],
            keysToElements = [],
            value = this;

        util.each(orderedElements, function (element, key) {
            if (element instanceof KeyValuePair) {
                key = element.getKey();
                element = element.getValue();
            } else {
                if (util.isNumber(key)) {
                    key = factory.createInteger(keysToElements.length);
                } else {
                    key = factory.createFromNative(key);
                }

                if (element instanceof Variable) {
                    element = element.getValue();
                } else {
                    element = factory.coerce(element);
                }
            }

            element = new ElementReference(factory, callStack, value, key, element);

            elements.push(element);
            keysToElements[key.getNative()] = element;
        });

        Value.call(this, factory, callStack, type || 'array', elements);

        this.keysToElements = keysToElements;
        this.pointer = 0;
    }
util.inherit(ArrayValue).from(Value);
util.extend(ArrayValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToArray(this);
        },

        addToArray: function (leftValue) {
            var rightValue = this,
                resultArray = leftValue.clone();

            util.each(rightValue.keysToElements, function (element, key) {
                if (!hasOwn.call(resultArray.keysToElements, key)) {
                    resultArray.getElementByKey(element.getKey()).setValue(element.getValue());
                }
            }, {keys: true});

            return resultArray;
        },

        addToBoolean: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        addToFloat: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        addToInteger: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        addToNull: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        addToObject: function (objectValue) {
            return objectValue.addToArray(this);
        },

        addToString: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        call: function (args, namespaceOrNamespaceScope) {
            var value = this.value;

            if (value.length < 2) {
                throw new PHPFatalError(PHPFatalError.FUNCTION_NAME_MUST_BE_STRING);
            }

            return value[0].getValue().callMethod(value[1].getValue().getNative(), args, namespaceOrNamespaceScope);
        },

        clone: function () {
            var arrayValue = this,
                orderedElements = [];

            util.each(arrayValue.value, function (element) {
                if (element.isDefined()) {
                    orderedElements.push(new KeyValuePair(element.getKey(), element.getValue()));
                }
            });

            return new ArrayValue(arrayValue.factory, arrayValue.callStack, orderedElements, arrayValue.type);
        },

        coerceToArray: function () {
            return this;
        },

        coerceToBoolean: function () {
            var value = this;

            return value.factory.createBoolean(value.value.length > 0);
        },

        coerceToInteger: function () {
            var value = this;

            return value.factory.createInteger(value.value.length === 0 ? 0 : 1);
        },

        coerceToKey: function () {
            this.callStack.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        coerceToNumber: function () {
            return this.coerceToInteger();
        },

        coerceToString: function () {
            return this.factory.createString('Array');
        },

        getForAssignment: function () {
            return this.clone();
        },

        getKeys: function () {
            var keys = [];

            util.each(this.value, function (element) {
                keys.push(element.getKey());
            });

            return keys;
        },

        getNative: function () {
            var result = [];

            util.each(this.value, function (element) {
                result[element.getKey().getNative()] = element.getValue().getNative();
            });

            return result;
        },

        getCurrentElement: function () {
            var value = this;

            return value.value[value.pointer] || value.factory.createNull();
        },

        getElementByKey: function (key) {
            var element,
                keyValue,
                value = this;

            key = key.coerceToKey(value.callStack);

            if (!key) {
                // Could not be coerced to a key: error will already have been handled, just return NULL
                return new NullReference(value.factory);
            }

            keyValue = key.getNative();

            if (!hasOwn.call(value.keysToElements, keyValue)) {
                element = new ElementReference(value.factory, value.callStack, value, key, null);

                value.value.push(element);
                value.keysToElements[keyValue] = element;
            }

            return value.keysToElements[keyValue];
        },

        getElementByIndex: function (index) {
            var value = this;

            return value.value[index] || (function () {
                value.callStack.raiseError(PHPError.E_NOTICE, 'Undefined ' + value.referToElement(index));

                return new NullReference(value.factory);
            }());
        },

        getKeyByIndex: function (index) {
            var value = this,
                element = value.value[index];

            return element ? element.key : null;
        },

        getLength: function () {
            return this.value.length;
        },

        getPointer: function () {
            return this.pointer;
        },

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToArray(this);
        },

        isEqualToNull: function () {
            var value = this;

            return value.factory.createBoolean(value.value.length === 0);
        },

        isEqualToArray: function (rightValue) {
            var equal = true,
                leftValue = this,
                factory = leftValue.factory;

            if (rightValue.value.length !== leftValue.value.length) {
                return factory.createBoolean(false);
            }

            util.each(rightValue.keysToElements, function (element, nativeKey) {
                if (!hasOwn.call(leftValue.keysToElements, nativeKey) || element.getValue().isNotEqualTo(leftValue.keysToElements[nativeKey].getValue()).getNative()) {
                    equal = false;
                    return false;
                }
            }, {keys: true});

            return factory.createBoolean(equal);
        },

        isEqualToBoolean: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.getNative() === (leftValue.value.length > 0));
        },

        isEqualToFloat: function () {
            return this.factory.createBoolean(false);
        },

        isEqualToInteger: function () {
            return this.factory.createBoolean(false);
        },

        isEqualToObject: function () {
            return this.factory.createBoolean(false);
        },

        isEqualToString: function () {
            return this.factory.createBoolean(false);
        },

        isIdenticalTo: function (rightValue) {
            return rightValue.isIdenticalToArray(this);
        },

        isIdenticalToArray: function (rightValue) {
            var identical = true,
                leftValue = this,
                factory = leftValue.factory;

            if (rightValue.value.length !== leftValue.value.length) {
                return factory.createBoolean(false);
            }

            util.each(rightValue.value, function (element, index) {
                if (
                    leftValue.value[index].getKey().isNotIdenticalTo(element.getKey()).getNative() ||
                    leftValue.value[index].getValue().isNotIdenticalTo(element.getValue()).getNative()
                ) {
                    identical = false;
                    return false;
                }
            });

            return factory.createBoolean(identical);
        },

        next: function () {
            this.pointer++;
        },

        onesComplement: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        referToElement: function (key) {
            return 'offset: ' + key;
        },

        reset: function () {
            var value = this;

            value.pointer = 0;

            return value;
        },

        setPointer: function (pointer) {
            this.pointer = pointer;
        },

        shiftLeftBy: function (rightValue) {
            return this.coerceToInteger().shiftLeftBy(rightValue);
        },

        shiftRightBy: function (rightValue) {
            return this.coerceToInteger().shiftRightBy(rightValue);
        }
    });
module.exports = ArrayValue;}());

},{"../Error":61,"../Error/Fatal":62,"../KeyValuePair":64,"../Reference/Element":69,"../Reference/Null":70,"../Value":77,"../Variable":87,"./../../../../js/util":51}],79:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), StringValue = require('./String');
function BarewordStringValue(factory, callStack, value) {
        StringValue.call(this, factory, callStack, value);
    }
util.inherit(BarewordStringValue).from(StringValue);
util.extend(BarewordStringValue.prototype, {
        call: function (args, namespaceOrNamespaceScope) {
            return namespaceOrNamespaceScope.getFunction(this.value).apply(null, args);
        }
    });
module.exports = BarewordStringValue;}());

},{"./../../../../js/util":51,"./String":85}],80:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), PHPFatalError = require('../Error/Fatal'), Value = require('../Value');
function BooleanValue(factory, callStack, value) {
        Value.call(this, factory, callStack, 'boolean', !!value);
    }
util.inherit(BooleanValue).from(Value);
util.extend(BooleanValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToBoolean(this);
        },

        addToBoolean: function (rightValue) {
            var value = this;

            return value.factory.createInteger(value.value + rightValue.value);
        },

        addToInteger: function (integerValue) {
            return integerValue.addToBoolean(this);
        },

        addToNull: function () {
            return this.coerceToInteger();
        },

        addToObject: function (objectValue) {
            return objectValue.addToBoolean(this);
        },

        coerceToBoolean: function () {
            return this;
        },

        coerceToInteger: function () {
            var value = this;

            return value.factory.createInteger(value.value ? 1 : 0);
        },

        coerceToKey: function () {
            return this.coerceToInteger();
        },

        coerceToNumber: function () {
            return this.coerceToInteger();
        },

        coerceToString: function () {
            var value = this;

            return value.factory.createString(value.value ? '1' : '');
        },

        getElement: function () {
            // Array access on booleans always returns null, no notice or warning is raised
            return this.factory.createNull();
        },

        isEqualTo: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createBoolean(rightValue.coerceToBoolean().value === leftValue.value);
        },

        isEqualToObject: function () {
            return this;
        },

        isEqualToString: function (stringValue) {
            var booleanValue = this;

            return stringValue.factory.createBoolean(stringValue.coerceToBoolean().getNative() === booleanValue.getNative());
        },

        onesComplement: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        shiftLeftBy: function (rightValue) {
            return this.coerceToInteger().shiftLeftBy(rightValue);
        },

        shiftRightBy: function (rightValue) {
            return this.coerceToInteger().shiftRightBy(rightValue);
        }
    });
module.exports = BooleanValue;}());

},{"../Error/Fatal":62,"../Value":77,"./../../../../js/util":51}],81:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), Value = require('../Value');
function FloatValue(factory, callStack, value) {
        Value.call(this, factory, callStack, 'float', value);
    }
util.inherit(FloatValue).from(Value);
util.extend(FloatValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToFloat(this);
        },

        addToBoolean: function (booleanValue) {
            var value = this;

            return value.factory.createFloat(value.value + Number(booleanValue.value));
        },

        addToInteger: function (integerValue) {
            var value = this;

            return value.factory.createFloat(value.value + integerValue.value);
        },

        addToObject: function (objectValue) {
            return objectValue.addToFloat(this);
        },

        addToNull: function () {
            return this.coerceToNumber();
        },

        coerceToBoolean: function () {
            var value = this;

            return value.factory.createBoolean(!!value.value);
        },

        coerceToFloat: function () {
            return this;
        },

        coerceToInteger: function () {
            /*jshint bitwise: false */
            var value = this;

            return value.factory.createInteger(value.value >> 0);
        },

        coerceToKey: function () {
            return this.coerceToInteger();
        },

        coerceToNumber: function () {
            return this;
        },

        coerceToString: function () {
            var value = this;

            return value.factory.createString(value.value + '');
        },

        getElement: function () {
            // Array access on floats always returns null, no notice or warning is raised
            return this.factory.createNull();
        },

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToFloat(this);
        },

        isEqualToFloat: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.value === leftValue.value);
        },

        isEqualToInteger: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.coerceToFloat().value === leftValue.value);
        },

        isEqualToNull: function () {
            var leftValue = this;

            return leftValue.factory.createBoolean(leftValue.value === 0);
        },

        isEqualToObject: function (objectValue) {
            return objectValue.isEqualToFloat(this);
        },

        isEqualToString: function (stringValue) {
            var floatValue = this;

            return floatValue.factory.createBoolean(floatValue.value === stringValue.coerceToFloat().value);
        },

        onesComplement: function () {
            /*jshint bitwise: false */
            return this.factory.createInteger(~this.value);
        },

        shiftLeftBy: function (rightValue) {
            return this.coerceToInteger().shiftLeftBy(rightValue);
        },

        shiftRightBy: function (rightValue) {
            return this.coerceToInteger().shiftRightBy(rightValue);
        },

        toNegative: function () {
            var value = this;

            return value.factory.createFloat(-value.value);
        },

        toPositive: function () {
            var value = this;

            return value.factory.createInteger(+value.value);
        }
    });
module.exports = FloatValue;}());

},{"../Value":77,"./../../../../js/util":51}],82:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), Value = require('../Value');
function IntegerValue(factory, callStack, value) {
        Value.call(this, factory, callStack, 'integer', value);
    }
util.inherit(IntegerValue).from(Value);
util.extend(IntegerValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToInteger(this);
        },

        addToBoolean: function (booleanValue) {
            var value = this;

            return value.factory.createInteger(value.value + booleanValue.value);
        },

        addToInteger: function (rightValue) {
            var value = this;

            return value.factory.createInteger(value.value + rightValue.value);
        },

        coerceToBoolean: function () {
            var value = this;

            return value.factory.createBoolean(!!value.value);
        },

        coerceToFloat: function () {
            var value = this;

            return value.factory.createFloat(value.value);
        },

        coerceToInteger: function () {
            return this;
        },

        coerceToKey: function () {
            return this;
        },

        coerceToNumber: function () {
            return this;
        },

        coerceToString: function () {
            var value = this;

            return value.factory.createString(value.value.toString());
        },

        decrement: function () {
            var value = this;

            return value.factory.createInteger(value.value - 1);
        },

        getElement: function () {
            // Array access on integers always returns null, no notice or warning is raised
            return this.factory.createNull();
        },

        increment: function () {
            var value = this;

            return value.factory.createInteger(value.value + 1);
        },

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToInteger(this);
        },

        isEqualToInteger: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.value === leftValue.value);
        },

        isEqualToNull: function () {
            var leftValue = this;

            return leftValue.factory.createBoolean(leftValue.value === 0);
        },

        isEqualToObject: function (objectValue) {
            return objectValue.isEqualToInteger(this);
        },

        isEqualToString: function (stringValue) {
            var integerValue = this;

            return integerValue.factory.createBoolean(integerValue.getNative() === parseFloat(stringValue.getNative()));
        },

        isLessThan: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createBoolean(leftValue.getNative() < rightValue.getNative());
        },

        multiply: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory,
                rightType = rightValue.getType();

            // Coerce to float and return a float if either operand is a float
            if (rightType === 'float') {
                return factory.createFloat(leftValue.coerceToFloat().getNative() + rightValue.coerceToFloat().getNative());
            }

            return factory.createInteger(leftValue.getNative() * rightValue.getNative());
        },

        onesComplement: function () {
            /*jshint bitwise: false */
            return this.factory.createInteger(~this.value);
        },

        shiftLeftBy: function (rightValue) {
            /*jshint bitwise: false */
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createInteger(leftValue.getNative() << rightValue.coerceToInteger().getNative());
        },

        shiftRightBy: function (rightValue) {
            /*jshint bitwise: false */
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createInteger(leftValue.getNative() >> rightValue.coerceToInteger().getNative());
        },

        subtract: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory;

            rightValue = rightValue.coerceToNumber();

            // Coerce to float and return a float if either operand is a float
            if (rightValue.getType() === 'float') {
                return factory.createFloat(leftValue.coerceToFloat().getNative() - rightValue.coerceToFloat().getNative());
            }

            return factory.createInteger(leftValue.getNative() - rightValue.getNative());
        },

        toNegative: function () {
            var value = this;

            return value.factory.createInteger(-value.value);
        },

        toPositive: function () {
            var value = this;

            return value.factory.createInteger(+value.value);
        }
    });
module.exports = IntegerValue;}());

},{"../Value":77,"./../../../../js/util":51}],83:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), PHPError = require('../Error'), Value = require('../Value');
function NullValue(factory, callStack) {
        Value.call(this, factory, callStack, 'null', null);
    }
util.inherit(NullValue).from(Value);
util.extend(NullValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToNull();
        },

        addToBoolean: function (booleanValue) {
            return booleanValue.coerceToInteger();
        },

        coerceToArray: function () {
            // Null just casts to an empty array
            return this.factory.createArray();
        },

        coerceToBoolean: function () {
            return this.factory.createBoolean(false);
        },

        coerceToKey: function () {
            return this.factory.createString('');
        },

        coerceToString: function () {
            return this.factory.createString('');
        },

        getInstancePropertyByName: function (name) {
            var value = this;

            value.callStack.raiseError(
                PHPError.E_NOTICE,
                'Trying to get property of non-object'
            );

            return value.factory.createNull();
        },

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToNull(this);
        },

        isEqualToFloat: function (floatValue) {
            return floatValue.isEqualToNull();
        },

        isEqualToNull: function () {
            return this.factory.createBoolean(true);
        },

        isEqualToObject: function (objectValue) {
            return objectValue.isEqualToNull();
        },

        isEqualToString: function (stringValue) {
            return stringValue.isEqualToNull();
        },

        isSet: function () {
            return false;
        }
    });
module.exports = NullValue;}());

},{"../Error":61,"../Value":77,"./../../../../js/util":51}],84:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), KeyValuePair = require('../KeyValuePair'), NullReference = require('../Reference/Null'), PHPError = require('../Error'), PHPFatalError = require('../Error/Fatal'), PropertyReference = require('../Reference/Property'), Value = require('../Value');
var hasOwn = {}.hasOwnProperty;
function ObjectValue(factory, callStack, object, classObject, id) {
        Value.call(this, factory, callStack, 'object', object);

        this.classObject = classObject;
        this.id = id;
        this.properties = {};
    }
util.inherit(ObjectValue).from(Value);
util.extend(ObjectValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToObject(this);
        },

        addToArray: function () {
            var value = this;

            value.callStack.raiseError(PHPError.E_NOTICE, 'Object of class ' + value.classObject.getName() + ' could not be converted to int');

            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        addToBoolean: function (booleanValue) {
            var value = this;

            value.callStack.raiseError(PHPError.E_NOTICE, 'Object of class ' + value.classObject.getName() + ' could not be converted to int');

            return value.factory.createInteger((booleanValue.value ? 1 : 0) + 1);
        },

        addToFloat: function (floatValue) {
            var value = this;

            value.callStack.raiseError(PHPError.E_NOTICE, 'Object of class ' + value.classObject.getName() + ' could not be converted to int');

            return value.factory.createFloat(floatValue.value + 1);
        },

        call: function (args) {
            return this.callMethod('__invoke', args);
        },

        callMethod: function (name, args) {
            var defined = true,
                func,
                value = this,
                object = value.value,
                otherObject,
                thisObject = value,
                thisVariable;

            // Call functions directly when invoking the magic method
            if (name === '__invoke' && util.isFunction(object)) {
                func = object;
            } else {
                // Allow methods inherited via the prototype chain up to but not including Object.prototype
                if (!hasOwn.call(object, name)) {
                    otherObject = object;

                    do {
                        otherObject = Object.getPrototypeOf(otherObject);
                        if (!otherObject || otherObject === Object.prototype) {
                            defined = false;
                            break;
                        }
                    } while (!hasOwn.call(otherObject, name));
                }

                func = object[name];
            }

            if (!defined || !util.isFunction(func)) {
                throw new PHPFatalError(
                    PHPFatalError.UNDEFINED_METHOD,
                    {
                        className: value.classObject.getName(),
                        methodName: name
                    }
                );
            }

            // Unwrap thisObj and argument Value objects when calling out
            // to a native JS object method
            if (value.classObject.getName() === 'JSObject') {
                thisObject = object;
                util.each(args, function (arg, index) {
                    args[index] = arg.unwrapForJS();
                });
            // Use the current object as $this for PHP closures by default
            } else if (value.classObject.getName() === 'Closure') {
                // Store the current PHP thisObj to set for the closure
                thisVariable = object.scopeWhenCreated.getVariable('this');
                thisObject = thisVariable.isDefined() ?
                    thisVariable.getValue() :
                    null;
            }

            return value.factory.coerce(func.apply(thisObject, args));
        },

        callStaticMethod: function (nameValue, args) {
            return this.classObject.callStaticMethod(nameValue.getNative(), args);
        },

        clone: function () {
            throw new Error('Unimplemented');
        },

        coerceToArray: function () {
            var elements = [],
                value = this,
                factory = value.factory;

            util.each(value.value, function (propertyValue, propertyName) {
                elements.push(
                    new KeyValuePair(
                        factory.coerce(propertyName),
                        factory.coerce(propertyValue)
                    )
                );
            });

            return value.factory.createArray(elements);
        },

        coerceToBoolean: function () {
            return this.factory.createBoolean(true);
        },

        coerceToKey: function () {
            this.callStack.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        getClassName: function () {
            return this.classObject.getName();
        },

        getConstantByName: function (name) {
            return this.classObject.getConstantByName(name);
        },

        getElementByIndex: function (index) {
            var value = this,
                names = value.getInstancePropertyNames();

            if (!hasOwn.call(names, index)) {
                value.callStack.raiseError(
                    PHPError.E_NOTICE,
                    'Undefined ' + value.referToElement(index)
                );

                return new NullReference(value.factory);
            }

            return value.getInstancePropertyByName(names[index]);
        },

        getForAssignment: function () {
            return this;
        },

        getID: function () {
            return this.id;
        },

        getInstancePropertyByName: function (nameValue) {
            var nameKey = nameValue.coerceToKey(),
                name = nameKey.getNative(),
                value = this;

            if (value.classObject.hasStaticPropertyByName(name)) {
                value.callStack.raiseError(PHPError.E_STRICT, 'Accessing static property ' + value.classObject.getName() + '::$' + name + ' as non static');
            }

            if (!hasOwn.call(value.properties, name)) {
                value.properties[name] = new PropertyReference(
                    value.factory,
                    value.callStack,
                    value,
                    nameKey
                );
            }

            return value.properties[name];
        },

        getInstancePropertyNames: function () {
            var nameHash = {},
                names = [],
                value = this;

            util.each(value.value, function (value, name) {
                nameHash[name] = true;
            });

            util.each(value.properties, function (value, name) {
                nameHash[name] = true;
            });

            util.each(nameHash, function (t, name) {
                names.push(value.factory.coerce(name));
            });

            return names;
        },

        getKeyByIndex: function (index) {
            var value = this,
                keys = value.getInstancePropertyNames();

            return keys[index] || null;
        },

        getLength: function () {
            return this.getInstancePropertyNames().length;
        },

        getNative: function () {
            return this.value;
        },

        getStaticPropertyByName: function (nameValue) {
            return this.classObject.getStaticPropertyByName(nameValue.getNative());
        },

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToObject(this);
        },

        isEqualToArray: function () {
            return this.factory.createBoolean(false);
        },

        isEqualToFloat: function (floatValue) {
            return this.factory.createBoolean(floatValue.getNative() === 1);
        },

        isEqualToInteger: function (integerValue) {
            return this.factory.createBoolean(integerValue.getNative() === 1);
        },

        isEqualToNull: function () {
            return this.factory.createBoolean(false);
        },

        isEqualToObject: function (rightValue) {
            var equal = true,
                leftValue = this,
                factory = leftValue.factory;

            if (
                rightValue.getLength() !== leftValue.getLength() ||
                rightValue.getClassName() !== leftValue.getClassName()
            ) {
                return factory.createBoolean(false);
            }

            util.each(rightValue.value, function (element, nativeKey) {
                if (
                    !hasOwn.call(leftValue.value, nativeKey) ||
                    factory.coerce(element).isNotEqualTo(
                        leftValue.value[nativeKey].getValue()
                    ).getNative()
                ) {
                    equal = false;
                    return false;
                }
            }, {keys: true});

            return factory.createBoolean(equal);
        },

        isEqualToString: function () {
            return this.factory.createBoolean(false);
        },

        isIdenticalTo: function (rightValue) {
            return rightValue.isIdenticalToObject(this);
        },

        isIdenticalToArray: function () {
            return this.factory.createBoolean(false);
        },

        isIdenticalToObject: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createBoolean(rightValue.value === leftValue.value);
        },

        referToElement: function (key) {
            return 'property: ' + this.getClassName() + '::$' + key;
        },

        reset: function () {
            var value = this;

            value.pointer = 0;

            return value;
        },

        setPointer: function (pointer) {
            this.pointer = pointer;
        },

        unwrapForJS: function () {
            var value = this;

            if (value.classObject.getName() === 'Closure') {
                // When calling a PHP closure from JS, preserve thisObj
                // by passing it in (wrapped) as the first argument
                return function () {
                    // Wrap thisObj in *Value object
                    var thisObj = value.factory.coerce(this),
                        args = [];

                    // Wrap all native JS values in *Value objects
                    util.each(arguments, function (arg) {
                        args.push(value.factory.coerce(arg));
                    });

                    return value.value.apply(thisObj, args);
                };
            }

            return value.getNative();
        }
    });
module.exports = ObjectValue;}());

},{"../Error":61,"../Error/Fatal":62,"../KeyValuePair":64,"../Reference/Null":70,"../Reference/Property":71,"../Value":77,"./../../../../js/util":51}],85:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../js/util'), Value = require('../Value');
function StringValue(factory, callStack, value) {
        Value.call(this, factory, callStack, 'string', value);
    }
util.inherit(StringValue).from(Value);
util.extend(StringValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToString(this);
        },

        addToBoolean: function (booleanValue) {
            return this.coerceToNumber().add(booleanValue);
        },

        call: function (args, namespaceOrNamespaceScope) {
            return namespaceOrNamespaceScope.getGlobalNamespace().getFunction(this.value).apply(null, args);
        },

        callMethod: function (name, args, namespaceScope) {
            var value = this;

            return value.callStaticMethod(value.factory.coerce(name), args, namespaceScope);
        },

        callStaticMethod: function (nameValue, args, namespaceScope) {
            var value = this,
                classObject = namespaceScope.getClass(value.value);

            return classObject.callStaticMethod(nameValue.getNative(), args);
        },

        coerceToBoolean: function () {
            return this.factory.createBoolean(this.value !== '' && this.value !== '0');
        },

        coerceToFloat: function () {
            var value = this;

            return value.factory.createFloat(/^(\d|-\d)/.test(value.value) ? parseFloat(value.value) : 0);
        },

        coerceToInteger: function () {
            var value = this;

            return value.factory.createInteger(/^(\d|-\d)/.test(value.value) ? parseInt(value.value, 10) : 0);
        },

        coerceToKey: function () {
            return this;
        },

        coerceToNumber: function () {
            var value = this,
                isInteger = /^[^.eE]*$/.test(value.value);

            if (isInteger) {
                return value.coerceToInteger();
            } else {
                return value.coerceToFloat();
            }
        },

        coerceToString: function () {
            return this;
        },

        getConstantByName: function (name, namespaceScope) {
            var value = this,
                classObject = namespaceScope.getClass(value.value);

            return classObject.getConstantByName(name);
        },

        getLength: function () {
            return this.value.length;
        },

        getStaticPropertyByName: function (nameValue, namespaceScope) {
            var value = this,
                classObject = namespaceScope.getClass(value.value);

            return classObject.getStaticPropertyByName(nameValue.getNative());
        },

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToString(this);
        },

        isEqualToNull: function () {
            var value = this;

            return value.factory.createBoolean(value.getNative() === '');
        },

        isEqualToObject: function () {
            return this.factory.createBoolean(false);
        },

        isEqualToString: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(leftValue.value === rightValue.value);
        },

        onesComplement: function () {
            return this.factory.createString('?');
        }
    });
module.exports = StringValue;}());

},{"../Value":77,"./../../../../js/util":51}],86:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), ArrayValue = require('./Value/Array'), BarewordStringValue = require('./Value/BarewordString'), BooleanValue = require('./Value/Boolean'), FloatValue = require('./Value/Float'), IntegerValue = require('./Value/Integer'), NullValue = require('./Value/Null'), ObjectValue = require('./Value/Object'), StringValue = require('./Value/String'), Value = require('./Value');
function ValueFactory(callStack) {
        this.nextObjectID = 1;
        this.callStack = callStack;
        this.globalNamespace = null;
    }
util.extend(ValueFactory.prototype, {
        coerce: function (value) {
            if (value instanceof Value) {
                return value;
            }

            return this.createFromNative(value);
        },
        createArray: function (value) {
            var factory = this;

            return new ArrayValue(factory, factory.callStack, value);
        },
        createBarewordString: function (value) {
            var factory = this;

            return new BarewordStringValue(factory, factory.callStack, value);
        },
        createBoolean: function (value) {
            var factory = this;

            return new BooleanValue(factory, factory.callStack, value);
        },
        createFloat: function (value) {
            var factory = this;

            return new FloatValue(factory, factory.callStack, value);
        },
        createFromNative: function (nativeValue) {
            var factory = this;

            if (nativeValue === null || typeof nativeValue === 'undefined') {
                return factory.createNull();
            }

            if (util.isString(nativeValue)) {
                return factory.createString(nativeValue);
            }

            if (util.isNumber(nativeValue)) {
                return factory.createInteger(nativeValue);
            }

            if (util.isBoolean(nativeValue)) {
                return factory.createBoolean(nativeValue);
            }

            if (util.isArray(nativeValue)) {
                return factory.createArray(nativeValue);
            }

            return factory.createObject(nativeValue, factory.globalNamespace.getClass('JSObject'));
        },
        createInteger: function (value) {
            var factory = this;

            return new IntegerValue(factory, factory.callStack, value);
        },
        createNull: function () {
            var factory = this;

            return new NullValue(factory, factory.callStack);
        },
        createObject: function (value, classObject) {
            var factory = this;

            // Object ID tracking is incomplete: ID should be freed when all references are lost
            return new ObjectValue(factory, factory.callStack, value, classObject, factory.nextObjectID++);
        },
        createString: function (value) {
            var factory = this;

            return new StringValue(factory, factory.callStack, value);
        },
        isValue: function (object) {
            return object instanceof Value;
        },
        setGlobalNamespace: function (globalNamespace) {
            this.globalNamespace = globalNamespace;
        }
    });
module.exports = ValueFactory;}());

},{"./../../../js/util":51,"./Value":77,"./Value/Array":78,"./Value/BarewordString":79,"./Value/Boolean":80,"./Value/Float":81,"./Value/Integer":82,"./Value/Null":83,"./Value/Object":84,"./Value/String":85}],87:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../js/util'), PHPError = require('./Error'), VariableReference = require('./Reference/Variable');
function Variable(callStack, valueFactory, name) {
        this.name = name;
        this.reference = null;
        this.callStack = callStack;
        this.value = null;
        this.valueFactory = valueFactory;
    }
util.extend(Variable.prototype, {
        getValue: function () {
            var variable = this;

            if (variable.value) {
                return variable.value;
            }

            if (variable.reference) {
                return variable.reference.getValue();
            }

            variable.callStack.raiseError(PHPError.E_NOTICE, 'Undefined variable: ' + variable.name);

            return variable.valueFactory.createNull();
        },

        getNative: function () {
            return this.getValue().getNative();
        },

        getReference: function () {
            return new VariableReference(this);
        },

        isDefined: function () {
            var variable = this;

            return variable.value || variable.reference;
        },

        isSet: function () {
            var variable = this;

            return variable.isDefined() && variable.getValue().isSet();
        },

        postDecrement: function () {
            var variable = this,
                decrementedValue = variable.value.decrement(),
                result = variable.value;

            if (decrementedValue) {
                variable.value = decrementedValue;
            }

            return result;
        },

        preDecrement: function () {
            var variable = this,
                decrementedValue = variable.value.decrement();

            if (decrementedValue) {
                variable.value = decrementedValue;
            }

            return variable.value;
        },

        postIncrement: function () {
            var variable = this,
                incrementedValue = variable.value.increment(),
                result = variable.value;

            if (incrementedValue) {
                variable.value = incrementedValue;
            }

            return result;
        },

        preIncrement: function () {
            var variable = this,
                incrementedValue = variable.value.increment();

            if (incrementedValue) {
                variable.value = incrementedValue;
            }

            return variable.value;
        },

        setValue: function (value) {
            var variable = this;

            if (variable.reference) {
                variable.reference.setValue(value);
            } else {
                variable.value = value.getForAssignment();
            }

            return value;
        },

        setReference: function (reference) {
            var variable = this;

            variable.reference = reference;
            variable.value = null;
        },

        toArray: function () {
            return this.value.toArray();
        },

        toBoolean: function () {
            return this.value.toBoolean();
        },

        toFloat: function () {
            return this.value.toFloat();
        },

        toInteger: function () {
            return this.value.toInteger();
        },

        toValue: function () {
            return this.getValue();
        },

        unwrapForJS: function () {
            var value = this;

            return value.value ? value.value.unwrapForJS() : null;
        }
    });
module.exports = Variable;}());

},{"./../../../js/util":51,"./Error":61,"./Reference/Variable":73}],88:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var arrayFunctions = require('./functions/array'), constantFunctions = require('./functions/constant'), splFunctions = require('./functions/spl'), stdClass = require('./classes/stdClass'), stringFunctions = require('./functions/string'), timeFunctions = require('./functions/time'), variableHandlingFunctions = require('./functions/variableHandling'), Closure = require('./classes/Closure'), Exception = require('./classes/Exception'), JSObject = require('./classes/JSObject');
module.exports = {
        classes: {
            'stdClass': stdClass,
            'Closure': Closure,
            'Exception': Exception,
            'JSObject': JSObject
        },
        functionGroups: [
            arrayFunctions,
            constantFunctions,
            splFunctions,
            stringFunctions,
            timeFunctions,
            variableHandlingFunctions
        ]
    };}());

},{"./classes/Closure":89,"./classes/Exception":90,"./classes/JSObject":91,"./classes/stdClass":92,"./functions/array":93,"./functions/constant":94,"./functions/spl":95,"./functions/string":96,"./functions/time":97,"./functions/variableHandling":98}],89:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
module.exports = function () {
        function Closure() {

        }

        return Closure;
    };}());

},{}],90:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../../js/util'), PHPError = require('./../../Error');
module.exports = function () {
        function Exception() {

        }

        util.inherit(Exception).from(PHPError);

        util.extend(Exception.prototype, {

        });

        return Exception;
    };}());

},{"./../../../../../js/util":51,"./../../Error":61}],91:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
module.exports = function () {
        function JSObject() {

        }

        return JSObject;
    };}());

},{}],92:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
module.exports = function () {
        function stdClass() {

        }

        return stdClass;
    };}());

},{}],93:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var PHPError = require('./../../Error'), Variable = require('./../../Variable');
module.exports = function (internals) {
        var callStack = internals.callStack,
            valueFactory = internals.valueFactory;

        return {
            'current': function (arrayReference) {
                var isReference = (arrayReference instanceof Variable),
                    arrayValue = isReference ? arrayReference.getValue() : arrayReference;

                if (arrayValue.getPointer() >= arrayValue.getLength()) {
                    return valueFactory.createBoolean(false);
                }

                return arrayValue.getCurrentElement().getValue();
            },
            'next': function (arrayReference) {
                var isReference = (arrayReference instanceof Variable),
                    arrayValue = isReference ? arrayReference.getValue() : arrayReference;

                if (arrayValue.getType() !== 'array') {
                    callStack.raiseError(PHPError.E_WARNING, 'next() expects parameter 1 to be array, ' + arrayValue.getType() + ' given');
                    return valueFactory.createNull();
                }

                arrayValue.setPointer(arrayValue.getPointer() + 1);

                if (arrayValue.getPointer() >= arrayValue.getLength()) {
                    return valueFactory.createBoolean(false);
                }

                return arrayValue.getCurrentElement().getValue();
            }
        };
    };}());

},{"./../../Error":61,"./../../Variable":87}],94:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
module.exports = function (internals) {
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
    };}());

},{}],95:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var Variable = require('./../../Variable');
module.exports = function (internals) {
        var classAutoloader = internals.classAutoloader;

        return {
            'spl_autoload_register': function (callableReference) {
                var isReference = (callableReference instanceof Variable),
                    callableValue = isReference ? callableReference.getValue() : callableReference;

                classAutoloader.appendAutoloadCallable(callableValue);
            }
        };
    };}());

},{"./../../Variable":87}],96:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../../js/util'), PHPError = require('./../../Error'), Variable = require('./../../Variable');
module.exports = function (internals) {
        var callStack = internals.callStack,
            valueFactory = internals.valueFactory;

        return {
            'strlen': function (stringReference) {
                var isReference = (stringReference instanceof Variable),
                    stringValue = isReference ? stringReference.getValue() : stringReference;

                if (stringValue.getType() === 'array' || stringValue.getType() === 'object') {
                    callStack.raiseError(PHPError.E_WARNING, 'strlen() expects parameter 1 to be string, ' + stringValue.getType() + ' given');
                    return valueFactory.createNull();
                }

                return valueFactory.createInteger(stringValue.getLength());
            },

            'str_replace': function (
                searchReference,
                replaceReference,
                subjectReference,
                countReference
            ) {
                function getNative(reference) {
                    var isReference = (reference instanceof Variable),
                        value = isReference ? reference.getValue() : reference;

                    return value.getNative();
                }

                var count = 0,
                    search,
                    replacement,
                    subject,
                    replace = countReference ?
                        function replace(search, replacement, subject) {
                            return subject.replace(search, function () {
                                count++;

                                return replacement;
                            });
                        } :
                        function replace(search, replacement, subject) {
                            return subject.replace(search, replacement);
                        };

                if (arguments.length < 3) {
                    callStack.raiseError(
                        PHPError.E_WARNING,
                        'str_replace() expects at least 3 parameters, ' + arguments.length + ' given'
                    );

                    return valueFactory.createNull();
                }

                search = getNative(searchReference);
                replacement = getNative(replaceReference);
                subject = getNative(subjectReference);

                // Use a regex to search for substrings, for speed
                function buildRegex(search) {
                    return new RegExp(
                        util.regexEscape(search),
                        'g'
                    );
                }

                if (util.isArray(search)) {
                    if (util.isArray(replacement)) {
                        // Search and replacement are both arrays
                        util.each(search, function (search, index) {
                            subject = replace(
                                buildRegex(search),
                                index < replacement.length ? replacement[index] : '',
                                subject
                            );
                        });
                    } else {
                        // Only search is an array, replacement is just a string
                        util.each(search, function (search) {
                            subject = replace(
                                buildRegex(search),
                                replacement,
                                subject
                            );
                        });
                    }
                } else {
                    // Simple case: search and replacement are both strings
                    subject = replace(
                        buildRegex(search),
                        replacement,
                        subject
                    );
                }

                if (countReference) {
                    countReference.setValue(valueFactory.createInteger(count));
                }

                return valueFactory.createString(subject);
            }
        };
    };}());

},{"./../../../../../js/util":51,"./../../Error":61,"./../../Variable":87}],97:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, setTimeout */
(function () {'use strict';
var PHPError = require('./../../Error'), Variable = require('./../../Variable');
module.exports = function (internals) {
        var callStack = internals.callStack,
            resumable = internals.resumable;

        return {
            'usleep': function (microsecondsReference) {
                var isReference = (microsecondsReference instanceof Variable),
                    microsecondsValue = isReference ? microsecondsReference.getValue() : microsecondsReference,
                    pause;

                if (microsecondsValue.getType() !== 'integer' && microsecondsValue.getType() !== 'float') {
                    callStack.raiseError(PHPError.E_WARNING, 'usleep() expects parameter 1 to be integer or float, ' + microsecondsValue.getType() + ' given');
                    return;
                }

                pause = resumable.createPause();

                setTimeout(function () {
                    pause.resume();
                }, microsecondsValue.getNative() / 1000);

                pause.now();
            }
        };
    };}());

},{"./../../Error":61,"./../../Variable":87}],98:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
var util = require('./../../../../../js/util'), PHPError = require('./../../Error'), Variable = require('./../../Variable');
module.exports = function (internals) {
        var callStack = internals.callStack,
            stdout = internals.stdout;

        return {
            // NB: This output matches that of PHP with XDebug disabled
            'var_dump': function (valueReference) {
                var isReference,
                    value,
                    objects = [];

                if (!valueReference) {
                    callStack.raiseError(PHPError.E_WARNING, 'var_dump() expects at least 1 parameter, 0 given');
                    return;
                }

                isReference = (valueReference instanceof Variable);
                value = isReference ? valueReference.getValue() : valueReference;

                function dump(value, depth, isReference) {
                    var currentIndentation = new Array(depth).join('  '),
                        names,
                        nativeValue,
                        nextIndentation = new Array(depth + 1).join('  '),
                        representation = currentIndentation;

                    if (objects.indexOf(value) > -1) {
                        representation += '*RECURSION*';
                        return representation + '\n';
                    }

                    if (isReference) {
                        objects.push(value);
                        representation += '&';
                    }

                    switch (value.getType()) {
                    case 'array':
                        representation += 'array(' + value.getLength() + ') {\n';

                        util.each(value.getKeys(), function (key) {
                            var element = value.getElementByKey(key);
                            representation += nextIndentation + '[' + JSON.stringify(key.getNative()) + ']=>\n' + dump(element.getValue(), depth + 1, element.isReference());
                        });

                        representation += currentIndentation + '}';
                        break;
                    case 'boolean':
                        representation += 'bool(' + (value.getNative() ? 'true' : 'false') + ')';
                        break;
                    case 'float':
                        representation += 'float(' + value.getNative() + ')';
                        break;
                    case 'integer':
                        representation += 'int(' + value.getNative() + ')';
                        break;
                    case 'null':
                        representation += 'NULL';
                        break;
                    case 'object':
                        names = value.getInstancePropertyNames();

                        representation += 'object(' + value.getClassName() + ')#' + value.getID() + ' (' + names.length + ') {\n';

                        objects.push(value);

                        util.each(names, function (nameValue) {
                            var property = value.getInstancePropertyByName(nameValue);
                            representation += nextIndentation +
                                '[' +
                                JSON.stringify(nameValue.getNative()) +
                                ']=>\n' +
                                dump(
                                    property.getValue(),
                                    depth + 1,
                                    property.isReference()
                                );
                        });

                        representation += currentIndentation + '}';
                        break;
                    case 'string':
                        nativeValue = value.getNative();
                        representation += 'string(' + nativeValue.length + ') "' + nativeValue + '"';
                        break;
                    }

                    return representation + '\n';
                }

                stdout.write(dump(value, 1));
            }
        };
    };}());

},{"./../../../../../js/util":51,"./../../Error":61,"./../../Variable":87}],99:[function(require,module,exports){
/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
(function () {'use strict';
module.exports = {
        normalizeModulePath: function (path) {
            return path || '(program)';
        }
    };}());

},{}],100:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":101}],101:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],102:[function(require,module,exports){
(function (global){
/*
  Copyright (C) 2012-2014 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2015 Ingvar Stepanyan <me@rreverser.com>
  Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>
  Copyright (C) 2012-2013 Michael Ficarra <escodegen.copyright@michael.ficarra.me>
  Copyright (C) 2012-2013 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2013 Irakli Gozalishvili <rfobic@gmail.com>
  Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
  Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
  Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*global exports:true, require:true, global:true*/
(function () {
    'use strict';

    var Syntax,
        Precedence,
        BinaryPrecedence,
        SourceNode,
        estraverse,
        esutils,
        isArray,
        base,
        indent,
        json,
        renumber,
        hexadecimal,
        quotes,
        escapeless,
        newline,
        space,
        parentheses,
        semicolons,
        safeConcatenation,
        directive,
        extra,
        parse,
        sourceMap,
        sourceCode,
        preserveBlankLines,
        FORMAT_MINIFY,
        FORMAT_DEFAULTS;

    estraverse = require('estraverse');
    esutils = require('esutils');

    Syntax = estraverse.Syntax;

    // Generation is done by generateExpression.
    function isExpression(node) {
        return CodeGenerator.Expression.hasOwnProperty(node.type);
    }

    // Generation is done by generateStatement.
    function isStatement(node) {
        return CodeGenerator.Statement.hasOwnProperty(node.type);
    }

    Precedence = {
        Sequence: 0,
        Yield: 1,
        Await: 1,
        Assignment: 1,
        Conditional: 2,
        ArrowFunction: 2,
        LogicalOR: 3,
        LogicalAND: 4,
        BitwiseOR: 5,
        BitwiseXOR: 6,
        BitwiseAND: 7,
        Equality: 8,
        Relational: 9,
        BitwiseSHIFT: 10,
        Additive: 11,
        Multiplicative: 12,
        Unary: 13,
        Postfix: 14,
        Call: 15,
        New: 16,
        TaggedTemplate: 17,
        Member: 18,
        Primary: 19
    };

    BinaryPrecedence = {
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        'is': Precedence.Equality,
        'isnt': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative
    };

    //Flags
    var F_ALLOW_IN = 1,
        F_ALLOW_CALL = 1 << 1,
        F_ALLOW_UNPARATH_NEW = 1 << 2,
        F_FUNC_BODY = 1 << 3,
        F_DIRECTIVE_CTX = 1 << 4,
        F_SEMICOLON_OPT = 1 << 5;

    //Expression flag sets
    //NOTE: Flag order:
    // F_ALLOW_IN
    // F_ALLOW_CALL
    // F_ALLOW_UNPARATH_NEW
    var E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
        E_TTF = F_ALLOW_IN | F_ALLOW_CALL,
        E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
        E_TFF = F_ALLOW_IN,
        E_FFT = F_ALLOW_UNPARATH_NEW,
        E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;

    //Statement flag sets
    //NOTE: Flag order:
    // F_ALLOW_IN
    // F_FUNC_BODY
    // F_DIRECTIVE_CTX
    // F_SEMICOLON_OPT
    var S_TFFF = F_ALLOW_IN,
        S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT,
        S_FFFF = 0x00,
        S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX,
        S_TTFF = F_ALLOW_IN | F_FUNC_BODY;

    function getDefaultOptions() {
        // default options
        return {
            indent: null,
            base: null,
            parse: null,
            comment: false,
            format: {
                indent: {
                    style: '    ',
                    base: 0,
                    adjustMultilineComment: false
                },
                newline: '\n',
                space: ' ',
                json: false,
                renumber: false,
                hexadecimal: false,
                quotes: 'single',
                escapeless: false,
                compact: false,
                parentheses: true,
                semicolons: true,
                safeConcatenation: false,
                preserveBlankLines: false
            },
            moz: {
                comprehensionExpressionStartsWithAssignment: false,
                starlessGenerator: false
            },
            sourceMap: null,
            sourceMapRoot: null,
            sourceMapWithCode: false,
            directive: false,
            raw: true,
            verbatim: null,
            sourceCode: null
        };
    }

    function stringRepeat(str, num) {
        var result = '';

        for (num |= 0; num > 0; num >>>= 1, str += str) {
            if (num & 1) {
                result += str;
            }
        }

        return result;
    }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    function hasLineTerminator(str) {
        return (/[\r\n]/g).test(str);
    }

    function endsWithLineTerminator(str) {
        var len = str.length;
        return len && esutils.code.isLineTerminator(str.charCodeAt(len - 1));
    }

    function merge(target, override) {
        var key;
        for (key in override) {
            if (override.hasOwnProperty(key)) {
                target[key] = override[key];
            }
        }
        return target;
    }

    function updateDeeply(target, override) {
        var key, val;

        function isHashObject(target) {
            return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
        }

        for (key in override) {
            if (override.hasOwnProperty(key)) {
                val = override[key];
                if (isHashObject(val)) {
                    if (isHashObject(target[key])) {
                        updateDeeply(target[key], val);
                    } else {
                        target[key] = updateDeeply({}, val);
                    }
                } else {
                    target[key] = val;
                }
            }
        }
        return target;
    }

    function generateNumber(value) {
        var result, point, temp, exponent, pos;

        if (value !== value) {
            throw new Error('Numeric literal whose value is NaN');
        }
        if (value < 0 || (value === 0 && 1 / value < 0)) {
            throw new Error('Numeric literal whose value is negative');
        }

        if (value === 1 / 0) {
            return json ? 'null' : renumber ? '1e400' : '1e+400';
        }

        result = '' + value;
        if (!renumber || result.length < 3) {
            return result;
        }

        point = result.indexOf('.');
        if (!json && result.charCodeAt(0) === 0x30  /* 0 */ && point === 1) {
            point = 0;
            result = result.slice(1);
        }
        temp = result;
        result = result.replace('e+', 'e');
        exponent = 0;
        if ((pos = temp.indexOf('e')) > 0) {
            exponent = +temp.slice(pos + 1);
            temp = temp.slice(0, pos);
        }
        if (point >= 0) {
            exponent -= temp.length - point - 1;
            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
        }
        pos = 0;
        while (temp.charCodeAt(temp.length + pos - 1) === 0x30  /* 0 */) {
            --pos;
        }
        if (pos !== 0) {
            exponent -= pos;
            temp = temp.slice(0, pos);
        }
        if (exponent !== 0) {
            temp += 'e' + exponent;
        }
        if ((temp.length < result.length ||
                    (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&
                +temp === value) {
            result = temp;
        }

        return result;
    }

    // Generate valid RegExp expression.
    // This function is based on https://github.com/Constellation/iv Engine

    function escapeRegExpCharacter(ch, previousIsBackslash) {
        // not handling '\' and handling \u2028 or \u2029 to unicode escape sequence
        if ((ch & ~1) === 0x2028) {
            return (previousIsBackslash ? 'u' : '\\u') + ((ch === 0x2028) ? '2028' : '2029');
        } else if (ch === 10 || ch === 13) {  // \n, \r
            return (previousIsBackslash ? '' : '\\') + ((ch === 10) ? 'n' : 'r');
        }
        return String.fromCharCode(ch);
    }

    function generateRegExp(reg) {
        var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;

        result = reg.toString();

        if (reg.source) {
            // extract flag from toString result
            match = result.match(/\/([^/]*)$/);
            if (!match) {
                return result;
            }

            flags = match[1];
            result = '';

            characterInBrack = false;
            previousIsBackslash = false;
            for (i = 0, iz = reg.source.length; i < iz; ++i) {
                ch = reg.source.charCodeAt(i);

                if (!previousIsBackslash) {
                    if (characterInBrack) {
                        if (ch === 93) {  // ]
                            characterInBrack = false;
                        }
                    } else {
                        if (ch === 47) {  // /
                            result += '\\';
                        } else if (ch === 91) {  // [
                            characterInBrack = true;
                        }
                    }
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    previousIsBackslash = ch === 92;  // \
                } else {
                    // if new RegExp("\\\n') is provided, create /\n/
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    // prevent like /\\[/]/
                    previousIsBackslash = false;
                }
            }

            return '/' + result + '/' + flags;
        }

        return result;
    }

    function escapeAllowedCharacter(code, next) {
        var hex;

        if (code === 0x08  /* \b */) {
            return '\\b';
        }

        if (code === 0x0C  /* \f */) {
            return '\\f';
        }

        if (code === 0x09  /* \t */) {
            return '\\t';
        }

        hex = code.toString(16).toUpperCase();
        if (json || code > 0xFF) {
            return '\\u' + '0000'.slice(hex.length) + hex;
        } else if (code === 0x0000 && !esutils.code.isDecimalDigit(next)) {
            return '\\0';
        } else if (code === 0x000B  /* \v */) { // '\v'
            return '\\x0B';
        } else {
            return '\\x' + '00'.slice(hex.length) + hex;
        }
    }

    function escapeDisallowedCharacter(code) {
        if (code === 0x5C  /* \ */) {
            return '\\\\';
        }

        if (code === 0x0A  /* \n */) {
            return '\\n';
        }

        if (code === 0x0D  /* \r */) {
            return '\\r';
        }

        if (code === 0x2028) {
            return '\\u2028';
        }

        if (code === 0x2029) {
            return '\\u2029';
        }

        throw new Error('Incorrectly classified character');
    }

    function escapeDirective(str) {
        var i, iz, code, quote;

        quote = quotes === 'double' ? '"' : '\'';
        for (i = 0, iz = str.length; i < iz; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27  /* ' */) {
                quote = '"';
                break;
            } else if (code === 0x22  /* " */) {
                quote = '\'';
                break;
            } else if (code === 0x5C  /* \ */) {
                ++i;
            }
        }

        return quote + str + quote;
    }

    function escapeString(str) {
        var result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;

        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27  /* ' */) {
                ++singleQuotes;
            } else if (code === 0x22  /* " */) {
                ++doubleQuotes;
            } else if (code === 0x2F  /* / */ && json) {
                result += '\\';
            } else if (esutils.code.isLineTerminator(code) || code === 0x5C  /* \ */) {
                result += escapeDisallowedCharacter(code);
                continue;
            } else if ((json && code < 0x20  /* SP */) || !(json || escapeless || (code >= 0x20  /* SP */ && code <= 0x7E  /* ~ */))) {
                result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
                continue;
            }
            result += String.fromCharCode(code);
        }

        single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
        quote = single ? '\'' : '"';

        if (!(single ? singleQuotes : doubleQuotes)) {
            return quote + result + quote;
        }

        str = result;
        result = quote;

        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if ((code === 0x27  /* ' */ && single) || (code === 0x22  /* " */ && !single)) {
                result += '\\';
            }
            result += String.fromCharCode(code);
        }

        return result + quote;
    }

    /**
     * flatten an array to a string, where the array can contain
     * either strings or nested arrays
     */
    function flattenToString(arr) {
        var i, iz, elem, result = '';
        for (i = 0, iz = arr.length; i < iz; ++i) {
            elem = arr[i];
            result += isArray(elem) ? flattenToString(elem) : elem;
        }
        return result;
    }

    /**
     * convert generated to a SourceNode when source maps are enabled.
     */
    function toSourceNodeWhenNeeded(generated, node) {
        if (!sourceMap) {
            // with no source maps, generated is either an
            // array or a string.  if an array, flatten it.
            // if a string, just return it
            if (isArray(generated)) {
                return flattenToString(generated);
            } else {
                return generated;
            }
        }
        if (node == null) {
            if (generated instanceof SourceNode) {
                return generated;
            } else {
                node = {};
            }
        }
        if (node.loc == null) {
            return new SourceNode(null, null, sourceMap, generated, node.name || null);
        }
        return new SourceNode(node.loc.start.line, node.loc.start.column, (sourceMap === true ? node.loc.source || null : sourceMap), generated, node.name || null);
    }

    function noEmptySpace() {
        return (space) ? space : ' ';
    }

    function join(left, right) {
        var leftSource,
            rightSource,
            leftCharCode,
            rightCharCode;

        leftSource = toSourceNodeWhenNeeded(left).toString();
        if (leftSource.length === 0) {
            return [right];
        }

        rightSource = toSourceNodeWhenNeeded(right).toString();
        if (rightSource.length === 0) {
            return [left];
        }

        leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
        rightCharCode = rightSource.charCodeAt(0);

        if ((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode ||
            esutils.code.isIdentifierPart(leftCharCode) && esutils.code.isIdentifierPart(rightCharCode) ||
            leftCharCode === 0x2F  /* / */ && rightCharCode === 0x69  /* i */) { // infix word operators all start with `i`
            return [left, noEmptySpace(), right];
        } else if (esutils.code.isWhiteSpace(leftCharCode) || esutils.code.isLineTerminator(leftCharCode) ||
                esutils.code.isWhiteSpace(rightCharCode) || esutils.code.isLineTerminator(rightCharCode)) {
            return [left, right];
        }
        return [left, space, right];
    }

    function addIndent(stmt) {
        return [base, stmt];
    }

    function withIndent(fn) {
        var previousBase;
        previousBase = base;
        base += indent;
        fn(base);
        base = previousBase;
    }

    function calculateSpaces(str) {
        var i;
        for (i = str.length - 1; i >= 0; --i) {
            if (esutils.code.isLineTerminator(str.charCodeAt(i))) {
                break;
            }
        }
        return (str.length - 1) - i;
    }

    function adjustMultilineComment(value, specialBase) {
        var array, i, len, line, j, spaces, previousBase, sn;

        array = value.split(/\r\n|[\r\n]/);
        spaces = Number.MAX_VALUE;

        // first line doesn't have indentation
        for (i = 1, len = array.length; i < len; ++i) {
            line = array[i];
            j = 0;
            while (j < line.length && esutils.code.isWhiteSpace(line.charCodeAt(j))) {
                ++j;
            }
            if (spaces > j) {
                spaces = j;
            }
        }

        if (typeof specialBase !== 'undefined') {
            // pattern like
            // {
            //   var t = 20;  /*
            //                 * this is comment
            //                 */
            // }
            previousBase = base;
            if (array[1][spaces] === '*') {
                specialBase += ' ';
            }
            base = specialBase;
        } else {
            if (spaces & 1) {
                // /*
                //  *
                //  */
                // If spaces are odd number, above pattern is considered.
                // We waste 1 space.
                --spaces;
            }
            previousBase = base;
        }

        for (i = 1, len = array.length; i < len; ++i) {
            sn = toSourceNodeWhenNeeded(addIndent(array[i].slice(spaces)));
            array[i] = sourceMap ? sn.join('') : sn;
        }

        base = previousBase;

        return array.join('\n');
    }

    function generateComment(comment, specialBase) {
        if (comment.type === 'Line') {
            if (endsWithLineTerminator(comment.value)) {
                return '//' + comment.value;
            } else {
                // Always use LineTerminator
                var result = '//' + comment.value;
                if (!preserveBlankLines) {
                    result += '\n';
                }
                return result;
            }
        }
        if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
            return adjustMultilineComment('/*' + comment.value + '*/', specialBase);
        }
        return '/*' + comment.value + '*/';
    }

    function addComments(stmt, result) {
        var i, len, comment, save, tailingToStatement, specialBase, fragment,
            extRange, range, prevRange, prefix, infix, suffix, count;

        if (stmt.leadingComments && stmt.leadingComments.length > 0) {
            save = result;

            if (preserveBlankLines) {
                comment = stmt.leadingComments[0];
                result = [];

                extRange = comment.extendedRange;
                range = comment.range;

                prefix = sourceCode.substring(extRange[0], range[0]);
                count = (prefix.match(/\n/g) || []).length;
                if (count > 0) {
                    result.push(stringRepeat('\n', count));
                    result.push(addIndent(generateComment(comment)));
                } else {
                    result.push(prefix);
                    result.push(generateComment(comment));
                }

                prevRange = range;

                for (i = 1, len = stmt.leadingComments.length; i < len; i++) {
                    comment = stmt.leadingComments[i];
                    range = comment.range;

                    infix = sourceCode.substring(prevRange[1], range[0]);
                    count = (infix.match(/\n/g) || []).length;
                    result.push(stringRepeat('\n', count));
                    result.push(addIndent(generateComment(comment)));

                    prevRange = range;
                }

                suffix = sourceCode.substring(range[1], extRange[1]);
                count = (suffix.match(/\n/g) || []).length;
                result.push(stringRepeat('\n', count));
            } else {
                comment = stmt.leadingComments[0];
                result = [];
                if (safeConcatenation && stmt.type === Syntax.Program && stmt.body.length === 0) {
                    result.push('\n');
                }
                result.push(generateComment(comment));
                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                    result.push('\n');
                }

                for (i = 1, len = stmt.leadingComments.length; i < len; ++i) {
                    comment = stmt.leadingComments[i];
                    fragment = [generateComment(comment)];
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                        fragment.push('\n');
                    }
                    result.push(addIndent(fragment));
                }
            }

            result.push(addIndent(save));
        }

        if (stmt.trailingComments) {

            if (preserveBlankLines) {
                comment = stmt.trailingComments[0];
                extRange = comment.extendedRange;
                range = comment.range;

                prefix = sourceCode.substring(extRange[0], range[0]);
                count = (prefix.match(/\n/g) || []).length;

                if (count > 0) {
                    result.push(stringRepeat('\n', count));
                    result.push(addIndent(generateComment(comment)));
                } else {
                    result.push(prefix);
                    result.push(generateComment(comment));
                }
            } else {
                tailingToStatement = !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
                specialBase = stringRepeat(' ', calculateSpaces(toSourceNodeWhenNeeded([base, result, indent]).toString()));
                for (i = 0, len = stmt.trailingComments.length; i < len; ++i) {
                    comment = stmt.trailingComments[i];
                    if (tailingToStatement) {
                        // We assume target like following script
                        //
                        // var t = 20;  /**
                        //               * This is comment of t
                        //               */
                        if (i === 0) {
                            // first case
                            result = [result, indent];
                        } else {
                            result = [result, specialBase];
                        }
                        result.push(generateComment(comment, specialBase));
                    } else {
                        result = [result, addIndent(generateComment(comment))];
                    }
                    if (i !== len - 1 && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                        result = [result, '\n'];
                    }
                }
            }
        }

        return result;
    }

    function generateBlankLines(start, end, result) {
        var j, newlineCount = 0;

        for (j = start; j < end; j++) {
            if (sourceCode[j] === '\n') {
                newlineCount++;
            }
        }

        for (j = 1; j < newlineCount; j++) {
            result.push(newline);
        }
    }

    function parenthesize(text, current, should) {
        if (current < should) {
            return ['(', text, ')'];
        }
        return text;
    }

    function generateVerbatimString(string) {
        var i, iz, result;
        result = string.split(/\r\n|\n/);
        for (i = 1, iz = result.length; i < iz; i++) {
            result[i] = newline + base + result[i];
        }
        return result;
    }

    function generateVerbatim(expr, precedence) {
        var verbatim, result, prec;
        verbatim = expr[extra.verbatim];

        if (typeof verbatim === 'string') {
            result = parenthesize(generateVerbatimString(verbatim), Precedence.Sequence, precedence);
        } else {
            // verbatim is object
            result = generateVerbatimString(verbatim.content);
            prec = (verbatim.precedence != null) ? verbatim.precedence : Precedence.Sequence;
            result = parenthesize(result, prec, precedence);
        }

        return toSourceNodeWhenNeeded(result, expr);
    }

    function CodeGenerator() {
    }

    // Helpers.

    CodeGenerator.prototype.maybeBlock = function(stmt, flags) {
        var result, noLeadingComment, that = this;

        noLeadingComment = !extra.comment || !stmt.leadingComments;

        if (stmt.type === Syntax.BlockStatement && noLeadingComment) {
            return [space, this.generateStatement(stmt, flags)];
        }

        if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {
            return ';';
        }

        withIndent(function () {
            result = [
                newline,
                addIndent(that.generateStatement(stmt, flags))
            ];
        });

        return result;
    };

    CodeGenerator.prototype.maybeBlockSuffix = function (stmt, result) {
        var ends = endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) {
            return [result, space];
        }
        if (ends) {
            return [result, base];
        }
        return [result, newline, base];
    };

    function generateIdentifier(node) {
        return toSourceNodeWhenNeeded(node.name, node);
    }

    function generateAsyncPrefix(node, spaceRequired) {
        return node.async ? 'async' + (spaceRequired ? noEmptySpace() : space) : '';
    }

    function generateStarSuffix(node) {
        var isGenerator = node.generator && !extra.moz.starlessGenerator;
        return isGenerator ? '*' + space : '';
    }

    function generateMethodPrefix(prop) {
        var func = prop.value;
        if (func.async) {
            return generateAsyncPrefix(func, !prop.computed);
        } else {
            // avoid space before method name
            return generateStarSuffix(func) ? '*' : '';
        }
    }

    CodeGenerator.prototype.generatePattern = function (node, precedence, flags) {
        if (node.type === Syntax.Identifier) {
            return generateIdentifier(node);
        }
        return this.generateExpression(node, precedence, flags);
    };

    CodeGenerator.prototype.generateFunctionParams = function (node) {
        var i, iz, result, hasDefault;

        hasDefault = false;

        if (node.type === Syntax.ArrowFunctionExpression &&
                !node.rest && (!node.defaults || node.defaults.length === 0) &&
                node.params.length === 1 && node.params[0].type === Syntax.Identifier) {
            // arg => { } case
            result = [generateAsyncPrefix(node, true), generateIdentifier(node.params[0])];
        } else {
            result = node.type === Syntax.ArrowFunctionExpression ? [generateAsyncPrefix(node, false)] : [];
            result.push('(');
            if (node.defaults) {
                hasDefault = true;
            }
            for (i = 0, iz = node.params.length; i < iz; ++i) {
                if (hasDefault && node.defaults[i]) {
                    // Handle default values.
                    result.push(this.generateAssignment(node.params[i], node.defaults[i], '=', Precedence.Assignment, E_TTT));
                } else {
                    result.push(this.generatePattern(node.params[i], Precedence.Assignment, E_TTT));
                }
                if (i + 1 < iz) {
                    result.push(',' + space);
                }
            }

            if (node.rest) {
                if (node.params.length) {
                    result.push(',' + space);
                }
                result.push('...');
                result.push(generateIdentifier(node.rest));
            }

            result.push(')');
        }

        return result;
    };

    CodeGenerator.prototype.generateFunctionBody = function (node) {
        var result, expr;

        result = this.generateFunctionParams(node);

        if (node.type === Syntax.ArrowFunctionExpression) {
            result.push(space);
            result.push('=>');
        }

        if (node.expression) {
            result.push(space);
            expr = this.generateExpression(node.body, Precedence.Assignment, E_TTT);
            if (expr.toString().charAt(0) === '{') {
                expr = ['(', expr, ')'];
            }
            result.push(expr);
        } else {
            result.push(this.maybeBlock(node.body, S_TTFF));
        }

        return result;
    };

    CodeGenerator.prototype.generateIterationForStatement = function (operator, stmt, flags) {
        var result = ['for' + space + '('], that = this;
        withIndent(function () {
            if (stmt.left.type === Syntax.VariableDeclaration) {
                withIndent(function () {
                    result.push(stmt.left.kind + noEmptySpace());
                    result.push(that.generateStatement(stmt.left.declarations[0], S_FFFF));
                });
            } else {
                result.push(that.generateExpression(stmt.left, Precedence.Call, E_TTT));
            }

            result = join(result, operator);
            result = [join(
                result,
                that.generateExpression(stmt.right, Precedence.Sequence, E_TTT)
            ), ')'];
        });
        result.push(this.maybeBlock(stmt.body, flags));
        return result;
    };

    CodeGenerator.prototype.generatePropertyKey = function (expr, computed) {
        var result = [];

        if (computed) {
            result.push('[');
        }

        result.push(this.generateExpression(expr, Precedence.Sequence, E_TTT));
        if (computed) {
            result.push(']');
        }

        return result;
    };

    CodeGenerator.prototype.generateAssignment = function (left, right, operator, precedence, flags) {
        if (Precedence.Assignment < precedence) {
            flags |= F_ALLOW_IN;
        }

        return parenthesize(
            [
                this.generateExpression(left, Precedence.Call, flags),
                space + operator + space,
                this.generateExpression(right, Precedence.Assignment, flags)
            ],
            Precedence.Assignment,
            precedence
        );
    };

    CodeGenerator.prototype.semicolon = function (flags) {
        if (!semicolons && flags & F_SEMICOLON_OPT) {
            return '';
        }
        return ';';
    };

    // Statements.

    CodeGenerator.Statement = {

        BlockStatement: function (stmt, flags) {
            var range, content, result = ['{', newline], that = this;

            withIndent(function () {
                // handle functions without any code
                if (stmt.body.length === 0 && preserveBlankLines) {
                    range = stmt.range;
                    if (range[1] - range[0] > 2) {
                        content = sourceCode.substring(range[0] + 1, range[1] - 1);
                        if (content[0] === '\n') {
                            result = ['{'];
                        }
                        result.push(content);
                    }
                }

                var i, iz, fragment, bodyFlags;
                bodyFlags = S_TFFF;
                if (flags & F_FUNC_BODY) {
                    bodyFlags |= F_DIRECTIVE_CTX;
                }

                for (i = 0, iz = stmt.body.length; i < iz; ++i) {
                    if (preserveBlankLines) {
                        // handle spaces before the first line
                        if (i === 0) {
                            if (stmt.body[0].leadingComments) {
                                range = stmt.body[0].leadingComments[0].extendedRange;
                                content = sourceCode.substring(range[0], range[1]);
                                if (content[0] === '\n') {
                                    result = ['{'];
                                }
                            }
                            if (!stmt.body[0].leadingComments) {
                                generateBlankLines(stmt.range[0], stmt.body[0].range[0], result);
                            }
                        }

                        // handle spaces between lines
                        if (i > 0) {
                            if (!stmt.body[i - 1].trailingComments  && !stmt.body[i].leadingComments) {
                                generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
                            }
                        }
                    }

                    if (i === iz - 1) {
                        bodyFlags |= F_SEMICOLON_OPT;
                    }

                    if (stmt.body[i].leadingComments && preserveBlankLines) {
                        fragment = that.generateStatement(stmt.body[i], bodyFlags);
                    } else {
                        fragment = addIndent(that.generateStatement(stmt.body[i], bodyFlags));
                    }

                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                        if (preserveBlankLines && i < iz - 1) {
                            // don't add a new line if there are leading coments
                            // in the next statement
                            if (!stmt.body[i + 1].leadingComments) {
                                result.push(newline);
                            }
                        } else {
                            result.push(newline);
                        }
                    }

                    if (preserveBlankLines) {
                        // handle spaces after the last line
                        if (i === iz - 1) {
                            if (!stmt.body[i].trailingComments) {
                                generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
                            }
                        }
                    }
                }
            });

            result.push(addIndent('}'));
            return result;
        },

        BreakStatement: function (stmt, flags) {
            if (stmt.label) {
                return 'break ' + stmt.label.name + this.semicolon(flags);
            }
            return 'break' + this.semicolon(flags);
        },

        ContinueStatement: function (stmt, flags) {
            if (stmt.label) {
                return 'continue ' + stmt.label.name + this.semicolon(flags);
            }
            return 'continue' + this.semicolon(flags);
        },

        ClassBody: function (stmt, flags) {
            var result = [ '{', newline], that = this;

            withIndent(function (indent) {
                var i, iz;

                for (i = 0, iz = stmt.body.length; i < iz; ++i) {
                    result.push(indent);
                    result.push(that.generateExpression(stmt.body[i], Precedence.Sequence, E_TTT));
                    if (i + 1 < iz) {
                        result.push(newline);
                    }
                }
            });

            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
            }
            result.push(base);
            result.push('}');
            return result;
        },

        ClassDeclaration: function (stmt, flags) {
            var result, fragment;
            result  = ['class ' + stmt.id.name];
            if (stmt.superClass) {
                fragment = join('extends', this.generateExpression(stmt.superClass, Precedence.Assignment, E_TTT));
                result = join(result, fragment);
            }
            result.push(space);
            result.push(this.generateStatement(stmt.body, S_TFFT));
            return result;
        },

        DirectiveStatement: function (stmt, flags) {
            if (extra.raw && stmt.raw) {
                return stmt.raw + this.semicolon(flags);
            }
            return escapeDirective(stmt.directive) + this.semicolon(flags);
        },

        DoWhileStatement: function (stmt, flags) {
            // Because `do 42 while (cond)` is Syntax Error. We need semicolon.
            var result = join('do', this.maybeBlock(stmt.body, S_TFFF));
            result = this.maybeBlockSuffix(stmt.body, result);
            return join(result, [
                'while' + space + '(',
                this.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
                ')' + this.semicolon(flags)
            ]);
        },

        CatchClause: function (stmt, flags) {
            var result, that = this;
            withIndent(function () {
                var guard;

                result = [
                    'catch' + space + '(',
                    that.generateExpression(stmt.param, Precedence.Sequence, E_TTT),
                    ')'
                ];

                if (stmt.guard) {
                    guard = that.generateExpression(stmt.guard, Precedence.Sequence, E_TTT);
                    result.splice(2, 0, ' if ', guard);
                }
            });
            result.push(this.maybeBlock(stmt.body, S_TFFF));
            return result;
        },

        DebuggerStatement: function (stmt, flags) {
            return 'debugger' + this.semicolon(flags);
        },

        EmptyStatement: function (stmt, flags) {
            return ';';
        },

        ExportDeclaration: function (stmt, flags) {
            var result = [ 'export' ], bodyFlags, that = this;

            bodyFlags = (flags & F_SEMICOLON_OPT) ? S_TFFT : S_TFFF;

            // export default HoistableDeclaration[Default]
            // export default AssignmentExpression[In] ;
            if (stmt['default']) {
                result = join(result, 'default');
                if (isStatement(stmt.declaration)) {
                    result = join(result, this.generateStatement(stmt.declaration, bodyFlags));
                } else {
                    result = join(result, this.generateExpression(stmt.declaration, Precedence.Assignment, E_TTT) + this.semicolon(flags));
                }
                return result;
            }

            // export VariableStatement
            // export Declaration[Default]
            if (stmt.declaration) {
                return join(result, this.generateStatement(stmt.declaration, bodyFlags));
            }

            // export * FromClause ;
            // export ExportClause[NoReference] FromClause ;
            // export ExportClause ;
            if (stmt.specifiers) {
                if (stmt.specifiers.length === 0) {
                    result = join(result, '{' + space + '}');
                } else if (stmt.specifiers[0].type === Syntax.ExportBatchSpecifier) {
                    result = join(result, this.generateExpression(stmt.specifiers[0], Precedence.Sequence, E_TTT));
                } else {
                    result = join(result, '{');
                    withIndent(function (indent) {
                        var i, iz;
                        result.push(newline);
                        for (i = 0, iz = stmt.specifiers.length; i < iz; ++i) {
                            result.push(indent);
                            result.push(that.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                            if (i + 1 < iz) {
                                result.push(',' + newline);
                            }
                        }
                    });
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                        result.push(newline);
                    }
                    result.push(base + '}');
                }

                if (stmt.source) {
                    result = join(result, [
                        'from' + space,
                        // ModuleSpecifier
                        this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                        this.semicolon(flags)
                    ]);
                } else {
                    result.push(this.semicolon(flags));
                }
            }
            return result;
        },

        ExpressionStatement: function (stmt, flags) {
            var result, fragment;

            function isClassPrefixed(fragment) {
                var code;
                if (fragment.slice(0, 5) !== 'class') {
                    return false;
                }
                code = fragment.charCodeAt(5);
                return code === 0x7B  /* '{' */ || esutils.code.isWhiteSpace(code) || esutils.code.isLineTerminator(code);
            }

            function isFunctionPrefixed(fragment) {
                var code;
                if (fragment.slice(0, 8) !== 'function') {
                    return false;
                }
                code = fragment.charCodeAt(8);
                return code === 0x28 /* '(' */ || esutils.code.isWhiteSpace(code) || code === 0x2A  /* '*' */ || esutils.code.isLineTerminator(code);
            }

            function isAsyncPrefixed(fragment) {
                var code, i, iz;
                if (fragment.slice(0, 5) !== 'async') {
                    return false;
                }
                if (!esutils.code.isWhiteSpace(fragment.charCodeAt(5))) {
                    return false;
                }
                for (i = 6, iz = fragment.length; i < iz; ++i) {
                    if (!esutils.code.isWhiteSpace(fragment.charCodeAt(i))) {
                        break;
                    }
                }
                if (i === iz) {
                    return false;
                }
                if (fragment.slice(i, i + 8) !== 'function') {
                    return false;
                }
                code = fragment.charCodeAt(i + 8);
                return code === 0x28 /* '(' */ || esutils.code.isWhiteSpace(code) || code === 0x2A  /* '*' */ || esutils.code.isLineTerminator(code);
            }

            result = [this.generateExpression(stmt.expression, Precedence.Sequence, E_TTT)];
            // 12.4 '{', 'function', 'class' is not allowed in this position.
            // wrap expression with parentheses
            fragment = toSourceNodeWhenNeeded(result).toString();
            if (fragment.charCodeAt(0) === 0x7B  /* '{' */ ||  // ObjectExpression
                    isClassPrefixed(fragment) ||
                    isFunctionPrefixed(fragment) ||
                    isAsyncPrefixed(fragment) ||
                    (directive && (flags & F_DIRECTIVE_CTX) && stmt.expression.type === Syntax.Literal && typeof stmt.expression.value === 'string')) {
                result = ['(', result, ')' + this.semicolon(flags)];
            } else {
                result.push(this.semicolon(flags));
            }
            return result;
        },

        ImportDeclaration: function (stmt, flags) {
            // ES6: 15.2.1 valid import declarations:
            //     - import ImportClause FromClause ;
            //     - import ModuleSpecifier ;
            var result, cursor, that = this;

            // If no ImportClause is present,
            // this should be `import ModuleSpecifier` so skip `from`
            // ModuleSpecifier is StringLiteral.
            if (stmt.specifiers.length === 0) {
                // import ModuleSpecifier ;
                return [
                    'import',
                    space,
                    // ModuleSpecifier
                    this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                    this.semicolon(flags)
                ];
            }

            // import ImportClause FromClause ;
            result = [
                'import'
            ];
            cursor = 0;

            // ImportedBinding
            if (stmt.specifiers[cursor].type === Syntax.ImportDefaultSpecifier) {
                result = join(result, [
                        this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)
                ]);
                ++cursor;
            }

            if (stmt.specifiers[cursor]) {
                if (cursor !== 0) {
                    result.push(',');
                }

                if (stmt.specifiers[cursor].type === Syntax.ImportNamespaceSpecifier) {
                    // NameSpaceImport
                    result = join(result, [
                            space,
                            this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)
                    ]);
                } else {
                    // NamedImports
                    result.push(space + '{');

                    if ((stmt.specifiers.length - cursor) === 1) {
                        // import { ... } from "...";
                        result.push(space);
                        result.push(this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT));
                        result.push(space + '}' + space);
                    } else {
                        // import {
                        //    ...,
                        //    ...,
                        // } from "...";
                        withIndent(function (indent) {
                            var i, iz;
                            result.push(newline);
                            for (i = cursor, iz = stmt.specifiers.length; i < iz; ++i) {
                                result.push(indent);
                                result.push(that.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                                if (i + 1 < iz) {
                                    result.push(',' + newline);
                                }
                            }
                        });
                        if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                            result.push(newline);
                        }
                        result.push(base + '}' + space);
                    }
                }
            }

            result = join(result, [
                'from' + space,
                // ModuleSpecifier
                this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                this.semicolon(flags)
            ]);
            return result;
        },

        VariableDeclarator: function (stmt, flags) {
            var itemFlags = (flags & F_ALLOW_IN) ? E_TTT : E_FTT;
            if (stmt.init) {
                return [
                    this.generateExpression(stmt.id, Precedence.Assignment, itemFlags),
                    space,
                    '=',
                    space,
                    this.generateExpression(stmt.init, Precedence.Assignment, itemFlags)
                ];
            }
            return this.generatePattern(stmt.id, Precedence.Assignment, itemFlags);
        },

        VariableDeclaration: function (stmt, flags) {
            // VariableDeclarator is typed as Statement,
            // but joined with comma (not LineTerminator).
            // So if comment is attached to target node, we should specialize.
            var result, i, iz, node, bodyFlags, that = this;

            result = [ stmt.kind ];

            bodyFlags = (flags & F_ALLOW_IN) ? S_TFFF : S_FFFF;

            function block() {
                node = stmt.declarations[0];
                if (extra.comment && node.leadingComments) {
                    result.push('\n');
                    result.push(addIndent(that.generateStatement(node, bodyFlags)));
                } else {
                    result.push(noEmptySpace());
                    result.push(that.generateStatement(node, bodyFlags));
                }

                for (i = 1, iz = stmt.declarations.length; i < iz; ++i) {
                    node = stmt.declarations[i];
                    if (extra.comment && node.leadingComments) {
                        result.push(',' + newline);
                        result.push(addIndent(that.generateStatement(node, bodyFlags)));
                    } else {
                        result.push(',' + space);
                        result.push(that.generateStatement(node, bodyFlags));
                    }
                }
            }

            if (stmt.declarations.length > 1) {
                withIndent(block);
            } else {
                block();
            }

            result.push(this.semicolon(flags));

            return result;
        },

        ThrowStatement: function (stmt, flags) {
            return [join(
                'throw',
                this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)
            ), this.semicolon(flags)];
        },

        TryStatement: function (stmt, flags) {
            var result, i, iz, guardedHandlers;

            result = ['try', this.maybeBlock(stmt.block, S_TFFF)];
            result = this.maybeBlockSuffix(stmt.block, result);

            if (stmt.handlers) {
                // old interface
                for (i = 0, iz = stmt.handlers.length; i < iz; ++i) {
                    result = join(result, this.generateStatement(stmt.handlers[i], S_TFFF));
                    if (stmt.finalizer || i + 1 !== iz) {
                        result = this.maybeBlockSuffix(stmt.handlers[i].body, result);
                    }
                }
            } else {
                guardedHandlers = stmt.guardedHandlers || [];

                for (i = 0, iz = guardedHandlers.length; i < iz; ++i) {
                    result = join(result, this.generateStatement(guardedHandlers[i], S_TFFF));
                    if (stmt.finalizer || i + 1 !== iz) {
                        result = this.maybeBlockSuffix(guardedHandlers[i].body, result);
                    }
                }

                // new interface
                if (stmt.handler) {
                    if (isArray(stmt.handler)) {
                        for (i = 0, iz = stmt.handler.length; i < iz; ++i) {
                            result = join(result, this.generateStatement(stmt.handler[i], S_TFFF));
                            if (stmt.finalizer || i + 1 !== iz) {
                                result = this.maybeBlockSuffix(stmt.handler[i].body, result);
                            }
                        }
                    } else {
                        result = join(result, this.generateStatement(stmt.handler, S_TFFF));
                        if (stmt.finalizer) {
                            result = this.maybeBlockSuffix(stmt.handler.body, result);
                        }
                    }
                }
            }
            if (stmt.finalizer) {
                result = join(result, ['finally', this.maybeBlock(stmt.finalizer, S_TFFF)]);
            }
            return result;
        },

        SwitchStatement: function (stmt, flags) {
            var result, fragment, i, iz, bodyFlags, that = this;
            withIndent(function () {
                result = [
                    'switch' + space + '(',
                    that.generateExpression(stmt.discriminant, Precedence.Sequence, E_TTT),
                    ')' + space + '{' + newline
                ];
            });
            if (stmt.cases) {
                bodyFlags = S_TFFF;
                for (i = 0, iz = stmt.cases.length; i < iz; ++i) {
                    if (i === iz - 1) {
                        bodyFlags |= F_SEMICOLON_OPT;
                    }
                    fragment = addIndent(this.generateStatement(stmt.cases[i], bodyFlags));
                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                        result.push(newline);
                    }
                }
            }
            result.push(addIndent('}'));
            return result;
        },

        SwitchCase: function (stmt, flags) {
            var result, fragment, i, iz, bodyFlags, that = this;
            withIndent(function () {
                if (stmt.test) {
                    result = [
                        join('case', that.generateExpression(stmt.test, Precedence.Sequence, E_TTT)),
                        ':'
                    ];
                } else {
                    result = ['default:'];
                }

                i = 0;
                iz = stmt.consequent.length;
                if (iz && stmt.consequent[0].type === Syntax.BlockStatement) {
                    fragment = that.maybeBlock(stmt.consequent[0], S_TFFF);
                    result.push(fragment);
                    i = 1;
                }

                if (i !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                    result.push(newline);
                }

                bodyFlags = S_TFFF;
                for (; i < iz; ++i) {
                    if (i === iz - 1 && flags & F_SEMICOLON_OPT) {
                        bodyFlags |= F_SEMICOLON_OPT;
                    }
                    fragment = addIndent(that.generateStatement(stmt.consequent[i], bodyFlags));
                    result.push(fragment);
                    if (i + 1 !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                        result.push(newline);
                    }
                }
            });
            return result;
        },

        IfStatement: function (stmt, flags) {
            var result, bodyFlags, semicolonOptional, that = this;
            withIndent(function () {
                result = [
                    'if' + space + '(',
                    that.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
                    ')'
                ];
            });
            semicolonOptional = flags & F_SEMICOLON_OPT;
            bodyFlags = S_TFFF;
            if (semicolonOptional) {
                bodyFlags |= F_SEMICOLON_OPT;
            }
            if (stmt.alternate) {
                result.push(this.maybeBlock(stmt.consequent, S_TFFF));
                result = this.maybeBlockSuffix(stmt.consequent, result);
                if (stmt.alternate.type === Syntax.IfStatement) {
                    result = join(result, ['else ', this.generateStatement(stmt.alternate, bodyFlags)]);
                } else {
                    result = join(result, join('else', this.maybeBlock(stmt.alternate, bodyFlags)));
                }
            } else {
                result.push(this.maybeBlock(stmt.consequent, bodyFlags));
            }
            return result;
        },

        ForStatement: function (stmt, flags) {
            var result, that = this;
            withIndent(function () {
                result = ['for' + space + '('];
                if (stmt.init) {
                    if (stmt.init.type === Syntax.VariableDeclaration) {
                        result.push(that.generateStatement(stmt.init, S_FFFF));
                    } else {
                        // F_ALLOW_IN becomes false.
                        result.push(that.generateExpression(stmt.init, Precedence.Sequence, E_FTT));
                        result.push(';');
                    }
                } else {
                    result.push(';');
                }

                if (stmt.test) {
                    result.push(space);
                    result.push(that.generateExpression(stmt.test, Precedence.Sequence, E_TTT));
                    result.push(';');
                } else {
                    result.push(';');
                }

                if (stmt.update) {
                    result.push(space);
                    result.push(that.generateExpression(stmt.update, Precedence.Sequence, E_TTT));
                    result.push(')');
                } else {
                    result.push(')');
                }
            });

            result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
            return result;
        },

        ForInStatement: function (stmt, flags) {
            return this.generateIterationForStatement('in', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
        },

        ForOfStatement: function (stmt, flags) {
            return this.generateIterationForStatement('of', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
        },

        LabeledStatement: function (stmt, flags) {
            return [stmt.label.name + ':', this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF)];
        },

        Program: function (stmt, flags) {
            var result, fragment, i, iz, bodyFlags;
            iz = stmt.body.length;
            result = [safeConcatenation && iz > 0 ? '\n' : ''];
            bodyFlags = S_TFTF;
            for (i = 0; i < iz; ++i) {
                if (!safeConcatenation && i === iz - 1) {
                    bodyFlags |= F_SEMICOLON_OPT;
                }

                if (preserveBlankLines) {
                    // handle spaces before the first line
                    if (i === 0) {
                        if (!stmt.body[0].leadingComments) {
                            generateBlankLines(stmt.range[0], stmt.body[i].range[0], result);
                        }
                    }

                    // handle spaces between lines
                    if (i > 0) {
                        if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) {
                            generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
                        }
                    }
                }

                fragment = addIndent(this.generateStatement(stmt.body[i], bodyFlags));
                result.push(fragment);
                if (i + 1 < iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    if (preserveBlankLines) {
                        if (!stmt.body[i + 1].leadingComments) {
                            result.push(newline);
                        }
                    } else {
                        result.push(newline);
                    }
                }

                if (preserveBlankLines) {
                    // handle spaces after the last line
                    if (i === iz - 1) {
                        if (!stmt.body[i].trailingComments) {
                            generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
                        }
                    }
                }
            }
            return result;
        },

        FunctionDeclaration: function (stmt, flags) {
            return [
                generateAsyncPrefix(stmt, true),
                'function',
                generateStarSuffix(stmt) || noEmptySpace(),
                generateIdentifier(stmt.id),
                this.generateFunctionBody(stmt)
            ];
        },

        ReturnStatement: function (stmt, flags) {
            if (stmt.argument) {
                return [join(
                    'return',
                    this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)
                ), this.semicolon(flags)];
            }
            return ['return' + this.semicolon(flags)];
        },

        WhileStatement: function (stmt, flags) {
            var result, that = this;
            withIndent(function () {
                result = [
                    'while' + space + '(',
                    that.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
                    ')'
                ];
            });
            result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
            return result;
        },

        WithStatement: function (stmt, flags) {
            var result, that = this;
            withIndent(function () {
                result = [
                    'with' + space + '(',
                    that.generateExpression(stmt.object, Precedence.Sequence, E_TTT),
                    ')'
                ];
            });
            result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
            return result;
        }

    };

    merge(CodeGenerator.prototype, CodeGenerator.Statement);

    // Expressions.

    CodeGenerator.Expression = {

        SequenceExpression: function (expr, precedence, flags) {
            var result, i, iz;
            if (Precedence.Sequence < precedence) {
                flags |= F_ALLOW_IN;
            }
            result = [];
            for (i = 0, iz = expr.expressions.length; i < iz; ++i) {
                result.push(this.generateExpression(expr.expressions[i], Precedence.Assignment, flags));
                if (i + 1 < iz) {
                    result.push(',' + space);
                }
            }
            return parenthesize(result, Precedence.Sequence, precedence);
        },

        AssignmentExpression: function (expr, precedence, flags) {
            return this.generateAssignment(expr.left, expr.right, expr.operator, precedence, flags);
        },

        ArrowFunctionExpression: function (expr, precedence, flags) {
            return parenthesize(this.generateFunctionBody(expr), Precedence.ArrowFunction, precedence);
        },

        ConditionalExpression: function (expr, precedence, flags) {
            if (Precedence.Conditional < precedence) {
                flags |= F_ALLOW_IN;
            }
            return parenthesize(
                [
                    this.generateExpression(expr.test, Precedence.LogicalOR, flags),
                    space + '?' + space,
                    this.generateExpression(expr.consequent, Precedence.Assignment, flags),
                    space + ':' + space,
                    this.generateExpression(expr.alternate, Precedence.Assignment, flags)
                ],
                Precedence.Conditional,
                precedence
            );
        },

        LogicalExpression: function (expr, precedence, flags) {
            return this.BinaryExpression(expr, precedence, flags);
        },

        BinaryExpression: function (expr, precedence, flags) {
            var result, currentPrecedence, fragment, leftSource;
            currentPrecedence = BinaryPrecedence[expr.operator];

            if (currentPrecedence < precedence) {
                flags |= F_ALLOW_IN;
            }

            fragment = this.generateExpression(expr.left, currentPrecedence, flags);

            leftSource = fragment.toString();

            if (leftSource.charCodeAt(leftSource.length - 1) === 0x2F /* / */ && esutils.code.isIdentifierPart(expr.operator.charCodeAt(0))) {
                result = [fragment, noEmptySpace(), expr.operator];
            } else {
                result = join(fragment, expr.operator);
            }

            fragment = this.generateExpression(expr.right, currentPrecedence + 1, flags);

            if (expr.operator === '/' && fragment.toString().charAt(0) === '/' ||
            expr.operator.slice(-1) === '<' && fragment.toString().slice(0, 3) === '!--') {
                // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
                result.push(noEmptySpace());
                result.push(fragment);
            } else {
                result = join(result, fragment);
            }

            if (expr.operator === 'in' && !(flags & F_ALLOW_IN)) {
                return ['(', result, ')'];
            }
            return parenthesize(result, currentPrecedence, precedence);
        },

        CallExpression: function (expr, precedence, flags) {
            var result, i, iz;
            // F_ALLOW_UNPARATH_NEW becomes false.
            result = [this.generateExpression(expr.callee, Precedence.Call, E_TTF)];
            result.push('(');
            for (i = 0, iz = expr['arguments'].length; i < iz; ++i) {
                result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
                if (i + 1 < iz) {
                    result.push(',' + space);
                }
            }
            result.push(')');

            if (!(flags & F_ALLOW_CALL)) {
                return ['(', result, ')'];
            }
            return parenthesize(result, Precedence.Call, precedence);
        },

        NewExpression: function (expr, precedence, flags) {
            var result, length, i, iz, itemFlags;
            length = expr['arguments'].length;

            // F_ALLOW_CALL becomes false.
            // F_ALLOW_UNPARATH_NEW may become false.
            itemFlags = (flags & F_ALLOW_UNPARATH_NEW && !parentheses && length === 0) ? E_TFT : E_TFF;

            result = join(
                'new',
                this.generateExpression(expr.callee, Precedence.New, itemFlags)
            );

            if (!(flags & F_ALLOW_UNPARATH_NEW) || parentheses || length > 0) {
                result.push('(');
                for (i = 0, iz = length; i < iz; ++i) {
                    result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
                    if (i + 1 < iz) {
                        result.push(',' + space);
                    }
                }
                result.push(')');
            }

            return parenthesize(result, Precedence.New, precedence);
        },

        MemberExpression: function (expr, precedence, flags) {
            var result, fragment;

            // F_ALLOW_UNPARATH_NEW becomes false.
            result = [this.generateExpression(expr.object, Precedence.Call, (flags & F_ALLOW_CALL) ? E_TTF : E_TFF)];

            if (expr.computed) {
                result.push('[');
                result.push(this.generateExpression(expr.property, Precedence.Sequence, flags & F_ALLOW_CALL ? E_TTT : E_TFT));
                result.push(']');
            } else {
                if (expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
                    fragment = toSourceNodeWhenNeeded(result).toString();
                    // When the following conditions are all true,
                    //   1. No floating point
                    //   2. Don't have exponents
                    //   3. The last character is a decimal digit
                    //   4. Not hexadecimal OR octal number literal
                    // we should add a floating point.
                    if (
                            fragment.indexOf('.') < 0 &&
                            !/[eExX]/.test(fragment) &&
                            esutils.code.isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) &&
                            !(fragment.length >= 2 && fragment.charCodeAt(0) === 48)  // '0'
                            ) {
                        result.push('.');
                    }
                }
                result.push('.');
                result.push(generateIdentifier(expr.property));
            }

            return parenthesize(result, Precedence.Member, precedence);
        },

        UnaryExpression: function (expr, precedence, flags) {
            var result, fragment, rightCharCode, leftSource, leftCharCode;
            fragment = this.generateExpression(expr.argument, Precedence.Unary, E_TTT);

            if (space === '') {
                result = join(expr.operator, fragment);
            } else {
                result = [expr.operator];
                if (expr.operator.length > 2) {
                    // delete, void, typeof
                    // get `typeof []`, not `typeof[]`
                    result = join(result, fragment);
                } else {
                    // Prevent inserting spaces between operator and argument if it is unnecessary
                    // like, `!cond`
                    leftSource = toSourceNodeWhenNeeded(result).toString();
                    leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
                    rightCharCode = fragment.toString().charCodeAt(0);

                    if (((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode) ||
                            (esutils.code.isIdentifierPart(leftCharCode) && esutils.code.isIdentifierPart(rightCharCode))) {
                        result.push(noEmptySpace());
                        result.push(fragment);
                    } else {
                        result.push(fragment);
                    }
                }
            }
            return parenthesize(result, Precedence.Unary, precedence);
        },

        YieldExpression: function (expr, precedence, flags) {
            var result;
            if (expr.delegate) {
                result = 'yield*';
            } else {
                result = 'yield';
            }
            if (expr.argument) {
                result = join(
                    result,
                    this.generateExpression(expr.argument, Precedence.Yield, E_TTT)
                );
            }
            return parenthesize(result, Precedence.Yield, precedence);
        },

        AwaitExpression: function (expr, precedence, flags) {
            var result = join(
                expr.delegate ? 'await*' : 'await',
                this.generateExpression(expr.argument, Precedence.Await, E_TTT)
            );
            return parenthesize(result, Precedence.Await, precedence);
        },

        UpdateExpression: function (expr, precedence, flags) {
            if (expr.prefix) {
                return parenthesize(
                    [
                        expr.operator,
                        this.generateExpression(expr.argument, Precedence.Unary, E_TTT)
                    ],
                    Precedence.Unary,
                    precedence
                );
            }
            return parenthesize(
                [
                    this.generateExpression(expr.argument, Precedence.Postfix, E_TTT),
                    expr.operator
                ],
                Precedence.Postfix,
                precedence
            );
        },

        FunctionExpression: function (expr, precedence, flags) {
            var result = [
                generateAsyncPrefix(expr, true),
                'function'
            ];
            if (expr.id) {
                result.push(generateStarSuffix(expr) || noEmptySpace());
                result.push(generateIdentifier(expr.id));
            } else {
                result.push(generateStarSuffix(expr) || space);
            }
            result.push(this.generateFunctionBody(expr));
            return result;
        },

        ExportBatchSpecifier: function (expr, precedence, flags) {
            return '*';
        },

        ArrayPattern: function (expr, precedence, flags) {
            return this.ArrayExpression(expr, precedence, flags);
        },

        ArrayExpression: function (expr, precedence, flags) {
            var result, multiline, that = this;
            if (!expr.elements.length) {
                return '[]';
            }
            multiline = expr.elements.length > 1;
            result = ['[', multiline ? newline : ''];
            withIndent(function (indent) {
                var i, iz;
                for (i = 0, iz = expr.elements.length; i < iz; ++i) {
                    if (!expr.elements[i]) {
                        if (multiline) {
                            result.push(indent);
                        }
                        if (i + 1 === iz) {
                            result.push(',');
                        }
                    } else {
                        result.push(multiline ? indent : '');
                        result.push(that.generateExpression(expr.elements[i], Precedence.Assignment, E_TTT));
                    }
                    if (i + 1 < iz) {
                        result.push(',' + (multiline ? newline : space));
                    }
                }
            });
            if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
            }
            result.push(multiline ? base : '');
            result.push(']');
            return result;
        },

        ClassExpression: function (expr, precedence, flags) {
            var result, fragment;
            result = ['class'];
            if (expr.id) {
                result = join(result, this.generateExpression(expr.id, Precedence.Sequence, E_TTT));
            }
            if (expr.superClass) {
                fragment = join('extends', this.generateExpression(expr.superClass, Precedence.Assignment, E_TTT));
                result = join(result, fragment);
            }
            result.push(space);
            result.push(this.generateStatement(expr.body, S_TFFT));
            return result;
        },

        MethodDefinition: function (expr, precedence, flags) {
            var result, fragment;
            if (expr['static']) {
                result = ['static' + space];
            } else {
                result = [];
            }
            if (expr.kind === 'get' || expr.kind === 'set') {
                fragment = [
                    join(expr.kind, this.generatePropertyKey(expr.key, expr.computed)),
                    this.generateFunctionBody(expr.value)
                ];
            } else {
                fragment = [
                    generateMethodPrefix(expr),
                    this.generatePropertyKey(expr.key, expr.computed),
                    this.generateFunctionBody(expr.value)
                ];
            }
            return join(result, fragment);
        },

        Property: function (expr, precedence, flags) {
            if (expr.kind === 'get' || expr.kind === 'set') {
                return [
                    expr.kind, noEmptySpace(),
                    this.generatePropertyKey(expr.key, expr.computed),
                    this.generateFunctionBody(expr.value)
                ];
            }

            if (expr.shorthand) {
                return this.generatePropertyKey(expr.key, expr.computed);
            }

            if (expr.method) {
                return [
                    generateMethodPrefix(expr),
                    this.generatePropertyKey(expr.key, expr.computed),
                    this.generateFunctionBody(expr.value)
                ];
            }

            return [
                this.generatePropertyKey(expr.key, expr.computed),
                ':' + space,
                this.generateExpression(expr.value, Precedence.Assignment, E_TTT)
            ];
        },

        ObjectExpression: function (expr, precedence, flags) {
            var multiline, result, fragment, that = this;

            if (!expr.properties.length) {
                return '{}';
            }
            multiline = expr.properties.length > 1;

            withIndent(function () {
                fragment = that.generateExpression(expr.properties[0], Precedence.Sequence, E_TTT);
            });

            if (!multiline) {
                // issues 4
                // Do not transform from
                //   dejavu.Class.declare({
                //       method2: function () {}
                //   });
                // to
                //   dejavu.Class.declare({method2: function () {
                //       }});
                if (!hasLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                    return [ '{', space, fragment, space, '}' ];
                }
            }

            withIndent(function (indent) {
                var i, iz;
                result = [ '{', newline, indent, fragment ];

                if (multiline) {
                    result.push(',' + newline);
                    for (i = 1, iz = expr.properties.length; i < iz; ++i) {
                        result.push(indent);
                        result.push(that.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
                        if (i + 1 < iz) {
                            result.push(',' + newline);
                        }
                    }
                }
            });

            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
            }
            result.push(base);
            result.push('}');
            return result;
        },

        ObjectPattern: function (expr, precedence, flags) {
            var result, i, iz, multiline, property, that = this;
            if (!expr.properties.length) {
                return '{}';
            }

            multiline = false;
            if (expr.properties.length === 1) {
                property = expr.properties[0];
                if (property.value.type !== Syntax.Identifier) {
                    multiline = true;
                }
            } else {
                for (i = 0, iz = expr.properties.length; i < iz; ++i) {
                    property = expr.properties[i];
                    if (!property.shorthand) {
                        multiline = true;
                        break;
                    }
                }
            }
            result = ['{', multiline ? newline : '' ];

            withIndent(function (indent) {
                var i, iz;
                for (i = 0, iz = expr.properties.length; i < iz; ++i) {
                    result.push(multiline ? indent : '');
                    result.push(that.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
                    if (i + 1 < iz) {
                        result.push(',' + (multiline ? newline : space));
                    }
                }
            });

            if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
            }
            result.push(multiline ? base : '');
            result.push('}');
            return result;
        },

        ThisExpression: function (expr, precedence, flags) {
            return 'this';
        },

        Identifier: function (expr, precedence, flags) {
            return generateIdentifier(expr);
        },

        ImportDefaultSpecifier: function (expr, precedence, flags) {
            return generateIdentifier(expr.id);
        },

        ImportNamespaceSpecifier: function (expr, precedence, flags) {
            var result = ['*'];
            if (expr.id) {
                result.push(space + 'as' + noEmptySpace() + generateIdentifier(expr.id));
            }
            return result;
        },

        ImportSpecifier: function (expr, precedence, flags) {
            return this.ExportSpecifier(expr, precedence, flags);
        },

        ExportSpecifier: function (expr, precedence, flags) {
            var result = [ expr.id.name ];
            if (expr.name) {
                result.push(noEmptySpace() + 'as' + noEmptySpace() + generateIdentifier(expr.name));
            }
            return result;
        },

        Literal: function (expr, precedence, flags) {
            var raw;
            if (expr.hasOwnProperty('raw') && parse && extra.raw) {
                try {
                    raw = parse(expr.raw).body[0].expression;
                    if (raw.type === Syntax.Literal) {
                        if (raw.value === expr.value) {
                            return expr.raw;
                        }
                    }
                } catch (e) {
                    // not use raw property
                }
            }

            if (expr.value === null) {
                return 'null';
            }

            if (typeof expr.value === 'string') {
                return escapeString(expr.value);
            }

            if (typeof expr.value === 'number') {
                return generateNumber(expr.value);
            }

            if (typeof expr.value === 'boolean') {
                return expr.value ? 'true' : 'false';
            }

            return generateRegExp(expr.value);
        },

        GeneratorExpression: function (expr, precedence, flags) {
            return this.ComprehensionExpression(expr, precedence, flags);
        },

        ComprehensionExpression: function (expr, precedence, flags) {
            // GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
            // Due to https://bugzilla.mozilla.org/show_bug.cgi?id=883468 position of expr.body can differ in Spidermonkey and ES6

            var result, i, iz, fragment, that = this;
            result = (expr.type === Syntax.GeneratorExpression) ? ['('] : ['['];

            if (extra.moz.comprehensionExpressionStartsWithAssignment) {
                fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);
                result.push(fragment);
            }

            if (expr.blocks) {
                withIndent(function () {
                    for (i = 0, iz = expr.blocks.length; i < iz; ++i) {
                        fragment = that.generateExpression(expr.blocks[i], Precedence.Sequence, E_TTT);
                        if (i > 0 || extra.moz.comprehensionExpressionStartsWithAssignment) {
                            result = join(result, fragment);
                        } else {
                            result.push(fragment);
                        }
                    }
                });
            }

            if (expr.filter) {
                result = join(result, 'if' + space);
                fragment = this.generateExpression(expr.filter, Precedence.Sequence, E_TTT);
                result = join(result, [ '(', fragment, ')' ]);
            }

            if (!extra.moz.comprehensionExpressionStartsWithAssignment) {
                fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);

                result = join(result, fragment);
            }

            result.push((expr.type === Syntax.GeneratorExpression) ? ')' : ']');
            return result;
        },

        ComprehensionBlock: function (expr, precedence, flags) {
            var fragment;
            if (expr.left.type === Syntax.VariableDeclaration) {
                fragment = [
                    expr.left.kind, noEmptySpace(),
                    this.generateStatement(expr.left.declarations[0], S_FFFF)
                ];
            } else {
                fragment = this.generateExpression(expr.left, Precedence.Call, E_TTT);
            }

            fragment = join(fragment, expr.of ? 'of' : 'in');
            fragment = join(fragment, this.generateExpression(expr.right, Precedence.Sequence, E_TTT));

            return [ 'for' + space + '(', fragment, ')' ];
        },

        SpreadElement: function (expr, precedence, flags) {
            return [
                '...',
                this.generateExpression(expr.argument, Precedence.Assignment, E_TTT)
            ];
        },

        TaggedTemplateExpression: function (expr, precedence, flags) {
            var itemFlags = E_TTF;
            if (!(flags & F_ALLOW_CALL)) {
                itemFlags = E_TFF;
            }
            var result = [
                this.generateExpression(expr.tag, Precedence.Call, itemFlags),
                this.generateExpression(expr.quasi, Precedence.Primary, E_FFT)
            ];
            return parenthesize(result, Precedence.TaggedTemplate, precedence);
        },

        TemplateElement: function (expr, precedence, flags) {
            // Don't use "cooked". Since tagged template can use raw template
            // representation. So if we do so, it breaks the script semantics.
            return expr.value.raw;
        },

        TemplateLiteral: function (expr, precedence, flags) {
            var result, i, iz;
            result = [ '`' ];
            for (i = 0, iz = expr.quasis.length; i < iz; ++i) {
                result.push(this.generateExpression(expr.quasis[i], Precedence.Primary, E_TTT));
                if (i + 1 < iz) {
                    result.push('${' + space);
                    result.push(this.generateExpression(expr.expressions[i], Precedence.Sequence, E_TTT));
                    result.push(space + '}');
                }
            }
            result.push('`');
            return result;
        },

        ModuleSpecifier: function (expr, precedence, flags) {
            return this.Literal(expr, precedence, flags);
        }

    };

    merge(CodeGenerator.prototype, CodeGenerator.Expression);

    CodeGenerator.prototype.generateExpression = function (expr, precedence, flags) {
        var result, type;

        type = expr.type || Syntax.Property;

        if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) {
            return generateVerbatim(expr, precedence);
        }

        result = this[type](expr, precedence, flags);


        if (extra.comment) {
            result = addComments(expr,result);
        }
        return toSourceNodeWhenNeeded(result, expr);
    };

    CodeGenerator.prototype.generateStatement = function (stmt, flags) {
        var result,
            fragment;

        result = this[stmt.type](stmt, flags);

        // Attach comments

        if (extra.comment) {
            result = addComments(stmt, result);
        }

        fragment = toSourceNodeWhenNeeded(result).toString();
        if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' &&  fragment.charAt(fragment.length - 1) === '\n') {
            result = sourceMap ? toSourceNodeWhenNeeded(result).replaceRight(/\s+$/, '') : fragment.replace(/\s+$/, '');
        }

        return toSourceNodeWhenNeeded(result, stmt);
    };

    function generateInternal(node) {
        var codegen;

        codegen = new CodeGenerator();
        if (isStatement(node)) {
            return codegen.generateStatement(node, S_TFFF);
        }

        if (isExpression(node)) {
            return codegen.generateExpression(node, Precedence.Sequence, E_TTT);
        }

        throw new Error('Unknown node type: ' + node.type);
    }

    function generate(node, options) {
        var defaultOptions = getDefaultOptions(), result, pair;

        if (options != null) {
            // Obsolete options
            //
            //   `options.indent`
            //   `options.base`
            //
            // Instead of them, we can use `option.format.indent`.
            if (typeof options.indent === 'string') {
                defaultOptions.format.indent.style = options.indent;
            }
            if (typeof options.base === 'number') {
                defaultOptions.format.indent.base = options.base;
            }
            options = updateDeeply(defaultOptions, options);
            indent = options.format.indent.style;
            if (typeof options.base === 'string') {
                base = options.base;
            } else {
                base = stringRepeat(indent, options.format.indent.base);
            }
        } else {
            options = defaultOptions;
            indent = options.format.indent.style;
            base = stringRepeat(indent, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;
        newline = options.format.newline;
        space = options.format.space;
        if (options.format.compact) {
            newline = space = indent = base = '';
        }
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        safeConcatenation = options.format.safeConcatenation;
        directive = options.directive;
        parse = json ? null : options.parse;
        sourceMap = options.sourceMap;
        sourceCode = options.sourceCode;
        preserveBlankLines = options.format.preserveBlankLines && sourceCode !== null;
        extra = options;

        if (sourceMap) {
            if (!exports.browser) {
                // We assume environment is node.js
                // And prevent from including source-map by browserify
                SourceNode = require('source-map').SourceNode;
            } else {
                SourceNode = global.sourceMap.SourceNode;
            }
        }

        result = generateInternal(node);

        if (!sourceMap) {
            pair = {code: result.toString(), map: null};
            return options.sourceMapWithCode ? pair : pair.code;
        }


        pair = result.toStringWithSourceMap({
            file: options.file,
            sourceRoot: options.sourceMapRoot
        });

        if (options.sourceContent) {
            pair.map.setSourceContent(options.sourceMap,
                                      options.sourceContent);
        }

        if (options.sourceMapWithCode) {
            return pair;
        }

        return pair.map.toString();
    }

    FORMAT_MINIFY = {
        indent: {
            style: '',
            base: 0
        },
        renumber: true,
        hexadecimal: true,
        quotes: 'auto',
        escapeless: true,
        compact: true,
        parentheses: false,
        semicolons: false
    };

    FORMAT_DEFAULTS = getDefaultOptions().format;

    exports.version = require('./package.json').version;
    exports.generate = generate;
    exports.attachComments = estraverse.attachComments;
    exports.Precedence = updateDeeply({}, Precedence);
    exports.browser = false;
    exports.FORMAT_MINIFY = FORMAT_MINIFY;
    exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
}());
/* vim: set sw=4 ts=4 et tw=80 : */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./package.json":119,"estraverse":103,"esutils":107,"source-map":108}],103:[function(require,module,exports){
/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*jslint vars:false, bitwise:true*/
/*jshint indent:4*/
/*global exports:true, define:true*/
(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // and plain browser loading,
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.estraverse = {}));
    }
}(this, function clone(exports) {
    'use strict';

    var Syntax,
        isArray,
        VisitorOption,
        VisitorKeys,
        objectCreate,
        objectKeys,
        BREAK,
        SKIP,
        REMOVE;

    function ignoreJSHintError() { }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                val = obj[key];
                if (typeof val === 'object' && val !== null) {
                    ret[key] = deepCopy(val);
                } else {
                    ret[key] = val;
                }
            }
        }
        return ret;
    }

    function shallowCopy(obj) {
        var ret = {}, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    ignoreJSHintError(shallowCopy);

    // based on LLVM libc++ upper_bound / lower_bound
    // MIT License

    function upperBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                len = diff;
            } else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

    function lowerBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                i = current + 1;
                len -= diff + 1;
            } else {
                len = diff;
            }
        }
        return i;
    }
    ignoreJSHintError(lowerBound);

    objectCreate = Object.create || (function () {
        function F() { }

        return function (o) {
            F.prototype = o;
            return new F();
        };
    })();

    objectKeys = Object.keys || function (o) {
        var keys = [], key;
        for (key in o) {
            keys.push(key);
        }
        return keys;
    };

    function extend(to, from) {
        var keys = objectKeys(from), key, i, len;
        for (i = 0, len = keys.length; i < len; i += 1) {
            key = keys[i];
            to[key] = from[key];
        }
        return to;
    }

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        AwaitExpression: 'AwaitExpression', // CAUTION: It's deferred to ES7.
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ComprehensionBlock: 'ComprehensionBlock',  // CAUTION: It's deferred to ES7.
        ComprehensionExpression: 'ComprehensionExpression',  // CAUTION: It's deferred to ES7.
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExportBatchSpecifier: 'ExportBatchSpecifier',
        ExportDeclaration: 'ExportDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        GeneratorExpression: 'GeneratorExpression',  // CAUTION: It's deferred to ES7.
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        ModuleSpecifier: 'ModuleSpecifier',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        ArrayExpression: ['elements'],
        ArrayPattern: ['elements'],
        ArrowFunctionExpression: ['params', 'defaults', 'rest', 'body'],
        AwaitExpression: ['argument'], // CAUTION: It's deferred to ES7.
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ClassBody: ['body'],
        ClassDeclaration: ['id', 'body', 'superClass'],
        ClassExpression: ['id', 'body', 'superClass'],
        ComprehensionBlock: ['left', 'right'],  // CAUTION: It's deferred to ES7.
        ComprehensionExpression: ['blocks', 'filter', 'body'],  // CAUTION: It's deferred to ES7.
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExportBatchSpecifier: [],
        ExportDeclaration: ['declaration', 'specifiers', 'source'],
        ExportSpecifier: ['id', 'name'],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        ForOfStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'defaults', 'rest', 'body'],
        FunctionExpression: ['id', 'params', 'defaults', 'rest', 'body'],
        GeneratorExpression: ['blocks', 'filter', 'body'],  // CAUTION: It's deferred to ES7.
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        ImportDeclaration: ['specifiers', 'source'],
        ImportDefaultSpecifier: ['id'],
        ImportNamespaceSpecifier: ['id'],
        ImportSpecifier: ['id', 'name'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        MethodDefinition: ['key', 'value'],
        ModuleSpecifier: [],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SpreadElement: ['argument'],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        TaggedTemplateExpression: ['tag', 'quasi'],
        TemplateElement: [],
        TemplateLiteral: ['quasis', 'expressions'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handlers', 'handler', 'guardedHandlers', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body'],
        YieldExpression: ['argument']
    };

    // unique id
    BREAK = {};
    SKIP = {};
    REMOVE = {};

    VisitorOption = {
        Break: BREAK,
        Skip: SKIP,
        Remove: REMOVE
    };

    function Reference(parent, key) {
        this.parent = parent;
        this.key = key;
    }

    Reference.prototype.replace = function replace(node) {
        this.parent[this.key] = node;
    };

    Reference.prototype.remove = function remove() {
        if (isArray(this.parent)) {
            this.parent.splice(this.key, 1);
            return true;
        } else {
            this.replace(null);
            return false;
        }
    };

    function Element(node, path, wrap, ref) {
        this.node = node;
        this.path = path;
        this.wrap = wrap;
        this.ref = ref;
    }

    function Controller() { }

    // API:
    // return property path array from root to current node
    Controller.prototype.path = function path() {
        var i, iz, j, jz, result, element;

        function addToPath(result, path) {
            if (isArray(path)) {
                for (j = 0, jz = path.length; j < jz; ++j) {
                    result.push(path[j]);
                }
            } else {
                result.push(path);
            }
        }

        // root node
        if (!this.__current.path) {
            return null;
        }

        // first node is sentinel, second node is root element
        result = [];
        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
            element = this.__leavelist[i];
            addToPath(result, element.path);
        }
        addToPath(result, this.__current.path);
        return result;
    };

    // API:
    // return type of current node
    Controller.prototype.type = function () {
        var node = this.current();
        return node.type || this.__current.wrap;
    };

    // API:
    // return array of parent elements
    Controller.prototype.parents = function parents() {
        var i, iz, result;

        // first node is sentinel
        result = [];
        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
            result.push(this.__leavelist[i].node);
        }

        return result;
    };

    // API:
    // return current node
    Controller.prototype.current = function current() {
        return this.__current.node;
    };

    Controller.prototype.__execute = function __execute(callback, element) {
        var previous, result;

        result = undefined;

        previous  = this.__current;
        this.__current = element;
        this.__state = null;
        if (callback) {
            result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        }
        this.__current = previous;

        return result;
    };

    // API:
    // notify control skip / break
    Controller.prototype.notify = function notify(flag) {
        this.__state = flag;
    };

    // API:
    // skip child nodes of current node
    Controller.prototype.skip = function () {
        this.notify(SKIP);
    };

    // API:
    // break traversals
    Controller.prototype['break'] = function () {
        this.notify(BREAK);
    };

    // API:
    // remove node
    Controller.prototype.remove = function () {
        this.notify(REMOVE);
    };

    Controller.prototype.__initialize = function(root, visitor) {
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
        this.__current = null;
        this.__state = null;
        this.__fallback = visitor.fallback === 'iteration';
        this.__keys = VisitorKeys;
        if (visitor.keys) {
            this.__keys = extend(objectCreate(this.__keys), visitor.keys);
        }
    };

    function isNode(node) {
        if (node == null) {
            return false;
        }
        return typeof node === 'object' && typeof node.type === 'string';
    }

    function isProperty(nodeType, key) {
        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === key;
    }

    Controller.prototype.traverse = function traverse(root, visitor) {
        var worklist,
            leavelist,
            element,
            node,
            nodeType,
            ret,
            key,
            current,
            current2,
            candidates,
            candidate,
            sentinel;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        worklist.push(new Element(root, null, null, null));
        leavelist.push(new Element(null, null, null, null));

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                ret = this.__execute(visitor.leave, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }
                continue;
            }

            if (element.node) {

                ret = this.__execute(visitor.enter, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }

                worklist.push(sentinel);
                leavelist.push(element);

                if (this.__state === SKIP || ret === SKIP) {
                    continue;
                }

                node = element.node;
                nodeType = element.wrap || node.type;
                candidates = this.__keys[nodeType];
                if (!candidates) {
                    if (this.__fallback) {
                        candidates = objectKeys(node);
                    } else {
                        throw new Error('Unknown node type ' + nodeType + '.');
                    }
                }

                current = candidates.length;
                while ((current -= 1) >= 0) {
                    key = candidates[current];
                    candidate = node[key];
                    if (!candidate) {
                        continue;
                    }

                    if (isArray(candidate)) {
                        current2 = candidate.length;
                        while ((current2 -= 1) >= 0) {
                            if (!candidate[current2]) {
                                continue;
                            }
                            if (isProperty(nodeType, candidates[current])) {
                                element = new Element(candidate[current2], [key, current2], 'Property', null);
                            } else if (isNode(candidate[current2])) {
                                element = new Element(candidate[current2], [key, current2], null, null);
                            } else {
                                continue;
                            }
                            worklist.push(element);
                        }
                    } else if (isNode(candidate)) {
                        worklist.push(new Element(candidate, key, null, null));
                    }
                }
            }
        }
    };

    Controller.prototype.replace = function replace(root, visitor) {
        function removeElem(element) {
            var i,
                key,
                nextElem,
                parent;

            if (element.ref.remove()) {
                // When the reference is an element of an array.
                key = element.ref.key;
                parent = element.ref.parent;

                // If removed from array, then decrease following items' keys.
                i = worklist.length;
                while (i--) {
                    nextElem = worklist[i];
                    if (nextElem.ref && nextElem.ref.parent === parent) {
                        if  (nextElem.ref.key < key) {
                            break;
                        }
                        --nextElem.ref.key;
                    }
                }
            }
        }

        var worklist,
            leavelist,
            node,
            nodeType,
            target,
            element,
            current,
            current2,
            candidates,
            candidate,
            sentinel,
            outer,
            key;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        outer = {
            root: root
        };
        element = new Element(root, null, null, new Reference(outer, 'root'));
        worklist.push(element);
        leavelist.push(element);

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                target = this.__execute(visitor.leave, element);

                // node may be replaced with null,
                // so distinguish between undefined and null in this place
                if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                    // replace
                    element.ref.replace(target);
                }

                if (this.__state === REMOVE || target === REMOVE) {
                    removeElem(element);
                }

                if (this.__state === BREAK || target === BREAK) {
                    return outer.root;
                }
                continue;
            }

            target = this.__execute(visitor.enter, element);

            // node may be replaced with null,
            // so distinguish between undefined and null in this place
            if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                // replace
                element.ref.replace(target);
                element.node = target;
            }

            if (this.__state === REMOVE || target === REMOVE) {
                removeElem(element);
                element.node = null;
            }

            if (this.__state === BREAK || target === BREAK) {
                return outer.root;
            }

            // node may be null
            node = element.node;
            if (!node) {
                continue;
            }

            worklist.push(sentinel);
            leavelist.push(element);

            if (this.__state === SKIP || target === SKIP) {
                continue;
            }

            nodeType = element.wrap || node.type;
            candidates = this.__keys[nodeType];
            if (!candidates) {
                if (this.__fallback) {
                    candidates = objectKeys(node);
                } else {
                    throw new Error('Unknown node type ' + nodeType + '.');
                }
            }

            current = candidates.length;
            while ((current -= 1) >= 0) {
                key = candidates[current];
                candidate = node[key];
                if (!candidate) {
                    continue;
                }

                if (isArray(candidate)) {
                    current2 = candidate.length;
                    while ((current2 -= 1) >= 0) {
                        if (!candidate[current2]) {
                            continue;
                        }
                        if (isProperty(nodeType, candidates[current])) {
                            element = new Element(candidate[current2], [key, current2], 'Property', new Reference(candidate, current2));
                        } else if (isNode(candidate[current2])) {
                            element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));
                        } else {
                            continue;
                        }
                        worklist.push(element);
                    }
                } else if (isNode(candidate)) {
                    worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                }
            }
        }

        return outer.root;
    };

    function traverse(root, visitor) {
        var controller = new Controller();
        return controller.traverse(root, visitor);
    }

    function replace(root, visitor) {
        var controller = new Controller();
        return controller.replace(root, visitor);
    }

    function extendCommentRange(comment, tokens) {
        var target;

        target = upperBound(tokens, function search(token) {
            return token.range[0] > comment.range[0];
        });

        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }

        target -= 1;
        if (target >= 0) {
            comment.extendedRange[0] = tokens[target].range[1];
        }

        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        // At first, we should calculate extended comment ranges.
        var comments = [], comment, len, i, cursor;

        if (!tree.range) {
            throw new Error('attachComments needs range information');
        }

        // tokens array is empty, we attach comments to tree as 'leadingComments'
        if (!tokens.length) {
            if (providedComments.length) {
                for (i = 0, len = providedComments.length; i < len; i += 1) {
                    comment = deepCopy(providedComments[i]);
                    comment.extendedRange = [0, tree.range[0]];
                    comments.push(comment);
                }
                tree.leadingComments = comments;
            }
            return tree;
        }

        for (i = 0, len = providedComments.length; i < len; i += 1) {
            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }

        // This is based on John Freeman's implementation.
        cursor = 0;
        traverse(tree, {
            enter: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) {
                        break;
                    }

                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) {
                            node.leadingComments = [];
                        }
                        node.leadingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        cursor = 0;
        traverse(tree, {
            leave: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) {
                        break;
                    }

                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) {
                            node.trailingComments = [];
                        }
                        node.trailingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        return tree;
    }

    exports.version = '1.8.1-dev';
    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.Controller = Controller;
    exports.cloneEnvironment = function () { return clone({}); };

    return exports;
}));
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],104:[function(require,module,exports){
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    function isExpression(node) {
        if (node == null) { return false; }
        switch (node.type) {
            case 'ArrayExpression':
            case 'AssignmentExpression':
            case 'BinaryExpression':
            case 'CallExpression':
            case 'ConditionalExpression':
            case 'FunctionExpression':
            case 'Identifier':
            case 'Literal':
            case 'LogicalExpression':
            case 'MemberExpression':
            case 'NewExpression':
            case 'ObjectExpression':
            case 'SequenceExpression':
            case 'ThisExpression':
            case 'UnaryExpression':
            case 'UpdateExpression':
                return true;
        }
        return false;
    }

    function isIterationStatement(node) {
        if (node == null) { return false; }
        switch (node.type) {
            case 'DoWhileStatement':
            case 'ForInStatement':
            case 'ForStatement':
            case 'WhileStatement':
                return true;
        }
        return false;
    }

    function isStatement(node) {
        if (node == null) { return false; }
        switch (node.type) {
            case 'BlockStatement':
            case 'BreakStatement':
            case 'ContinueStatement':
            case 'DebuggerStatement':
            case 'DoWhileStatement':
            case 'EmptyStatement':
            case 'ExpressionStatement':
            case 'ForInStatement':
            case 'ForStatement':
            case 'IfStatement':
            case 'LabeledStatement':
            case 'ReturnStatement':
            case 'SwitchStatement':
            case 'ThrowStatement':
            case 'TryStatement':
            case 'VariableDeclaration':
            case 'WhileStatement':
            case 'WithStatement':
                return true;
        }
        return false;
    }

    function isSourceElement(node) {
      return isStatement(node) || node != null && node.type === 'FunctionDeclaration';
    }

    function trailingStatement(node) {
        switch (node.type) {
        case 'IfStatement':
            if (node.alternate != null) {
                return node.alternate;
            }
            return node.consequent;

        case 'LabeledStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'WhileStatement':
        case 'WithStatement':
            return node.body;
        }
        return null;
    }

    function isProblematicIfStatement(node) {
        var current;

        if (node.type !== 'IfStatement') {
            return false;
        }
        if (node.alternate == null) {
            return false;
        }
        current = node.consequent;
        do {
            if (current.type === 'IfStatement') {
                if (current.alternate == null)  {
                    return true;
                }
            }
            current = trailingStatement(current);
        } while (current);

        return false;
    }

    module.exports = {
        isExpression: isExpression,
        isStatement: isStatement,
        isIterationStatement: isIterationStatement,
        isSourceElement: isSourceElement,
        isProblematicIfStatement: isProblematicIfStatement,

        trailingStatement: trailingStatement
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],105:[function(require,module,exports){
/*
  Copyright (C) 2013-2014 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    var Regex, NON_ASCII_WHITESPACES;

    // See `tools/generate-identifier-regex.js`.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
    };

    function isDecimalDigit(ch) {
        return (ch >= 48 && ch <= 57);   // 0..9
    }

    function isHexDigit(ch) {
        return isDecimalDigit(ch) ||    // 0..9
            (97 <= ch && ch <= 102) ||  // a..f
            (65 <= ch && ch <= 70);     // A..F
    }

    function isOctalDigit(ch) {
        return (ch >= 48 && ch <= 55);   // 0..7
    }

    // 7.2 White Space

    NON_ASCII_WHITESPACES = [
        0x1680, 0x180E,
        0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A,
        0x202F, 0x205F,
        0x3000,
        0xFEFF
    ];

    function isWhiteSpace(ch) {
        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
            (ch >= 0x1680 && NON_ASCII_WHITESPACES.indexOf(ch) >= 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch >= 97 && ch <= 122) ||     // a..z
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch === 36) || (ch === 95) ||     // $ (dollar) and _ (underscore)
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
    }

    function isIdentifierPart(ch) {
        return (ch >= 97 && ch <= 122) ||     // a..z
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 48 && ch <= 57) ||         // 0..9
            (ch === 36) || (ch === 95) ||     // $ (dollar) and _ (underscore)
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
    }

    module.exports = {
        isDecimalDigit: isDecimalDigit,
        isHexDigit: isHexDigit,
        isOctalDigit: isOctalDigit,
        isWhiteSpace: isWhiteSpace,
        isLineTerminator: isLineTerminator,
        isIdentifierStart: isIdentifierStart,
        isIdentifierPart: isIdentifierPart
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],106:[function(require,module,exports){
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    var code = require('./code');

    function isStrictModeReservedWordES6(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isKeywordES5(id, strict) {
        // yield should not be treated as keyword under non-strict mode.
        if (!strict && id === 'yield') {
            return false;
        }
        return isKeywordES6(id, strict);
    }

    function isKeywordES6(id, strict) {
        if (strict && isStrictModeReservedWordES6(id)) {
            return true;
        }

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    function isReservedWordES5(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES5(id, strict);
    }

    function isReservedWordES6(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES6(id, strict);
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    function isIdentifierName(id) {
        var i, iz, ch;

        if (id.length === 0) {
            return false;
        }

        ch = id.charCodeAt(0);
        if (!code.isIdentifierStart(ch) || ch === 92) {  // \ (backslash)
            return false;
        }

        for (i = 1, iz = id.length; i < iz; ++i) {
            ch = id.charCodeAt(i);
            if (!code.isIdentifierPart(ch) || ch === 92) {  // \ (backslash)
                return false;
            }
        }
        return true;
    }

    function isIdentifierES5(id, strict) {
        return isIdentifierName(id) && !isReservedWordES5(id, strict);
    }

    function isIdentifierES6(id, strict) {
        return isIdentifierName(id) && !isReservedWordES6(id, strict);
    }

    module.exports = {
        isKeywordES5: isKeywordES5,
        isKeywordES6: isKeywordES6,
        isReservedWordES5: isReservedWordES5,
        isReservedWordES6: isReservedWordES6,
        isRestrictedWord: isRestrictedWord,
        isIdentifierName: isIdentifierName,
        isIdentifierES5: isIdentifierES5,
        isIdentifierES6: isIdentifierES6
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{"./code":105}],107:[function(require,module,exports){
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


(function () {
    'use strict';

    exports.ast = require('./ast');
    exports.code = require('./code');
    exports.keyword = require('./keyword');
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{"./ast":104,"./code":105,"./keyword":106}],108:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./source-map/source-node').SourceNode;

},{"./source-map/source-map-consumer":114,"./source-map/source-map-generator":115,"./source-map/source-node":116}],109:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet();
    for (var i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var isDuplicate = this.has(aStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set[util.toSetString(aStr)] = idx;
    }
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                util.toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[util.toSetString(aStr)];
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error('No element indexed by ' + aIdx);
  };

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };

  exports.ArraySet = ArraySet;

});

},{"./util":117,"amdefine":118}],110:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64 = require('./base64');

  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
  // length quantities we use in the source map spec, the first bit is the sign,
  // the next four bits are the actual value, and the 6th bit is the
  // continuation bit. The continuation bit tells us whether there are more
  // digits in this value following this digit.
  //
  //   Continuation
  //   |    Sign
  //   |    |
  //   V    V
  //   101011

  var VLQ_BASE_SHIFT = 5;

  // binary: 100000
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

  // binary: 011111
  var VLQ_BASE_MASK = VLQ_BASE - 1;

  // binary: 100000
  var VLQ_CONTINUATION_BIT = VLQ_BASE;

  /**
   * Converts from a two-complement value to a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */
  function toVLQSigned(aValue) {
    return aValue < 0
      ? ((-aValue) << 1) + 1
      : (aValue << 1) + 0;
  }

  /**
   * Converts to a two-complement value from a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative
      ? -shifted
      : shifted;
  }

  /**
   * Returns the base 64 VLQ encoded value.
   */
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;

    var vlq = toVLQSigned(aValue);

    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        // There are still more digits in this value, so we must make sure the
        // continuation bit is marked.
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);

    return encoded;
  };

  /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string via the out parameter.
   */
  exports.decode = function base64VLQ_decode(aStr, aOutParam) {
    var i = 0;
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (i >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charAt(i++));
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    aOutParam.value = fromVLQSigned(result);
    aOutParam.rest = aStr.slice(i);
  };

});

},{"./base64":111,"amdefine":118}],111:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var charToIntMap = {};
  var intToCharMap = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    .split('')
    .forEach(function (ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function base64_encode(aNumber) {
    if (aNumber in intToCharMap) {
      return intToCharMap[aNumber];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 digit to an integer.
   */
  exports.decode = function base64_decode(aChar) {
    if (aChar in charToIntMap) {
      return charToIntMap[aChar];
    }
    throw new TypeError("Not a valid base 64 digit: " + aChar);
  };

});

},{"amdefine":118}],112:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the index of
    //      the next closest element that is less than that element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element which is less than the one we are searching for, so we
    //      return -1.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      // Found the element we are looking for.
      return mid;
    }
    else if (cmp > 0) {
      // aHaystack[mid] is greater than our needle.
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
      }
      // We did not find an exact match, return the next closest one
      // (termination case 2).
      return mid;
    }
    else {
      // aHaystack[mid] is less than our needle.
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
      }
      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (2) or (3) and return the appropriate thing.
      return aLow < 0 ? -1 : aLow;
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the index of next lowest value checked if there is no exact hit. This is
   * because mappings between original and generated line/col pairs are single
   * points, and there is an implicit region between each of them, so a miss
   * just means that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare) {
    if (aHaystack.length === 0) {
      return -1;
    }
    return recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
  };

});

},{"amdefine":118}],113:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * Determine whether mappingB is after mappingA with respect to generated
   * position.
   */
  function generatedPositionAfter(mappingA, mappingB) {
    // Optimized for most common case
    var lineA = mappingA.generatedLine;
    var lineB = mappingB.generatedLine;
    var columnA = mappingA.generatedColumn;
    var columnB = mappingB.generatedColumn;
    return lineB > lineA || lineB == lineA && columnB >= columnA ||
           util.compareByGeneratedPositions(mappingA, mappingB) <= 0;
  }

  /**
   * A data structure to provide a sorted view of accumulated mappings in a
   * performance conscious manner. It trades a neglibable overhead in general
   * case for a large speedup in case of mappings being added in order.
   */
  function MappingList() {
    this._array = [];
    this._sorted = true;
    // Serves as infimum
    this._last = {generatedLine: -1, generatedColumn: 0};
  }

  /**
   * Iterate through internal items. This method takes the same arguments that
   * `Array.prototype.forEach` takes.
   *
   * NOTE: The order of the mappings is NOT guaranteed.
   */
  MappingList.prototype.unsortedForEach =
    function MappingList_forEach(aCallback, aThisArg) {
      this._array.forEach(aCallback, aThisArg);
    };

  /**
   * Add the given source mapping.
   *
   * @param Object aMapping
   */
  MappingList.prototype.add = function MappingList_add(aMapping) {
    var mapping;
    if (generatedPositionAfter(this._last, aMapping)) {
      this._last = aMapping;
      this._array.push(aMapping);
    } else {
      this._sorted = false;
      this._array.push(aMapping);
    }
  };

  /**
   * Returns the flat, sorted array of mappings. The mappings are sorted by
   * generated position.
   *
   * WARNING: This method returns internal data without copying, for
   * performance. The return value must NOT be mutated, and should be treated as
   * an immutable borrow. If you want to take ownership, you must make your own
   * copy.
   */
  MappingList.prototype.toArray = function MappingList_toArray() {
    if (!this._sorted) {
      this._array.sort(util.compareByGeneratedPositions);
      this._sorted = true;
    }
    return this._array;
  };

  exports.MappingList = MappingList;

});

},{"./util":117,"amdefine":118}],114:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - sourcesContent: Optional. An array of contents of the original source files.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: Optional. The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
    // requires the array) to play nice here.
    var names = util.getArg(sourceMap, 'names', []);
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file', null);

    // Once again, Sass deviates from the spec and supplies the version as a
    // string rather than a number, so we use loose equality checking here.
    if (version != this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    sources = sources.map(util.normalize);

    // Pass `true` below to allow duplicate names and sources. While source maps
    // are intended to be compressed and deduplicated, the TypeScript compiler
    // sometimes generates source maps with duplicates in them. See Github issue
    // #72 and bugzil.la/889492.
    this._names = ArraySet.fromArray(names, true);
    this._sources = ArraySet.fromArray(sources, true);

    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this.file = file;
  }

  /**
   * Create a SourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns SourceMapConsumer
   */
  SourceMapConsumer.fromSourceMap =
    function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);

      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                              smc.sourceRoot);
      smc.file = aSourceMap._file;

      smc.__generatedMappings = aSourceMap._mappings.toArray().slice();
      smc.__originalMappings = aSourceMap._mappings.toArray().slice()
        .sort(util.compareByOriginalPositions);

      return smc;
    };

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
      }, this);
    }
  });

  // `__generatedMappings` and `__originalMappings` are arrays that hold the
  // parsed mapping coordinates from the source map's "mappings" attribute. They
  // are lazily instantiated, accessed via the `_generatedMappings` and
  // `_originalMappings` getters respectively, and we only parse the mappings
  // and create these arrays once queried for a source location. We jump through
  // these hoops because there can be many thousands of mappings, and parsing
  // them is expensive, so we only want to do it if we must.
  //
  // Each object in the arrays is of the form:
  //
  //     {
  //       generatedLine: The line number in the generated code,
  //       generatedColumn: The column number in the generated code,
  //       source: The path to the original source file that generated this
  //               chunk of code,
  //       originalLine: The line number in the original source that
  //                     corresponds to this chunk of generated code,
  //       originalColumn: The column number in the original source that
  //                       corresponds to this chunk of generated code,
  //       name: The name of the original symbol which generated this chunk of
  //             code.
  //     }
  //
  // All properties except for `generatedLine` and `generatedColumn` can be
  // `null`.
  //
  // `_generatedMappings` is ordered by the generated positions.
  //
  // `_originalMappings` is ordered by the original positions.

  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
    get: function () {
      if (!this.__generatedMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__generatedMappings;
    }
  });

  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
    get: function () {
      if (!this.__originalMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__originalMappings;
    }
  });

  SourceMapConsumer.prototype._nextCharIsMappingSeparator =
    function SourceMapConsumer_nextCharIsMappingSeparator(aStr) {
      var c = aStr.charAt(0);
      return c === ";" || c === ",";
    };

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var str = aStr;
      var temp = {};
      var mapping;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          base64VLQ.decode(str, temp);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
            // Original source.
            base64VLQ.decode(str, temp);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            base64VLQ.decode(str, temp);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            base64VLQ.decode(str, temp);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
              // Original name.
              base64VLQ.decode(str, temp);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this.__generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this.__originalMappings.push(mapping);
          }
        }
      }

      this.__generatedMappings.sort(util.compareByGeneratedPositions);
      this.__originalMappings.sort(util.compareByOriginalPositions);
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  SourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator) {
      // To return the position we are searching for, we must first find the
      // mapping for the given position and then return the opposite position it
      // points to. Because the mappings are sorted, we can use binary search to
      // find the best mapping.

      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got '
                            + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '
                            + aNeedle[aColumnName]);
      }

      return binarySearch.search(aNeedle, aMappings, aComparator);
    };

  /**
   * Compute the last column for each generated mapping. The last column is
   * inclusive.
   */
  SourceMapConsumer.prototype.computeColumnSpans =
    function SourceMapConsumer_computeColumnSpans() {
      for (var index = 0; index < this._generatedMappings.length; ++index) {
        var mapping = this._generatedMappings[index];

        // Mappings do not contain a field for the last generated columnt. We
        // can come up with an optimistic estimate, however, by assuming that
        // mappings are contiguous (i.e. given two consecutive mappings, the
        // first mapping ends where the second one starts).
        if (index + 1 < this._generatedMappings.length) {
          var nextMapping = this._generatedMappings[index + 1];

          if (mapping.generatedLine === nextMapping.generatedLine) {
            mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
            continue;
          }
        }

        // The last mapping for each line spans the entire line.
        mapping.lastGeneratedColumn = Infinity;
      }
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var index = this._findMapping(needle,
                                    this._generatedMappings,
                                    "generatedLine",
                                    "generatedColumn",
                                    util.compareByGeneratedPositions);

      if (index >= 0) {
        var mapping = this._generatedMappings[index];

        if (mapping.generatedLine === needle.generatedLine) {
          var source = util.getArg(mapping, 'source', null);
          if (source != null && this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
          return {
            source: source,
            line: util.getArg(mapping, 'originalLine', null),
            column: util.getArg(mapping, 'originalColumn', null),
            name: util.getArg(mapping, 'name', null)
          };
        }
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */
  SourceMapConsumer.prototype.sourceContentFor =
    function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }

      if (this.sourceRoot != null) {
        aSource = util.relative(this.sourceRoot, aSource);
      }

      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }

      var url;
      if (this.sourceRoot != null
          && (url = util.urlParse(this.sourceRoot))) {
        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
        // many users. We can help them out when they expect file:// URIs to
        // behave like it would if they were running a local HTTP server. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file"
            && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
        }

        if ((!url.path || url.path == "/")
            && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }

      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);

      if (index >= 0) {
        var mapping = this._originalMappings[index];

        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }

      return {
        line: null,
        column: null,
        lastColumn: null
      };
    };

  /**
   * Returns all generated line and column information for the original source
   * and line provided. The only argument is an object with the following
   * properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *
   * and an array of objects is returned, each with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.allGeneratedPositionsFor =
    function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
      // When there is no exact match, SourceMapConsumer.prototype._findMapping
      // returns the index of the closest mapping less than the needle. By
      // setting needle.originalColumn to Infinity, we thus find the last
      // mapping for the given line, provided such a mapping exists.
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: Infinity
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var mappings = [];

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);
      if (index >= 0) {
        var mapping = this._originalMappings[index];

        while (mapping && mapping.originalLine === needle.originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[--index];
        }
      }

      return mappings.reverse();
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  SourceMapConsumer.prototype.eachMapping =
    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

      var mappings;
      switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
      }

      var sourceRoot = this.sourceRoot;
      mappings.map(function (mapping) {
        var source = mapping.source;
        if (source != null && sourceRoot != null) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };

  exports.SourceMapConsumer = SourceMapConsumer;

});

},{"./array-set":109,"./base64-vlq":110,"./binary-search":112,"./util":117,"amdefine":118}],115:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64VLQ = require('./base64-vlq');
  var util = require('./util');
  var ArraySet = require('./array-set').ArraySet;
  var MappingList = require('./mapping-list').MappingList;

  /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. You may pass an object with the following
   * properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: A root for all relative URLs in this source map.
   */
  function SourceMapGenerator(aArgs) {
    if (!aArgs) {
      aArgs = {};
    }
    this._file = util.getArg(aArgs, 'file', null);
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
    this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = new MappingList();
    this._sourcesContents = null;
  }

  SourceMapGenerator.prototype._version = 3;

  /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */
  SourceMapGenerator.fromSourceMap =
    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function (mapping) {
        var newMapping = {
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }
        };

        if (mapping.source != null) {
          newMapping.source = mapping.source;
          if (sourceRoot != null) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }

          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };

          if (mapping.name != null) {
            newMapping.name = mapping.name;
          }
        }

        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  SourceMapGenerator.prototype.addMapping =
    function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);

      if (!this._skipValidation) {
        this._validateMapping(generated, original, source, name);
      }

      if (source != null && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name != null && !this._names.has(name)) {
        this._names.add(name);
      }

      this._mappings.add({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };

  /**
   * Set the source content for a source file.
   */
  SourceMapGenerator.prototype.setSourceContent =
    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot != null) {
        source = util.relative(this._sourceRoot, source);
      }

      if (aSourceContent != null) {
        // Add the source content to the _sourcesContents map.
        // Create a new _sourcesContents map if the property is null.
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else if (this._sourcesContents) {
        // Remove the source file from the _sourcesContents map.
        // If the _sourcesContents map is empty, set the property to null.
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };

  /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   * @param aSourceMapPath Optional. The dirname of the path to the source map
   *        to be applied. If relative, it is relative to the SourceMapConsumer.
   *        This parameter is needed when the two source maps aren't in the same
   *        directory, and the source map to be applied contains relative source
   *        paths. If so, those relative source paths need to be rewritten
   *        relative to the SourceMapGenerator.
   */
  SourceMapGenerator.prototype.applySourceMap =
    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
      var sourceFile = aSourceFile;
      // If aSourceFile is omitted, we will use the file property of the SourceMap
      if (aSourceFile == null) {
        if (aSourceMapConsumer.file == null) {
          throw new Error(
            'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
            'or the source map\'s "file" property. Both were omitted.'
          );
        }
        sourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      // Make "sourceFile" relative if an absolute Url is passed.
      if (sourceRoot != null) {
        sourceFile = util.relative(sourceRoot, sourceFile);
      }
      // Applying the SourceMap can add and remove items from the sources and
      // the names array.
      var newSources = new ArraySet();
      var newNames = new ArraySet();

      // Find mappings for the "sourceFile"
      this._mappings.unsortedForEach(function (mapping) {
        if (mapping.source === sourceFile && mapping.originalLine != null) {
          // Check if it can be mapped by the source map, then update the mapping.
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source != null) {
            // Copy mapping
            mapping.source = original.source;
            if (aSourceMapPath != null) {
              mapping.source = util.join(aSourceMapPath, mapping.source)
            }
            if (sourceRoot != null) {
              mapping.source = util.relative(sourceRoot, mapping.source);
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name != null) {
              mapping.name = original.name;
            }
          }
        }

        var source = mapping.source;
        if (source != null && !newSources.has(source)) {
          newSources.add(source);
        }

        var name = mapping.name;
        if (name != null && !newNames.has(name)) {
          newNames.add(name);
        }

      }, this);
      this._sources = newSources;
      this._names = newNames;

      // Copy sourcesContents of applied map.
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aSourceMapPath != null) {
            sourceFile = util.join(aSourceMapPath, sourceFile);
          }
          if (sourceRoot != null) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  SourceMapGenerator.prototype._validateMapping =
    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
          && aGenerated.line > 0 && aGenerated.column >= 0
          && !aOriginal && !aSource && !aName) {
        // Case 1.
        return;
      }
      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
               && aGenerated.line > 0 && aGenerated.column >= 0
               && aOriginal.line > 0 && aOriginal.column >= 0
               && aSource) {
        // Cases 2 and 3.
        return;
      }
      else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          original: aOriginal,
          name: aName
        }));
      }
    };

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  SourceMapGenerator.prototype._serializeMappings =
    function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;

      var mappings = this._mappings.toArray();

      for (var i = 0, len = mappings.length; i < len; i++) {
        mapping = mappings[i];

        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generatedColumn
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source != null) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.originalLine - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;

          result += base64VLQ.encode(mapping.originalColumn
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;

          if (mapping.name != null) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }

      return result;
    };

  SourceMapGenerator.prototype._generateSourcesContent =
    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function (source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot != null) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                    key)
          ? this._sourcesContents[key]
          : null;
      }, this);
    };

  /**
   * Externalize the source map.
   */
  SourceMapGenerator.prototype.toJSON =
    function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._file != null) {
        map.file = this._file;
      }
      if (this._sourceRoot != null) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }

      return map;
    };

  /**
   * Render the source map being generated to a string.
   */
  SourceMapGenerator.prototype.toString =
    function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});

},{"./array-set":109,"./base64-vlq":110,"./mapping-list":113,"./util":117,"amdefine":118}],116:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
  var util = require('./util');

  // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
  // operating systems these days (capturing the result).
  var REGEX_NEWLINE = /(\r?\n)/;

  // Newline character code for charCodeAt() comparisons
  var NEWLINE_CODE = 10;

  // Private symbol for identifying `SourceNode`s when multiple versions of
  // the source-map library are loaded. This MUST NOT CHANGE across
  // versions!
  var isSourceNode = "$$$isSourceNode$$$";

  /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   * @param aName The original identifier.
   */
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine == null ? null : aLine;
    this.column = aColumn == null ? null : aColumn;
    this.source = aSource == null ? null : aSource;
    this.name = aName == null ? null : aName;
    this[isSourceNode] = true;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   * @param aRelativePath Optional. The path that relative sources in the
   *        SourceMapConsumer should be relative to.
   */
  SourceNode.fromStringWithSourceMap =
    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
      // The SourceNode we want to fill with the generated code
      // and the SourceMap
      var node = new SourceNode();

      // All even indices of this array are one line of the generated code,
      // while all odd indices are the newlines between two adjacent lines
      // (since `REGEX_NEWLINE` captures its match).
      // Processed fragments are removed from this array, by calling `shiftNextLine`.
      var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
      var shiftNextLine = function() {
        var lineContents = remainingLines.shift();
        // The last line of a file might not have a newline.
        var newLine = remainingLines.shift() || "";
        return lineContents + newLine;
      };

      // We need to remember the position of "remainingLines"
      var lastGeneratedLine = 1, lastGeneratedColumn = 0;

      // The generate SourceNodes we need a code range.
      // To extract it current and last mapping is used.
      // Here we store the last mapping.
      var lastMapping = null;

      aSourceMapConsumer.eachMapping(function (mapping) {
        if (lastMapping !== null) {
          // We add the code from "lastMapping" to "mapping":
          // First check if there is a new line in between.
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            // Associate first line with "lastMapping"
            addMappingWithCode(lastMapping, shiftNextLine());
            lastGeneratedLine++;
            lastGeneratedColumn = 0;
            // The remaining code is added without mapping
          } else {
            // There is no new line in between.
            // Associate the code between "lastGeneratedColumn" and
            // "mapping.generatedColumn" with "lastMapping"
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn -
                                          lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                                lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
            // No more remaining code, continue
            lastMapping = mapping;
            return;
          }
        }
        // We add the generated code until the first mapping
        // to the SourceNode without any mapping.
        // Each line is added as separate string.
        while (lastGeneratedLine < mapping.generatedLine) {
          node.add(shiftNextLine());
          lastGeneratedLine++;
        }
        if (lastGeneratedColumn < mapping.generatedColumn) {
          var nextLine = remainingLines[0];
          node.add(nextLine.substr(0, mapping.generatedColumn));
          remainingLines[0] = nextLine.substr(mapping.generatedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
        }
        lastMapping = mapping;
      }, this);
      // We have processed all mappings.
      if (remainingLines.length > 0) {
        if (lastMapping) {
          // Associate the remaining code in the current line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
        }
        // and add the remaining lines without any mapping
        node.add(remainingLines.join(""));
      }

      // Copy sourcesContent into SourceNode
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aRelativePath != null) {
            sourceFile = util.join(aRelativePath, sourceFile);
          }
          node.setSourceContent(sourceFile, content);
        }
      });

      return node;

      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          var source = aRelativePath
            ? util.join(aRelativePath, mapping.source)
            : mapping.source;
          node.add(new SourceNode(mapping.originalLine,
                                  mapping.originalColumn,
                                  source,
                                  code,
                                  mapping.name));
        }
      }
    };

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function (chunk) {
        this.add(chunk);
      }, this);
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length-1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length; i < len; i++) {
      chunk = this.children[i];
      if (chunk[isSourceNode]) {
        chunk.walk(aFn);
      }
      else {
        if (chunk !== '') {
          aFn(chunk, { source: this.source,
                       line: this.line,
                       column: this.column,
                       name: this.name });
        }
      }
    }
  };

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len-1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild[isSourceNode]) {
      lastChild.replaceRight(aPattern, aReplacement);
    }
    else if (typeof lastChild === 'string') {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    }
    else {
      this.children.push(''.replace(aPattern, aReplacement));
    }
    return this;
  };

  /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */
  SourceNode.prototype.setSourceContent =
    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };

  /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walkSourceContents =
    function SourceNode_walkSourceContents(aFn) {
      for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i][isSourceNode]) {
          this.children[i].walkSourceContents(aFn);
        }
      }

      var sources = Object.keys(this.sourceContents);
      for (var i = 0, len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function (chunk) {
      str += chunk;
    });
    return str;
  };

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function (chunk, original) {
      generated.code += chunk;
      if (original.source !== null
          && original.line !== null
          && original.column !== null) {
        if(lastOriginalSource !== original.source
           || lastOriginalLine !== original.line
           || lastOriginalColumn !== original.column
           || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      for (var idx = 0, length = chunk.length; idx < length; idx++) {
        if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
          generated.line++;
          generated.column = 0;
          // Mappings end at eol
          if (idx + 1 === length) {
            lastOriginalSource = null;
            sourceMappingActive = false;
          } else if (sourceMappingActive) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
        } else {
          generated.column++;
        }
      }
    });
    this.walkSourceContents(function (sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });

    return { code: generated.code, map: map };
  };

  exports.SourceNode = SourceNode;

});

},{"./source-map-generator":115,"./util":117,"amdefine":118}],117:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
  var dataUrlRegexp = /^data:.+\,.+$/;

  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5]
    };
  }
  exports.urlParse = urlParse;

  function urlGenerate(aParsedUrl) {
    var url = '';
    if (aParsedUrl.scheme) {
      url += aParsedUrl.scheme + ':';
    }
    url += '//';
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + '@';
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;

  /**
   * Normalizes a path, or the path portion of a URL:
   *
   * - Replaces consequtive slashes with one slash.
   * - Removes unnecessary '.' parts.
   * - Removes unnecessary '<dir>/..' parts.
   *
   * Based on code in the Node.js 'path' core module.
   *
   * @param aPath The path or url to normalize.
   */
  function normalize(aPath) {
    var path = aPath;
    var url = urlParse(aPath);
    if (url) {
      if (!url.path) {
        return aPath;
      }
      path = url.path;
    }
    var isAbsolute = (path.charAt(0) === '/');

    var parts = path.split(/\/+/);
    for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
      part = parts[i];
      if (part === '.') {
        parts.splice(i, 1);
      } else if (part === '..') {
        up++;
      } else if (up > 0) {
        if (part === '') {
          // The first part is blank if the path is absolute. Trying to go
          // above the root is a no-op. Therefore we can remove all '..' parts
          // directly after the root.
          parts.splice(i + 1, up);
          up = 0;
        } else {
          parts.splice(i, 2);
          up--;
        }
      }
    }
    path = parts.join('/');

    if (path === '') {
      path = isAbsolute ? '/' : '.';
    }

    if (url) {
      url.path = path;
      return urlGenerate(url);
    }
    return path;
  }
  exports.normalize = normalize;

  /**
   * Joins two paths/URLs.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be joined with the root.
   *
   * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
   *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
   *   first.
   * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
   *   is updated with the result and aRoot is returned. Otherwise the result
   *   is returned.
   *   - If aPath is absolute, the result is aPath.
   *   - Otherwise the two paths are joined with a slash.
   * - Joining for example 'http://' and 'www.example.com' is also supported.
   */
  function join(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    if (aPath === "") {
      aPath = ".";
    }
    var aPathUrl = urlParse(aPath);
    var aRootUrl = urlParse(aRoot);
    if (aRootUrl) {
      aRoot = aRootUrl.path || '/';
    }

    // `join(foo, '//www.example.org')`
    if (aPathUrl && !aPathUrl.scheme) {
      if (aRootUrl) {
        aPathUrl.scheme = aRootUrl.scheme;
      }
      return urlGenerate(aPathUrl);
    }

    if (aPathUrl || aPath.match(dataUrlRegexp)) {
      return aPath;
    }

    // `join('http://', 'www.example.com')`
    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
      aRootUrl.host = aPath;
      return urlGenerate(aRootUrl);
    }

    var joined = aPath.charAt(0) === '/'
      ? aPath
      : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

    if (aRootUrl) {
      aRootUrl.path = joined;
      return urlGenerate(aRootUrl);
    }
    return joined;
  }
  exports.join = join;

  /**
   * Make a path relative to a URL or another path.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be made relative to aRoot.
   */
  function relative(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }

    aRoot = aRoot.replace(/\/$/, '');

    // XXX: It is possible to remove this block, and the tests still pass!
    var url = urlParse(aRoot);
    if (aPath.charAt(0) == "/" && url && url.path == "/") {
      return aPath.slice(1);
    }

    return aPath.indexOf(aRoot + '/') === 0
      ? aPath.substr(aRoot.length + 1)
      : aPath;
  }
  exports.relative = relative;

  /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  function toSetString(aStr) {
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  function strcmp(aStr1, aStr2) {
    var s1 = aStr1 || "";
    var s2 = aStr2 || "";
    return (s1 > s2) - (s1 < s2);
  }

  /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp;

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp || onlyCompareOriginal) {
      return cmp;
    }

    cmp = strcmp(mappingA.name, mappingB.name);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    return mappingA.generatedColumn - mappingB.generatedColumn;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings where the generated positions are
   * compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
    var cmp;

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp || onlyCompareGenerated) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositions = compareByGeneratedPositions;

});

},{"amdefine":118}],118:[function(require,module,exports){
(function (process,__filename){
/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 0.1.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                process.nextTick(function () {
                    callback.apply(null, deps);
                });
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

}).call(this,require('_process'),"/node_modules/escodegen/node_modules/source-map/node_modules/amdefine/amdefine.js")
},{"_process":101,"path":100}],119:[function(require,module,exports){
module.exports={
  "name": "escodegen",
  "description": "ECMAScript code generator",
  "homepage": "http://github.com/estools/escodegen",
  "main": "escodegen.js",
  "bin": {
    "esgenerate": "./bin/esgenerate.js",
    "escodegen": "./bin/escodegen.js"
  },
  "files": [
    "LICENSE.BSD",
    "LICENSE.source-map",
    "README.md",
    "bin",
    "escodegen.js",
    "package.json"
  ],
  "version": "1.6.1",
  "engines": {
    "node": ">=0.10.0"
  },
  "maintainers": [
    {
      "name": "constellation",
      "email": "utatane.tea@gmail.com"
    }
  ],
  "repository": {
    "type": "git",
    "url": "http://github.com/estools/escodegen.git"
  },
  "dependencies": {
    "estraverse": "^1.9.1",
    "esutils": "^1.1.6",
    "esprima": "^1.2.2",
    "optionator": "^0.5.0",
    "source-map": "~0.1.40"
  },
  "optionalDependencies": {
    "source-map": "~0.1.40"
  },
  "devDependencies": {
    "acorn-6to5": "^0.11.1-25",
    "bluebird": "^2.3.11",
    "bower-registry-client": "^0.2.1",
    "chai": "^1.10.0",
    "commonjs-everywhere": "^0.9.7",
    "esprima-moz": "*",
    "gulp": "^3.8.10",
    "gulp-eslint": "^0.2.0",
    "gulp-mocha": "^2.0.0",
    "semver": "^4.1.0"
  },
  "licenses": [
    {
      "type": "BSD",
      "url": "http://github.com/estools/escodegen/raw/master/LICENSE.BSD"
    }
  ],
  "scripts": {
    "test": "gulp travis",
    "unit-test": "gulp test",
    "lint": "gulp lint",
    "release": "node tools/release.js",
    "build-min": "cjsify -ma path: tools/entry-point.js > escodegen.browser.min.js",
    "build": "cjsify -a path: tools/entry-point.js > escodegen.browser.js"
  },
  "gitHead": "1ca664f68dcf220b76c9dc562b2337c5e0b4227d",
  "bugs": {
    "url": "https://github.com/estools/escodegen/issues"
  },
  "_id": "escodegen@1.6.1",
  "_shasum": "367de17d8510540d12bc6dcb8b3f918391265815",
  "_from": "escodegen@>=1.6.1 <2.0.0",
  "_npmVersion": "2.0.0-alpha-5",
  "_npmUser": {
    "name": "constellation",
    "email": "utatane.tea@gmail.com"
  },
  "dist": {
    "shasum": "367de17d8510540d12bc6dcb8b3f918391265815",
    "tarball": "http://registry.npmjs.org/escodegen/-/escodegen-1.6.1.tgz"
  },
  "directories": {},
  "_resolved": "https://registry.npmjs.org/escodegen/-/escodegen-1.6.1.tgz",
  "readme": "ERROR: No README data found!"
}

},{}],120:[function(require,module,exports){
/*
  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
  Copyright (C) 2013 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.esprima = {}));
    }
}(this, function (exports) {
    'use strict';

    var Token,
        TokenName,
        FnExprTokens,
        Syntax,
        PlaceHolders,
        Messages,
        Regex,
        source,
        strict,
        sourceType,
        index,
        lineNumber,
        lineStart,
        hasLineTerminator,
        lastIndex,
        lastLineNumber,
        lastLineStart,
        startIndex,
        startLineNumber,
        startLineStart,
        scanning,
        length,
        lookahead,
        state,
        extra,
        isBindingElement,
        isAssignmentTarget,
        firstCoverInitializedNameError;

    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        RegularExpression: 9,
        Template: 10
    };

    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';
    TokenName[Token.RegularExpression] = 'RegularExpression';
    TokenName[Token.Template] = 'Template';

    // A function following one of those tokens is an expression.
    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
                    'return', 'case', 'delete', 'throw', 'void',
                    // assignment operators
                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
                    '&=', '|=', '^=', ',',
                    // binary/unary operators
                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
                    '<=', '<', '>', '!=', '!=='];

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        AssignmentPattern: 'AssignmentPattern',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExportAllDeclaration: 'ExportAllDeclaration',
        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
        ExportNamedDeclaration: 'ExportNamedDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        RestElement: 'RestElement',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        Super: 'Super',
        SwitchCase: 'SwitchCase',
        SwitchStatement: 'SwitchStatement',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    PlaceHolders = {
        ArrowParameterPlaceHolder: 'ArrowParameterPlaceHolder'
    };

    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken: 'Unexpected token %0',
        UnexpectedNumber: 'Unexpected number',
        UnexpectedString: 'Unexpected string',
        UnexpectedIdentifier: 'Unexpected identifier',
        UnexpectedReserved: 'Unexpected reserved word',
        UnexpectedTemplate: 'Unexpected quasi %0',
        UnexpectedEOS: 'Unexpected end of input',
        NewlineAfterThrow: 'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp: 'Invalid regular expression: missing /',
        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NoCatchOrFinally: 'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        StrictModeWith: 'Strict mode code may not include a with statement',
        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord: 'Use of future reserved word in strict mode',
        TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
        ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
        DefaultRestParameter: 'Unexpected token =',
        ObjectPatternAsRestParameter: 'Unexpected token {',
        DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
        ConstructorSpecialMethod: 'Class constructor may not be an accessor',
        DuplicateConstructor: 'A class may only have one constructor',
        StaticPrototype: 'Classes may not have static property named prototype',
        MissingFromClause: 'Unexpected token',
        NoAsAfterImportNamespace: 'Unexpected token',
        InvalidModuleSpecifier: 'Unexpected token',
        IllegalImportDeclaration: 'Unexpected token',
        IllegalExportDeclaration: 'Unexpected token'
    };

    // See also tools/generate-unicode-regex.py.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        /* istanbul ignore if */
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function isDecimalDigit(ch) {
        return (ch >= 0x30 && ch <= 0x39);   // 0..9
    }

    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }

    function octalToDecimal(ch) {
        // \0 is not octal escape sequence
        var octal = (ch !== '0'), code = '01234567'.indexOf(ch);

        if (index < length && isOctalDigit(source[index])) {
            octal = true;
            code = code * 8 + '01234567'.indexOf(source[index++]);

            // 3 digits are only allowed when string starts
            // with 0, 1, 2, 3
            if ('0123'.indexOf(ch) >= 0 &&
                    index < length &&
                    isOctalDigit(source[index])) {
                code = code * 8 + '01234567'.indexOf(source[index++]);
            }
        }

        return {
            code: code,
            octal: octal
        };
    }

    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
    }

    function isIdentifierPart(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch >= 0x30 && ch <= 0x39) ||         // 0..9
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
    }

    // 7.6.1.2 Future Reserved Words

    function isFutureReservedWord(id) {
        switch (id) {
        case 'enum':
        case 'export':
        case 'import':
        case 'super':
            return true;
        default:
            return false;
        }
    }

    // 11.6.2.2 Future Reserved Words

    function isStrictModeReservedWord(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    // 7.6.1.1 Keywords

    function isKeyword(id) {

        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatibility with SpiderMonkey and ES.next.
        // Some others are from future reserved words.

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') ||
                (id === 'try') || (id === 'let');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    // 7.4 Comments

    function addComment(type, value, start, end, loc) {
        var comment;

        assert(typeof start === 'number', 'Comment must have valid position');

        state.lastCommentStart = start;

        comment = {
            type: type,
            value: value
        };
        if (extra.range) {
            comment.range = [start, end];
        }
        if (extra.loc) {
            comment.loc = loc;
        }
        extra.comments.push(comment);
        if (extra.attachComment) {
            extra.leadingComments.push(comment);
            extra.trailingComments.push(comment);
        }
    }

    function skipSingleLineComment(offset) {
        var start, loc, ch, comment;

        start = index - offset;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart - offset
            }
        };

        while (index < length) {
            ch = source.charCodeAt(index);
            ++index;
            if (isLineTerminator(ch)) {
                hasLineTerminator = true;
                if (extra.comments) {
                    comment = source.slice(start + offset, index - 1);
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    addComment('Line', comment, start, index - 1, loc);
                }
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                return;
            }
        }

        if (extra.comments) {
            comment = source.slice(start + offset, index);
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
            addComment('Line', comment, start, index, loc);
        }
    }

    function skipMultiLineComment() {
        var start, loc, ch, comment;

        if (extra.comments) {
            start = index - 2;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart - 2
                }
            };
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (isLineTerminator(ch)) {
                if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {
                    ++index;
                }
                hasLineTerminator = true;
                ++lineNumber;
                ++index;
                lineStart = index;
            } else if (ch === 0x2A) {
                // Block comment ends with '*/'.
                if (source.charCodeAt(index + 1) === 0x2F) {
                    ++index;
                    ++index;
                    if (extra.comments) {
                        comment = source.slice(start + 2, index - 2);
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        addComment('Block', comment, start, index, loc);
                    }
                    return;
                }
                ++index;
            } else {
                ++index;
            }
        }

        // Ran off the end of the file - the whole thing is a comment
        if (extra.comments) {
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
            comment = source.slice(start + 2, index);
            addComment('Block', comment, start, index, loc);
        }
        tolerateUnexpectedToken();
    }

    function skipComment() {
        var ch, start;
        hasLineTerminator = false;

        start = (index === 0);
        while (index < length) {
            ch = source.charCodeAt(index);

            if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                hasLineTerminator = true;
                ++index;
                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                start = true;
            } else if (ch === 0x2F) { // U+002F is '/'
                ch = source.charCodeAt(index + 1);
                if (ch === 0x2F) {
                    ++index;
                    ++index;
                    skipSingleLineComment(2);
                    start = true;
                } else if (ch === 0x2A) {  // U+002A is '*'
                    ++index;
                    ++index;
                    skipMultiLineComment();
                } else {
                    break;
                }
            } else if (start && ch === 0x2D) { // U+002D is '-'
                // U+003E is '>'
                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
                    // '-->' is a single-line comment
                    index += 3;
                    skipSingleLineComment(3);
                } else {
                    break;
                }
            } else if (ch === 0x3C) { // U+003C is '<'
                if (source.slice(index + 1, index + 4) === '!--') {
                    ++index; // `<`
                    ++index; // `!`
                    ++index; // `-`
                    ++index; // `-`
                    skipSingleLineComment(4);
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }

    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;

        len = (prefix === 'u') ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = source[index++];
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }

    function scanUnicodeCodePointEscape() {
        var ch, code, cu1, cu2;

        ch = source[index];
        code = 0;

        // At least, one hex digit is required.
        if (ch === '}') {
            throwUnexpectedToken();
        }

        while (index < length) {
            ch = source[index++];
            if (!isHexDigit(ch)) {
                break;
            }
            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
        }

        if (code > 0x10FFFF || ch !== '}') {
            throwUnexpectedToken();
        }

        // UTF-16 Encoding
        if (code <= 0xFFFF) {
            return String.fromCharCode(code);
        }
        cu1 = ((code - 0x10000) >> 10) + 0xD800;
        cu2 = ((code - 0x10000) & 1023) + 0xDC00;
        return String.fromCharCode(cu1, cu2);
    }

    function getEscapedIdentifier() {
        var ch, id;

        ch = source.charCodeAt(index++);
        id = String.fromCharCode(ch);

        // '\u' (U+005C, U+0075) denotes an escaped character.
        if (ch === 0x5C) {
            if (source.charCodeAt(index) !== 0x75) {
                throwUnexpectedToken();
            }
            ++index;
            ch = scanHexEscape('u');
            if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
                throwUnexpectedToken();
            }
            id = ch;
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (!isIdentifierPart(ch)) {
                break;
            }
            ++index;
            id += String.fromCharCode(ch);

            // '\u' (U+005C, U+0075) denotes an escaped character.
            if (ch === 0x5C) {
                id = id.substr(0, id.length - 1);
                if (source.charCodeAt(index) !== 0x75) {
                    throwUnexpectedToken();
                }
                ++index;
                ch = scanHexEscape('u');
                if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
                    throwUnexpectedToken();
                }
                id += ch;
            }
        }

        return id;
    }

    function getIdentifier() {
        var start, ch;

        start = index++;
        while (index < length) {
            ch = source.charCodeAt(index);
            if (ch === 0x5C) {
                // Blackslash (U+005C) marks Unicode escape sequence.
                index = start;
                return getEscapedIdentifier();
            }
            if (isIdentifierPart(ch)) {
                ++index;
            } else {
                break;
            }
        }

        return source.slice(start, index);
    }

    function scanIdentifier() {
        var start, id, type;

        start = index;

        // Backslash (U+005C) starts an escaped character.
        id = (source.charCodeAt(index) === 0x5C) ? getEscapedIdentifier() : getIdentifier();

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            type = Token.Identifier;
        } else if (isKeyword(id)) {
            type = Token.Keyword;
        } else if (id === 'null') {
            type = Token.NullLiteral;
        } else if (id === 'true' || id === 'false') {
            type = Token.BooleanLiteral;
        } else {
            type = Token.Identifier;
        }

        return {
            type: type,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }


    // 7.7 Punctuators

    function scanPunctuator() {
        var token, str;

        token = {
            type: Token.Punctuator,
            value: '',
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: index,
            end: index
        };

        // Check for most common single-character punctuators.
        str = source[index];
        switch (str) {

        case '(':
            if (extra.tokenize) {
                extra.openParenToken = extra.tokens.length;
            }
            ++index;
            break;

        case '{':
            if (extra.tokenize) {
                extra.openCurlyToken = extra.tokens.length;
            }
            state.curlyStack.push('{');
            ++index;
            break;

        case '.':
            ++index;
            if (source[index] === '.' && source[index + 1] === '.') {
                // Spread operator: ...
                index += 2;
                str = '...';
            }
            break;

        case '}':
            ++index;
            state.curlyStack.pop();
            break;
        case ')':
        case ';':
        case ',':
        case '[':
        case ']':
        case ':':
        case '?':
        case '~':
            ++index;
            break;

        default:
            // 4-character punctuator.
            str = source.substr(index, 4);
            if (str === '>>>=') {
                index += 4;
            } else {

                // 3-character punctuators.
                str = str.substr(0, 3);
                if (str === '===' || str === '!==' || str === '>>>' ||
                    str === '<<=' || str === '>>=') {
                    index += 3;
                } else {

                    // 2-character punctuators.
                    str = str.substr(0, 2);
                    if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
                        str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
                        str === '++' || str === '--' || str === '<<' || str === '>>' ||
                        str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
                        str === '<=' || str === '>=' || str === '=>') {
                        index += 2;
                    } else {

                        // 1-character punctuators.
                        str = source[index];
                        if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
                            ++index;
                        }
                    }
                }
            }
        }

        if (index === token.start) {
            throwUnexpectedToken();
        }

        token.end = index;
        token.value = str;
        return token;
    }

    // 7.8.3 Numeric Literals

    function scanHexLiteral(start) {
        var number = '';

        while (index < length) {
            if (!isHexDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (number.length === 0) {
            throwUnexpectedToken();
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt('0x' + number, 16),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function scanBinaryLiteral(start) {
        var ch, number;

        number = '';

        while (index < length) {
            ch = source[index];
            if (ch !== '0' && ch !== '1') {
                break;
            }
            number += source[index++];
        }

        if (number.length === 0) {
            // only 0b or 0B
            throwUnexpectedToken();
        }

        if (index < length) {
            ch = source.charCodeAt(index);
            /* istanbul ignore else */
            if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                throwUnexpectedToken();
            }
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 2),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function scanOctalLiteral(prefix, start) {
        var number, octal;

        if (isOctalDigit(prefix)) {
            octal = true;
            number = '0' + source[index++];
        } else {
            octal = false;
            ++index;
            number = '';
        }

        while (index < length) {
            if (!isOctalDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (!octal && number.length === 0) {
            // only 0o or 0O
            throwUnexpectedToken();
        }

        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
            throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 8),
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function isImplicitOctalLiteral() {
        var i, ch;

        // Implicit octal, unless there is a non-octal digit.
        // (Annex B.1.1 on Numeric Literals)
        for (i = index + 1; i < length; ++i) {
            ch = source[i];
            if (ch === '8' || ch === '9') {
                return false;
            }
            if (!isOctalDigit(ch)) {
                return true;
            }
        }

        return true;
    }

    function scanNumericLiteral() {
        var number, start, ch;

        ch = source[index];
        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
            'Numeric literal must start with a decimal digit or a decimal point');

        start = index;
        number = '';
        if (ch !== '.') {
            number = source[index++];
            ch = source[index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    ++index;
                    return scanHexLiteral(start);
                }
                if (ch === 'b' || ch === 'B') {
                    ++index;
                    return scanBinaryLiteral(start);
                }
                if (ch === 'o' || ch === 'O') {
                    return scanOctalLiteral(ch, start);
                }

                if (isOctalDigit(ch)) {
                    if (isImplicitOctalLiteral()) {
                        return scanOctalLiteral(ch, start);
                    }
                }
            }

            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === '.') {
            number += source[index++];
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === 'e' || ch === 'E') {
            number += source[index++];

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }
            if (isDecimalDigit(source.charCodeAt(index))) {
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
            } else {
                throwUnexpectedToken();
            }
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwUnexpectedToken();
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    // 7.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, unescaped, octToDec, octal = false;

        quote = source[index];
        assert((quote === '\'' || quote === '"'),
            'String literal must starts with a quote');

        start = index;
        ++index;

        while (index < length) {
            ch = source[index++];

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            str += scanUnicodeCodePointEscape();
                        } else {
                            unescaped = scanHexEscape(ch);
                            if (!unescaped) {
                                throw throwUnexpectedToken();
                            }
                            str += unescaped;
                        }
                        break;
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;
                    case '8':
                    case '9':
                        throw throwUnexpectedToken();

                    default:
                        if (isOctalDigit(ch)) {
                            octToDec = octalToDecimal(ch);

                            octal = octToDec.octal || octal;
                            str += String.fromCharCode(octToDec.code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    lineStart = index;
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            throwUnexpectedToken();
        }

        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: startLineNumber,
            lineStart: startLineStart,
            start: start,
            end: index
        };
    }

    function scanTemplate() {
        var cooked = '', ch, start, rawOffset, terminated, head, tail, restore, unescaped;

        terminated = false;
        tail = false;
        start = index;
        head = (source[index] === '`');
        rawOffset = 2;

        ++index;

        while (index < length) {
            ch = source[index++];
            if (ch === '`') {
                rawOffset = 1;
                tail = true;
                terminated = true;
                break;
            } else if (ch === '$') {
                if (source[index] === '{') {
                    state.curlyStack.push('${');
                    ++index;
                    terminated = true;
                    break;
                }
                cooked += ch;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'n':
                        cooked += '\n';
                        break;
                    case 'r':
                        cooked += '\r';
                        break;
                    case 't':
                        cooked += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            cooked += scanUnicodeCodePointEscape();
                        } else {
                            restore = index;
                            unescaped = scanHexEscape(ch);
                            if (unescaped) {
                                cooked += unescaped;
                            } else {
                                index = restore;
                                cooked += ch;
                            }
                        }
                        break;
                    case 'b':
                        cooked += '\b';
                        break;
                    case 'f':
                        cooked += '\f';
                        break;
                    case 'v':
                        cooked += '\v';
                        break;

                    default:
                        if (ch === '0') {
                            if (isDecimalDigit(source.charCodeAt(index))) {
                                // Illegal: \01 \02 and so on
                                throwError(Messages.TemplateOctalLiteral);
                            }
                            cooked += '\0';
                        } else if (isOctalDigit(ch)) {
                            // Illegal: \1 \2
                            throwError(Messages.TemplateOctalLiteral);
                        } else {
                            cooked += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    lineStart = index;
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                ++lineNumber;
                if (ch === '\r' && source[index] === '\n') {
                    ++index;
                }
                lineStart = index;
                cooked += '\n';
            } else {
                cooked += ch;
            }
        }

        if (!terminated) {
            throwUnexpectedToken();
        }

        if (!head) {
            state.curlyStack.pop();
        }

        return {
            type: Token.Template,
            value: {
                cooked: cooked,
                raw: source.slice(start + 1, index - rawOffset)
            },
            head: head,
            tail: tail,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function testRegExp(pattern, flags) {
        var tmp = pattern;

        if (flags.indexOf('u') >= 0) {
            // Replace each astral symbol and every Unicode escape sequence
            // that possibly represents an astral symbol or a paired surrogate
            // with a single ASCII symbol to avoid throwing on regular
            // expressions that are only valid in combination with the `/u`
            // flag.
            // Note: replacing with the ASCII symbol `x` might cause false
            // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
            // perfectly valid pattern that is equivalent to `[a-b]`, but it
            // would be replaced by `[x-b]` which throws an error.
            tmp = tmp
                .replace(/\\u\{([0-9a-fA-F]+)\}/g, function ($0, $1) {
                    if (parseInt($1, 16) <= 0x10FFFF) {
                        return 'x';
                    }
                    throwUnexpectedToken(null, Messages.InvalidRegExp);
                })
                .replace(
                    /\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
                    'x'
                );
        }

        // First, detect invalid regular expressions.
        try {
            RegExp(tmp);
        } catch (e) {
            throwUnexpectedToken(null, Messages.InvalidRegExp);
        }

        // Return a regular expression object for this pattern-flag pair, or
        // `null` in case the current environment doesn't support the flags it
        // uses.
        try {
            return new RegExp(pattern, flags);
        } catch (exception) {
            return null;
        }
    }

    function scanRegExpBody() {
        var ch, str, classMarker, terminated, body;

        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = source[index++];

        classMarker = false;
        terminated = false;
        while (index < length) {
            ch = source[index++];
            str += ch;
            if (ch === '\\') {
                ch = source[index++];
                // ECMA-262 7.8.5
                if (isLineTerminator(ch.charCodeAt(0))) {
                    throwUnexpectedToken(null, Messages.UnterminatedRegExp);
                }
                str += ch;
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                throwUnexpectedToken(null, Messages.UnterminatedRegExp);
            } else if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                }
            }
        }

        if (!terminated) {
            throwUnexpectedToken(null, Messages.UnterminatedRegExp);
        }

        // Exclude leading and trailing slash.
        body = str.substr(1, str.length - 2);
        return {
            value: body,
            literal: str
        };
    }

    function scanRegExpFlags() {
        var ch, str, flags, restore;

        str = '';
        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch.charCodeAt(0))) {
                break;
            }

            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        for (str += '\\u'; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                    tolerateUnexpectedToken();
                } else {
                    str += '\\';
                    tolerateUnexpectedToken();
                }
            } else {
                flags += ch;
                str += ch;
            }
        }

        return {
            value: flags,
            literal: str
        };
    }

    function scanRegExp() {
        scanning = true;
        var start, body, flags, value;

        lookahead = null;
        skipComment();
        start = index;

        body = scanRegExpBody();
        flags = scanRegExpFlags();
        value = testRegExp(body.value, flags.value);
        scanning = false;
        if (extra.tokenize) {
            return {
                type: Token.RegularExpression,
                value: value,
                regex: {
                    pattern: body.value,
                    flags: flags.value
                },
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: start,
                end: index
            };
        }

        return {
            literal: body.literal + flags.literal,
            value: value,
            regex: {
                pattern: body.value,
                flags: flags.value
            },
            start: start,
            end: index
        };
    }

    function collectRegex() {
        var pos, loc, regex, token;

        skipComment();

        pos = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        regex = scanRegExp();

        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        /* istanbul ignore next */
        if (!extra.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra.tokens.length > 0) {
                token = extra.tokens[extra.tokens.length - 1];
                if (token.range[0] === pos && token.type === 'Punctuator') {
                    if (token.value === '/' || token.value === '/=') {
                        extra.tokens.pop();
                    }
                }
            }

            extra.tokens.push({
                type: 'RegularExpression',
                value: regex.literal,
                regex: regex.regex,
                range: [pos, index],
                loc: loc
            });
        }

        return regex;
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral;
    }

    function advanceSlash() {
        var prevToken,
            checkToken;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken = extra.tokens[extra.tokens.length - 1];
        if (!prevToken) {
            // Nothing before that: it cannot be a division.
            return collectRegex();
        }
        if (prevToken.type === 'Punctuator') {
            if (prevToken.value === ']') {
                return scanPunctuator();
            }
            if (prevToken.value === ')') {
                checkToken = extra.tokens[extra.openParenToken - 1];
                if (checkToken &&
                        checkToken.type === 'Keyword' &&
                        (checkToken.value === 'if' ||
                         checkToken.value === 'while' ||
                         checkToken.value === 'for' ||
                         checkToken.value === 'with')) {
                    return collectRegex();
                }
                return scanPunctuator();
            }
            if (prevToken.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra.tokens[extra.openCurlyToken - 3] &&
                        extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken = extra.tokens[extra.openCurlyToken - 4];
                    if (!checkToken) {
                        return scanPunctuator();
                    }
                } else if (extra.tokens[extra.openCurlyToken - 4] &&
                        extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken = extra.tokens[extra.openCurlyToken - 5];
                    if (!checkToken) {
                        return collectRegex();
                    }
                } else {
                    return scanPunctuator();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens.indexOf(checkToken.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator();
                }
                // It is a declaration.
                return collectRegex();
            }
            return collectRegex();
        }
        if (prevToken.type === 'Keyword' && prevToken.value !== 'this') {
            return collectRegex();
        }
        return scanPunctuator();
    }

    function advance() {
        var ch, token;

        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: index,
                end: index
            };
        }

        ch = source.charCodeAt(index);

        if (isIdentifierStart(ch)) {
            token = scanIdentifier();
            if (strict && isStrictModeReservedWord(token.value)) {
                token.type = Token.Keyword;
            }
            return token;
        }

        // Very common: ( and ) and ;
        if (ch === 0x28 || ch === 0x29 || ch === 0x3B) {
            return scanPunctuator();
        }

        // String literal starts with single quote (U+0027) or double quote (U+0022).
        if (ch === 0x27 || ch === 0x22) {
            return scanStringLiteral();
        }

        // Dot (.) U+002E can also start a floating-point number, hence the need
        // to check the next character.
        if (ch === 0x2E) {
            if (isDecimalDigit(source.charCodeAt(index + 1))) {
                return scanNumericLiteral();
            }
            return scanPunctuator();
        }

        if (isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }

        // Slash (/) U+002F can also start a regex.
        if (extra.tokenize && ch === 0x2F) {
            return advanceSlash();
        }

        // Template literals start with ` (U+0060) for template head
        // or } (U+007D) for template middle or template tail.
        if (ch === 0x60 || (ch === 0x7D && state.curlyStack[state.curlyStack.length - 1] === '${')) {
            return scanTemplate();
        }

        return scanPunctuator();
    }

    function collectToken() {
        var loc, token, value, entry;

        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        token = advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (token.type !== Token.EOF) {
            value = source.slice(token.start, token.end);
            entry = {
                type: TokenName[token.type],
                value: value,
                range: [token.start, token.end],
                loc: loc
            };
            if (token.regex) {
                entry.regex = {
                    pattern: token.regex.pattern,
                    flags: token.regex.flags
                };
            }
            extra.tokens.push(entry);
        }

        return token;
    }

    function lex() {
        var token;
        scanning = true;

        lastIndex = index;
        lastLineNumber = lineNumber;
        lastLineStart = lineStart;

        skipComment();

        token = lookahead;

        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;

        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
        scanning = false;
        return token;
    }

    function peek() {
        scanning = true;

        skipComment();

        lastIndex = index;
        lastLineNumber = lineNumber;
        lastLineStart = lineStart;

        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;

        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
        scanning = false;
    }

    function Position() {
        this.line = startLineNumber;
        this.column = startIndex - startLineStart;
    }

    function SourceLocation() {
        this.start = new Position();
        this.end = null;
    }

    function WrappingSourceLocation(startToken) {
        this.start = {
            line: startToken.lineNumber,
            column: startToken.start - startToken.lineStart
        };
        this.end = null;
    }

    function Node() {
        if (extra.range) {
            this.range = [startIndex, 0];
        }
        if (extra.loc) {
            this.loc = new SourceLocation();
        }
    }

    function WrappingNode(startToken) {
        if (extra.range) {
            this.range = [startToken.start, 0];
        }
        if (extra.loc) {
            this.loc = new WrappingSourceLocation(startToken);
        }
    }

    WrappingNode.prototype = Node.prototype = {

        processComment: function () {
            var lastChild,
                leadingComments,
                trailingComments,
                bottomRight = extra.bottomRightStack,
                i,
                comment,
                last = bottomRight[bottomRight.length - 1];

            if (this.type === Syntax.Program) {
                if (this.body.length > 0) {
                    return;
                }
            }

            if (extra.trailingComments.length > 0) {
                trailingComments = [];
                for (i = extra.trailingComments.length - 1; i >= 0; --i) {
                    comment = extra.trailingComments[i];
                    if (comment.range[0] >= this.range[1]) {
                        trailingComments.unshift(comment);
                        extra.trailingComments.splice(i, 1);
                    }
                }
                extra.trailingComments = [];
            } else {
                if (last && last.trailingComments && last.trailingComments[0].range[0] >= this.range[1]) {
                    trailingComments = last.trailingComments;
                    delete last.trailingComments;
                }
            }

            // Eating the stack.
            if (last) {
                while (last && last.range[0] >= this.range[0]) {
                    lastChild = last;
                    last = bottomRight.pop();
                }
            }

            if (lastChild) {
                if (lastChild.leadingComments && lastChild.leadingComments[lastChild.leadingComments.length - 1].range[1] <= this.range[0]) {
                    this.leadingComments = lastChild.leadingComments;
                    lastChild.leadingComments = undefined;
                }
            } else if (extra.leadingComments.length > 0) {
                leadingComments = [];
                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
                    comment = extra.leadingComments[i];
                    if (comment.range[1] <= this.range[0]) {
                        leadingComments.unshift(comment);
                        extra.leadingComments.splice(i, 1);
                    }
                }
            }


            if (leadingComments && leadingComments.length > 0) {
                this.leadingComments = leadingComments;
            }
            if (trailingComments && trailingComments.length > 0) {
                this.trailingComments = trailingComments;
            }

            bottomRight.push(this);
        },

        finish: function () {
            if (extra.range) {
                this.range[1] = lastIndex;
            }
            if (extra.loc) {
                this.loc.end = {
                    line: lastLineNumber,
                    column: lastIndex - lastLineStart
                };
                if (extra.source) {
                    this.loc.source = extra.source;
                }
            }

            if (extra.attachComment) {
                this.processComment();
            }
        },

        finishArrayExpression: function (elements) {
            this.type = Syntax.ArrayExpression;
            this.elements = elements;
            this.finish();
            return this;
        },

        finishArrayPattern: function (elements) {
            this.type = Syntax.ArrayPattern;
            this.elements = elements;
            this.finish();
            return this;
        },

        finishArrowFunctionExpression: function (params, defaults, body, expression) {
            this.type = Syntax.ArrowFunctionExpression;
            this.id = null;
            this.params = params;
            this.defaults = defaults;
            this.body = body;
            this.generator = false;
            this.expression = expression;
            this.finish();
            return this;
        },

        finishAssignmentExpression: function (operator, left, right) {
            this.type = Syntax.AssignmentExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
            this.finish();
            return this;
        },

        finishAssignmentPattern: function (left, right) {
            this.type = Syntax.AssignmentPattern;
            this.left = left;
            this.right = right;
            this.finish();
            return this;
        },

        finishBinaryExpression: function (operator, left, right) {
            this.type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression : Syntax.BinaryExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
            this.finish();
            return this;
        },

        finishBlockStatement: function (body) {
            this.type = Syntax.BlockStatement;
            this.body = body;
            this.finish();
            return this;
        },

        finishBreakStatement: function (label) {
            this.type = Syntax.BreakStatement;
            this.label = label;
            this.finish();
            return this;
        },

        finishCallExpression: function (callee, args) {
            this.type = Syntax.CallExpression;
            this.callee = callee;
            this.arguments = args;
            this.finish();
            return this;
        },

        finishCatchClause: function (param, body) {
            this.type = Syntax.CatchClause;
            this.param = param;
            this.body = body;
            this.finish();
            return this;
        },

        finishClassBody: function (body) {
            this.type = Syntax.ClassBody;
            this.body = body;
            this.finish();
            return this;
        },

        finishClassDeclaration: function (id, superClass, body) {
            this.type = Syntax.ClassDeclaration;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
            this.finish();
            return this;
        },

        finishClassExpression: function (id, superClass, body) {
            this.type = Syntax.ClassExpression;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
            this.finish();
            return this;
        },

        finishConditionalExpression: function (test, consequent, alternate) {
            this.type = Syntax.ConditionalExpression;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
            this.finish();
            return this;
        },

        finishContinueStatement: function (label) {
            this.type = Syntax.ContinueStatement;
            this.label = label;
            this.finish();
            return this;
        },

        finishDebuggerStatement: function () {
            this.type = Syntax.DebuggerStatement;
            this.finish();
            return this;
        },

        finishDoWhileStatement: function (body, test) {
            this.type = Syntax.DoWhileStatement;
            this.body = body;
            this.test = test;
            this.finish();
            return this;
        },

        finishEmptyStatement: function () {
            this.type = Syntax.EmptyStatement;
            this.finish();
            return this;
        },

        finishExpressionStatement: function (expression) {
            this.type = Syntax.ExpressionStatement;
            this.expression = expression;
            this.finish();
            return this;
        },

        finishForStatement: function (init, test, update, body) {
            this.type = Syntax.ForStatement;
            this.init = init;
            this.test = test;
            this.update = update;
            this.body = body;
            this.finish();
            return this;
        },

        finishForInStatement: function (left, right, body) {
            this.type = Syntax.ForInStatement;
            this.left = left;
            this.right = right;
            this.body = body;
            this.each = false;
            this.finish();
            return this;
        },

        finishFunctionDeclaration: function (id, params, defaults, body) {
            this.type = Syntax.FunctionDeclaration;
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.body = body;
            this.generator = false;
            this.expression = false;
            this.finish();
            return this;
        },

        finishFunctionExpression: function (id, params, defaults, body) {
            this.type = Syntax.FunctionExpression;
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.body = body;
            this.generator = false;
            this.expression = false;
            this.finish();
            return this;
        },

        finishIdentifier: function (name) {
            this.type = Syntax.Identifier;
            this.name = name;
            this.finish();
            return this;
        },

        finishIfStatement: function (test, consequent, alternate) {
            this.type = Syntax.IfStatement;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
            this.finish();
            return this;
        },

        finishLabeledStatement: function (label, body) {
            this.type = Syntax.LabeledStatement;
            this.label = label;
            this.body = body;
            this.finish();
            return this;
        },

        finishLiteral: function (token) {
            this.type = Syntax.Literal;
            this.value = token.value;
            this.raw = source.slice(token.start, token.end);
            if (token.regex) {
                this.regex = token.regex;
            }
            this.finish();
            return this;
        },

        finishMemberExpression: function (accessor, object, property) {
            this.type = Syntax.MemberExpression;
            this.computed = accessor === '[';
            this.object = object;
            this.property = property;
            this.finish();
            return this;
        },

        finishNewExpression: function (callee, args) {
            this.type = Syntax.NewExpression;
            this.callee = callee;
            this.arguments = args;
            this.finish();
            return this;
        },

        finishObjectExpression: function (properties) {
            this.type = Syntax.ObjectExpression;
            this.properties = properties;
            this.finish();
            return this;
        },

        finishObjectPattern: function (properties) {
            this.type = Syntax.ObjectPattern;
            this.properties = properties;
            this.finish();
            return this;
        },

        finishPostfixExpression: function (operator, argument) {
            this.type = Syntax.UpdateExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = false;
            this.finish();
            return this;
        },

        finishProgram: function (body) {
            this.type = Syntax.Program;
            this.body = body;
            if (sourceType === 'module') {
                // very restrictive for now
                this.sourceType = sourceType;
            }
            this.finish();
            return this;
        },

        finishProperty: function (kind, key, computed, value, method, shorthand) {
            this.type = Syntax.Property;
            this.key = key;
            this.computed = computed;
            this.value = value;
            this.kind = kind;
            this.method = method;
            this.shorthand = shorthand;
            this.finish();
            return this;
        },

        finishRestElement: function (argument) {
            this.type = Syntax.RestElement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishReturnStatement: function (argument) {
            this.type = Syntax.ReturnStatement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishSequenceExpression: function (expressions) {
            this.type = Syntax.SequenceExpression;
            this.expressions = expressions;
            this.finish();
            return this;
        },

        finishSpreadElement: function (argument) {
            this.type = Syntax.SpreadElement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishSwitchCase: function (test, consequent) {
            this.type = Syntax.SwitchCase;
            this.test = test;
            this.consequent = consequent;
            this.finish();
            return this;
        },

        finishSuper: function () {
            this.type = Syntax.Super;
            this.finish();
            return this;
        },

        finishSwitchStatement: function (discriminant, cases) {
            this.type = Syntax.SwitchStatement;
            this.discriminant = discriminant;
            this.cases = cases;
            this.finish();
            return this;
        },

        finishTaggedTemplateExpression: function (tag, quasi) {
            this.type = Syntax.TaggedTemplateExpression;
            this.tag = tag;
            this.quasi = quasi;
            this.finish();
            return this;
        },

        finishTemplateElement: function (value, tail) {
            this.type = Syntax.TemplateElement;
            this.value = value;
            this.tail = tail;
            this.finish();
            return this;
        },

        finishTemplateLiteral: function (quasis, expressions) {
            this.type = Syntax.TemplateLiteral;
            this.quasis = quasis;
            this.expressions = expressions;
            this.finish();
            return this;
        },

        finishThisExpression: function () {
            this.type = Syntax.ThisExpression;
            this.finish();
            return this;
        },

        finishThrowStatement: function (argument) {
            this.type = Syntax.ThrowStatement;
            this.argument = argument;
            this.finish();
            return this;
        },

        finishTryStatement: function (block, handler, finalizer) {
            this.type = Syntax.TryStatement;
            this.block = block;
            this.guardedHandlers = [];
            this.handlers = handler ? [ handler ] : [];
            this.handler = handler;
            this.finalizer = finalizer;
            this.finish();
            return this;
        },

        finishUnaryExpression: function (operator, argument) {
            this.type = (operator === '++' || operator === '--') ? Syntax.UpdateExpression : Syntax.UnaryExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = true;
            this.finish();
            return this;
        },

        finishVariableDeclaration: function (declarations) {
            this.type = Syntax.VariableDeclaration;
            this.declarations = declarations;
            this.kind = 'var';
            this.finish();
            return this;
        },

        finishLexicalDeclaration: function (declarations, kind) {
            this.type = Syntax.VariableDeclaration;
            this.declarations = declarations;
            this.kind = kind;
            this.finish();
            return this;
        },

        finishVariableDeclarator: function (id, init) {
            this.type = Syntax.VariableDeclarator;
            this.id = id;
            this.init = init;
            this.finish();
            return this;
        },

        finishWhileStatement: function (test, body) {
            this.type = Syntax.WhileStatement;
            this.test = test;
            this.body = body;
            this.finish();
            return this;
        },

        finishWithStatement: function (object, body) {
            this.type = Syntax.WithStatement;
            this.object = object;
            this.body = body;
            this.finish();
            return this;
        },

        finishExportSpecifier: function (local, exported) {
            this.type = Syntax.ExportSpecifier;
            this.exported = exported || local;
            this.local = local;
            this.finish();
            return this;
        },

        finishImportDefaultSpecifier: function (local) {
            this.type = Syntax.ImportDefaultSpecifier;
            this.local = local;
            this.finish();
            return this;
        },

        finishImportNamespaceSpecifier: function (local) {
            this.type = Syntax.ImportNamespaceSpecifier;
            this.local = local;
            this.finish();
            return this;
        },

        finishExportNamedDeclaration: function (declaration, specifiers, src) {
            this.type = Syntax.ExportNamedDeclaration;
            this.declaration = declaration;
            this.specifiers = specifiers;
            this.source = src;
            this.finish();
            return this;
        },

        finishExportDefaultDeclaration: function (declaration) {
            this.type = Syntax.ExportDefaultDeclaration;
            this.declaration = declaration;
            this.finish();
            return this;
        },

        finishExportAllDeclaration: function (src) {
            this.type = Syntax.ExportAllDeclaration;
            this.source = src;
            this.finish();
            return this;
        },

        finishImportSpecifier: function (local, imported) {
            this.type = Syntax.ImportSpecifier;
            this.local = local || imported;
            this.imported = imported;
            this.finish();
            return this;
        },

        finishImportDeclaration: function (specifiers, src) {
            this.type = Syntax.ImportDeclaration;
            this.specifiers = specifiers;
            this.source = src;
            this.finish();
            return this;
        }
    };


    function recordError(error) {
        var e, existing;

        for (e = 0; e < extra.errors.length; e++) {
            existing = extra.errors[e];
            // Prevent duplicated error.
            /* istanbul ignore next */
            if (existing.index === error.index && existing.message === error.message) {
                return;
            }
        }

        extra.errors.push(error);
    }

    function createError(line, pos, description) {
        var error = new Error('Line ' + line + ': ' + description);
        error.index = pos;
        error.lineNumber = line;
        error.column = pos - (scanning ? lineStart : lastLineStart) + 1;
        error.description = description;
        return error;
    }

    // Throw an exception

    function throwError(messageFormat) {
        var args, msg;

        args = Array.prototype.slice.call(arguments, 1);
        msg = messageFormat.replace(/%(\d)/g,
            function (whole, idx) {
                assert(idx < args.length, 'Message reference must be in range');
                return args[idx];
            }
        );

        throw createError(lastLineNumber, lastIndex, msg);
    }

    function tolerateError(messageFormat) {
        var args, msg, error;

        args = Array.prototype.slice.call(arguments, 1);
        /* istanbul ignore next */
        msg = messageFormat.replace(/%(\d)/g,
            function (whole, idx) {
                assert(idx < args.length, 'Message reference must be in range');
                return args[idx];
            }
        );

        error = createError(lineNumber, lastIndex, msg);
        if (extra.errors) {
            recordError(error);
        } else {
            throw error;
        }
    }

    // Throw an exception because of the token.

    function unexpectedTokenError(token, message) {
        var value, msg = message || Messages.UnexpectedToken;

        if (token) {
            if (!message) {
                msg = (token.type === Token.EOF) ? Messages.UnexpectedEOS :
                    (token.type === Token.Identifier) ? Messages.UnexpectedIdentifier :
                    (token.type === Token.NumericLiteral) ? Messages.UnexpectedNumber :
                    (token.type === Token.StringLiteral) ? Messages.UnexpectedString :
                    (token.type === Token.Template) ? Messages.UnexpectedTemplate :
                    Messages.UnexpectedToken;

                if (token.type === Token.Keyword) {
                    if (isFutureReservedWord(token.value)) {
                        msg = Messages.UnexpectedReserved;
                    } else if (strict && isStrictModeReservedWord(token.value)) {
                        msg = Messages.StrictReservedWord;
                    }
                }
            }

            value = (token.type === Token.Template) ? token.value.raw : token.value;
        } else {
            value = 'ILLEGAL';
        }

        msg = msg.replace('%0', value);

        return (token && typeof token.lineNumber === 'number') ?
            createError(token.lineNumber, token.start, msg) :
            createError(scanning ? lineNumber : lastLineNumber, scanning ? index : lastIndex, msg);
    }

    function throwUnexpectedToken(token, message) {
        throw unexpectedTokenError(token, message);
    }

    function tolerateUnexpectedToken(token, message) {
        var error = unexpectedTokenError(token, message);
        if (extra.errors) {
            recordError(error);
        } else {
            throw error;
        }
    }

    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.

    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpectedToken(token);
        }
    }

    /**
     * @name expectCommaSeparator
     * @description Quietly expect a comma when in tolerant mode, otherwise delegates
     * to <code>expect(value)</code>
     * @since 2.0
     */
    function expectCommaSeparator() {
        var token;

        if (extra.errors) {
            token = lookahead;
            if (token.type === Token.Punctuator && token.value === ',') {
                lex();
            } else if (token.type === Token.Punctuator && token.value === ';') {
                lex();
                tolerateUnexpectedToken(token);
            } else {
                tolerateUnexpectedToken(token, Messages.UnexpectedToken);
            }
        } else {
            expect(',');
        }
    }

    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.

    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpectedToken(token);
        }
    }

    // Return true if the next token matches the specified punctuator.

    function match(value) {
        return lookahead.type === Token.Punctuator && lookahead.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        return lookahead.type === Token.Keyword && lookahead.value === keyword;
    }

    // Return true if the next token matches the specified contextual keyword
    // (where an identifier is sometimes a keyword depending on the context)

    function matchContextualKeyword(keyword) {
        return lookahead.type === Token.Identifier && lookahead.value === keyword;
    }

    // Return true if the next token is an assignment operator

    function matchAssign() {
        var op;

        if (lookahead.type !== Token.Punctuator) {
            return false;
        }
        op = lookahead.value;
        return op === '=' ||
            op === '*=' ||
            op === '/=' ||
            op === '%=' ||
            op === '+=' ||
            op === '-=' ||
            op === '<<=' ||
            op === '>>=' ||
            op === '>>>=' ||
            op === '&=' ||
            op === '^=' ||
            op === '|=';
    }

    function consumeSemicolon() {
        // Catch the very common case first: immediately a semicolon (U+003B).
        if (source.charCodeAt(startIndex) === 0x3B || match(';')) {
            lex();
            return;
        }

        if (hasLineTerminator) {
            return;
        }

        // FIXME(ikarienator): this is seemingly an issue in the previous location info convention.
        lastIndex = startIndex;
        lastLineNumber = startLineNumber;
        lastLineStart = startLineStart;

        if (lookahead.type !== Token.EOF && !match('}')) {
            throwUnexpectedToken(lookahead);
        }
    }

    // Cover grammar support.
    //
    // When an assignment expression position starts with an left parenthesis, the determination of the type
    // of the syntax is to be deferred arbitrarily long until the end of the parentheses pair (plus a lookahead)
    // or the first comma. This situation also defers the determination of all the expressions nested in the pair.
    //
    // There are three productions that can be parsed in a parentheses pair that needs to be determined
    // after the outermost pair is closed. They are:
    //
    //   1. AssignmentExpression
    //   2. BindingElements
    //   3. AssignmentTargets
    //
    // In order to avoid exponential backtracking, we use two flags to denote if the production can be
    // binding element or assignment target.
    //
    // The three productions have the relationship:
    //
    //   BindingElements ⊆ AssignmentTargets ⊆ AssignmentExpression
    //
    // with a single exception that CoverInitializedName when used directly in an Expression, generates
    // an early error. Therefore, we need the third state, firstCoverInitializedNameError, to track the
    // first usage of CoverInitializedName and report it when we reached the end of the parentheses pair.
    //
    // isolateCoverGrammar function runs the given parser function with a new cover grammar context, and it does not
    // effect the current flags. This means the production the parser parses is only used as an expression. Therefore
    // the CoverInitializedName check is conducted.
    //
    // inheritCoverGrammar function runs the given parse function with a new cover grammar context, and it propagates
    // the flags outside of the parser. This means the production the parser parses is used as a part of a potential
    // pattern. The CoverInitializedName check is deferred.
    function isolateCoverGrammar(parser) {
        var oldIsBindingElement = isBindingElement,
            oldIsAssignmentTarget = isAssignmentTarget,
            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
            result;
        isBindingElement = true;
        isAssignmentTarget = true;
        firstCoverInitializedNameError = null;
        result = parser();
        if (firstCoverInitializedNameError !== null) {
            throwUnexpectedToken(firstCoverInitializedNameError);
        }
        isBindingElement = oldIsBindingElement;
        isAssignmentTarget = oldIsAssignmentTarget;
        firstCoverInitializedNameError = oldFirstCoverInitializedNameError;
        return result;
    }

    function inheritCoverGrammar(parser) {
        var oldIsBindingElement = isBindingElement,
            oldIsAssignmentTarget = isAssignmentTarget,
            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
            result;
        isBindingElement = true;
        isAssignmentTarget = true;
        firstCoverInitializedNameError = null;
        result = parser();
        isBindingElement = isBindingElement && oldIsBindingElement;
        isAssignmentTarget = isAssignmentTarget && oldIsAssignmentTarget;
        firstCoverInitializedNameError = oldFirstCoverInitializedNameError || firstCoverInitializedNameError;
        return result;
    }

    function parseArrayPattern() {
        var node = new Node(), elements = [], rest, restNode;
        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else {
                if (match('...')) {
                    restNode = new Node();
                    lex();
                    rest = parseVariableIdentifier();
                    elements.push(restNode.finishRestElement(rest));
                    break;
                } else {
                    elements.push(parsePatternWithDefault());
                }
                if (!match(']')) {
                    expect(',');
                }
            }

        }

        expect(']');

        return node.finishArrayPattern(elements);
    }

    function parsePropertyPattern() {
        var node = new Node(), key, computed = match('['), init;
        if (lookahead.type === Token.Identifier) {
            key = parseVariableIdentifier();
            if (match('=')) {
                lex();
                init = parseAssignmentExpression();
                return node.finishProperty(
                    'init', key, false,
                    new WrappingNode(key).finishAssignmentPattern(key, init), false, false);
            } else if (!match(':')) {
                return node.finishProperty('init', key, false, key, false, true);
            }
        } else {
            key = parseObjectPropertyKey();
        }
        expect(':');
        init = parsePatternWithDefault();
        return node.finishProperty('init', key, computed, init, false, false);
    }

    function parseObjectPattern() {
        var node = new Node(), properties = [];

        expect('{');

        while (!match('}')) {
            properties.push(parsePropertyPattern());
            if (!match('}')) {
                expect(',');
            }
        }

        lex();

        return node.finishObjectPattern(properties);
    }

    function parsePattern() {
        if (lookahead.type === Token.Identifier) {
            return parseVariableIdentifier();
        } else if (match('[')) {
            return parseArrayPattern();
        } else if (match('{')) {
            return parseObjectPattern();
        }
        throwUnexpectedToken(lookahead);
    }

    function parsePatternWithDefault() {
        var startToken = lookahead, pattern, right;
        pattern = parsePattern();
        if (match('=')) {
            lex();
            right = isolateCoverGrammar(parseAssignmentExpression);
            pattern = new WrappingNode(startToken).finishAssignmentPattern(pattern, right);
        }
        return pattern;
    }

    // 11.1.4 Array Initialiser

    function parseArrayInitialiser() {
        var elements = [], node = new Node(), restSpread;

        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else if (match('...')) {
                restSpread = new Node();
                lex();
                restSpread.finishSpreadElement(inheritCoverGrammar(parseAssignmentExpression));

                if (!match(']')) {
                    isAssignmentTarget = isBindingElement = false;
                    expect(',');
                }
                elements.push(restSpread);
            } else {
                elements.push(inheritCoverGrammar(parseAssignmentExpression));

                if (!match(']')) {
                    expect(',');
                }
            }
        }

        lex();

        return node.finishArrayExpression(elements);
    }

    // 11.1.5 Object Initialiser

    function parsePropertyFunction(node, paramInfo) {
        var previousStrict, body;

        isAssignmentTarget = isBindingElement = false;

        previousStrict = strict;
        body = isolateCoverGrammar(parseFunctionSourceElements);

        if (strict && paramInfo.firstRestricted) {
            tolerateUnexpectedToken(paramInfo.firstRestricted, paramInfo.message);
        }
        if (strict && paramInfo.stricted) {
            tolerateUnexpectedToken(paramInfo.stricted, paramInfo.message);
        }

        strict = previousStrict;
        return node.finishFunctionExpression(null, paramInfo.params, paramInfo.defaults, body);
    }

    function parsePropertyMethodFunction() {
        var params, method, node = new Node();

        params = parseParams();
        method = parsePropertyFunction(node, params);

        return method;
    }

    function parseObjectPropertyKey() {
        var token, node = new Node(), expr;

        token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.

        switch (token.type) {
        case Token.StringLiteral:
        case Token.NumericLiteral:
            if (strict && token.octal) {
                tolerateUnexpectedToken(token, Messages.StrictOctalLiteral);
            }
            return node.finishLiteral(token);
        case Token.Identifier:
        case Token.BooleanLiteral:
        case Token.NullLiteral:
        case Token.Keyword:
            return node.finishIdentifier(token.value);
        case Token.Punctuator:
            if (token.value === '[') {
                expr = isolateCoverGrammar(parseAssignmentExpression);
                expect(']');
                return expr;
            }
            break;
        }
        throwUnexpectedToken(token);
    }

    function lookaheadPropertyName() {
        switch (lookahead.type) {
        case Token.Identifier:
        case Token.StringLiteral:
        case Token.BooleanLiteral:
        case Token.NullLiteral:
        case Token.NumericLiteral:
        case Token.Keyword:
            return true;
        case Token.Punctuator:
            return lookahead.value === '[';
        }
        return false;
    }

    // This function is to try to parse a MethodDefinition as defined in 14.3. But in the case of object literals,
    // it might be called at a position where there is in fact a short hand identifier pattern or a data property.
    // This can only be determined after we consumed up to the left parentheses.
    //
    // In order to avoid back tracking, it returns `null` if the position is not a MethodDefinition and the caller
    // is responsible to visit other options.
    function tryParseMethodDefinition(token, key, computed, node) {
        var value, options, methodNode;

        if (token.type === Token.Identifier) {
            // check for `get` and `set`;

            if (token.value === 'get' && lookaheadPropertyName()) {
                computed = match('[');
                key = parseObjectPropertyKey();
                methodNode = new Node();
                expect('(');
                expect(')');
                value = parsePropertyFunction(methodNode, {
                    params: [],
                    defaults: [],
                    stricted: null,
                    firstRestricted: null,
                    message: null
                });
                return node.finishProperty('get', key, computed, value, false, false);
            } else if (token.value === 'set' && lookaheadPropertyName()) {
                computed = match('[');
                key = parseObjectPropertyKey();
                methodNode = new Node();
                expect('(');

                options = {
                    params: [],
                    defaultCount: 0,
                    defaults: [],
                    firstRestricted: null,
                    paramSet: {}
                };
                if (match(')')) {
                    tolerateUnexpectedToken(lookahead);
                } else {
                    parseParam(options);
                    if (options.defaultCount === 0) {
                        options.defaults = [];
                    }
                }
                expect(')');

                value = parsePropertyFunction(methodNode, options);
                return node.finishProperty('set', key, computed, value, false, false);
            }
        }

        if (match('(')) {
            value = parsePropertyMethodFunction();
            return node.finishProperty('init', key, computed, value, true, false);
        }

        // Not a MethodDefinition.
        return null;
    }

    function checkProto(key, computed, hasProto) {
        if (computed === false && (key.type === Syntax.Identifier && key.name === '__proto__' ||
            key.type === Syntax.Literal && key.value === '__proto__')) {
            if (hasProto.value) {
                tolerateError(Messages.DuplicateProtoProperty);
            } else {
                hasProto.value = true;
            }
        }
    }

    function parseObjectProperty(hasProto) {
        var token = lookahead, node = new Node(), computed, key, maybeMethod, value;

        computed = match('[');
        key = parseObjectPropertyKey();
        maybeMethod = tryParseMethodDefinition(token, key, computed, node);

        if (maybeMethod) {
            checkProto(maybeMethod.key, maybeMethod.computed, hasProto);
            // finished
            return maybeMethod;
        }

        // init property or short hand property.
        checkProto(key, computed, hasProto);

        if (match(':')) {
            lex();
            value = inheritCoverGrammar(parseAssignmentExpression);
            return node.finishProperty('init', key, computed, value, false, false);
        }

        if (token.type === Token.Identifier) {
            if (match('=')) {
                firstCoverInitializedNameError = lookahead;
                lex();
                value = isolateCoverGrammar(parseAssignmentExpression);
                return node.finishProperty('init', key, computed,
                    new WrappingNode(token).finishAssignmentPattern(key, value), false, true);
            }
            return node.finishProperty('init', key, computed, key, false, true);
        }

        throwUnexpectedToken(lookahead);
    }

    function parseObjectInitialiser() {
        var properties = [], hasProto = {value: false}, node = new Node();

        expect('{');

        while (!match('}')) {
            properties.push(parseObjectProperty(hasProto));

            if (!match('}')) {
                expectCommaSeparator();
            }
        }

        expect('}');

        return node.finishObjectExpression(properties);
    }

    function reinterpretExpressionAsPattern(expr) {
        var i;
        switch (expr.type) {
        case Syntax.Identifier:
        case Syntax.MemberExpression:
        case Syntax.RestElement:
        case Syntax.AssignmentPattern:
            break;
        case Syntax.SpreadElement:
            expr.type = Syntax.RestElement;
            reinterpretExpressionAsPattern(expr.argument);
            break;
        case Syntax.ArrayExpression:
            expr.type = Syntax.ArrayPattern;
            for (i = 0; i < expr.elements.length; i++) {
                if (expr.elements[i] !== null) {
                    reinterpretExpressionAsPattern(expr.elements[i]);
                }
            }
            break;
        case Syntax.ObjectExpression:
            expr.type = Syntax.ObjectPattern;
            for (i = 0; i < expr.properties.length; i++) {
                reinterpretExpressionAsPattern(expr.properties[i].value);
            }
            break;
        case Syntax.AssignmentExpression:
            expr.type = Syntax.AssignmentPattern;
            reinterpretExpressionAsPattern(expr.left);
            break;
        default:
            // Allow other node type for tolerant parsing.
            break;
        }
    }

    function parseTemplateElement(option) {
        var node, token;

        if (lookahead.type !== Token.Template || (option.head && !lookahead.head)) {
            throwUnexpectedToken();
        }

        node = new Node();
        token = lex();

        return node.finishTemplateElement({ raw: token.value.raw, cooked: token.value.cooked }, token.tail);
    }

    function parseTemplateLiteral() {
        var quasi, quasis, expressions, node = new Node();

        quasi = parseTemplateElement({ head: true });
        quasis = [ quasi ];
        expressions = [];

        while (!quasi.tail) {
            expressions.push(parseExpression());
            quasi = parseTemplateElement({ head: false });
            quasis.push(quasi);
        }

        return node.finishTemplateLiteral(quasis, expressions);
    }

    // 11.1.6 The Grouping Operator

    function parseGroupExpression() {
        var expr, expressions, startToken, i;

        expect('(');

        if (match(')')) {
            lex();
            if (!match('=>')) {
                expect('=>');
            }
            return {
                type: PlaceHolders.ArrowParameterPlaceHolder,
                params: []
            };
        }

        startToken = lookahead;
        if (match('...')) {
            expr = parseRestElement();
            expect(')');
            if (!match('=>')) {
                expect('=>');
            }
            return {
                type: PlaceHolders.ArrowParameterPlaceHolder,
                params: [expr]
            };
        }

        isBindingElement = true;
        expr = inheritCoverGrammar(parseAssignmentExpression);

        if (match(',')) {
            isAssignmentTarget = false;
            expressions = [expr];

            while (startIndex < length) {
                if (!match(',')) {
                    break;
                }
                lex();

                if (match('...')) {
                    if (!isBindingElement) {
                        throwUnexpectedToken(lookahead);
                    }
                    expressions.push(parseRestElement());
                    expect(')');
                    if (!match('=>')) {
                        expect('=>');
                    }
                    isBindingElement = false;
                    for (i = 0; i < expressions.length; i++) {
                        reinterpretExpressionAsPattern(expressions[i]);
                    }
                    return {
                        type: PlaceHolders.ArrowParameterPlaceHolder,
                        params: expressions
                    };
                }

                expressions.push(inheritCoverGrammar(parseAssignmentExpression));
            }

            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
        }


        expect(')');

        if (match('=>')) {
            if (!isBindingElement) {
                throwUnexpectedToken(lookahead);
            }

            if (expr.type === Syntax.SequenceExpression) {
                for (i = 0; i < expr.expressions.length; i++) {
                    reinterpretExpressionAsPattern(expr.expressions[i]);
                }
            } else {
                reinterpretExpressionAsPattern(expr);
            }

            expr = {
                type: PlaceHolders.ArrowParameterPlaceHolder,
                params: expr.type === Syntax.SequenceExpression ? expr.expressions : [expr]
            };
        }
        isBindingElement = false;
        return expr;
    }


    // 11.1 Primary Expressions

    function parsePrimaryExpression() {
        var type, token, expr, node;

        if (match('(')) {
            isBindingElement = false;
            return inheritCoverGrammar(parseGroupExpression);
        }

        if (match('[')) {
            return inheritCoverGrammar(parseArrayInitialiser);
        }

        if (match('{')) {
            return inheritCoverGrammar(parseObjectInitialiser);
        }

        type = lookahead.type;
        node = new Node();

        if (type === Token.Identifier) {
            expr = node.finishIdentifier(lex().value);
        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            isAssignmentTarget = isBindingElement = false;
            if (strict && lookahead.octal) {
                tolerateUnexpectedToken(lookahead, Messages.StrictOctalLiteral);
            }
            expr = node.finishLiteral(lex());
        } else if (type === Token.Keyword) {
            isAssignmentTarget = isBindingElement = false;
            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
            if (matchKeyword('this')) {
                lex();
                return node.finishThisExpression();
            }
            if (matchKeyword('class')) {
                return parseClassExpression();
            }
            throwUnexpectedToken(lex());
        } else if (type === Token.BooleanLiteral) {
            isAssignmentTarget = isBindingElement = false;
            token = lex();
            token.value = (token.value === 'true');
            expr = node.finishLiteral(token);
        } else if (type === Token.NullLiteral) {
            isAssignmentTarget = isBindingElement = false;
            token = lex();
            token.value = null;
            expr = node.finishLiteral(token);
        } else if (match('/') || match('/=')) {
            isAssignmentTarget = isBindingElement = false;
            index = startIndex;

            if (typeof extra.tokens !== 'undefined') {
                token = collectRegex();
            } else {
                token = scanRegExp();
            }
            lex();
            expr = node.finishLiteral(token);
        } else if (type === Token.Template) {
            expr = parseTemplateLiteral();
        } else {
            throwUnexpectedToken(lex());
        }

        return expr;
    }

    // 11.2 Left-Hand-Side Expressions

    function parseArguments() {
        var args = [];

        expect('(');

        if (!match(')')) {
            while (startIndex < length) {
                args.push(isolateCoverGrammar(parseAssignmentExpression));
                if (match(')')) {
                    break;
                }
                expectCommaSeparator();
            }
        }

        expect(')');

        return args;
    }

    function parseNonComputedProperty() {
        var token, node = new Node();

        token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpectedToken(token);
        }

        return node.finishIdentifier(token.value);
    }

    function parseNonComputedMember() {
        expect('.');

        return parseNonComputedProperty();
    }

    function parseComputedMember() {
        var expr;

        expect('[');

        expr = isolateCoverGrammar(parseExpression);

        expect(']');

        return expr;
    }

    function parseNewExpression() {
        var callee, args, node = new Node();

        expectKeyword('new');
        callee = isolateCoverGrammar(parseLeftHandSideExpression);
        args = match('(') ? parseArguments() : [];

        isAssignmentTarget = isBindingElement = false;

        return node.finishNewExpression(callee, args);
    }

    function parseLeftHandSideExpressionAllowCall() {
        var quasi, expr, args, property, startToken, previousAllowIn = state.allowIn;

        startToken = lookahead;
        state.allowIn = true;

        if (matchKeyword('super') && state.inFunctionBody) {
            expr = new Node();
            lex();
            expr = expr.finishSuper();
            if (!match('(') && !match('.') && !match('[')) {
                throwUnexpectedToken(lookahead);
            }
        } else {
            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
        }

        for (;;) {
            if (match('.')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseNonComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
            } else if (match('(')) {
                isBindingElement = false;
                isAssignmentTarget = false;
                args = parseArguments();
                expr = new WrappingNode(startToken).finishCallExpression(expr, args);
            } else if (match('[')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
            } else if (lookahead.type === Token.Template && lookahead.head) {
                quasi = parseTemplateLiteral();
                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
            } else {
                break;
            }
        }
        state.allowIn = previousAllowIn;

        return expr;
    }

    function parseLeftHandSideExpression() {
        var quasi, expr, property, startToken;
        assert(state.allowIn, 'callee of new expression always allow in keyword.');

        startToken = lookahead;

        if (matchKeyword('super') && state.inFunctionBody) {
            expr = new Node();
            lex();
            expr = expr.finishSuper();
            if (!match('[') && !match('.')) {
                throwUnexpectedToken(lookahead);
            }
        } else {
            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
        }

        for (;;) {
            if (match('[')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
            } else if (match('.')) {
                isBindingElement = false;
                isAssignmentTarget = true;
                property = parseNonComputedMember();
                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
            } else if (lookahead.type === Token.Template && lookahead.head) {
                quasi = parseTemplateLiteral();
                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
            } else {
                break;
            }
        }
        return expr;
    }

    // 11.3 Postfix Expressions

    function parsePostfixExpression() {
        var expr, token, startToken = lookahead;

        expr = inheritCoverGrammar(parseLeftHandSideExpressionAllowCall);

        if (!hasLineTerminator && lookahead.type === Token.Punctuator) {
            if (match('++') || match('--')) {
                // 11.3.1, 11.3.2
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    tolerateError(Messages.StrictLHSPostfix);
                }

                if (!isAssignmentTarget) {
                    tolerateError(Messages.InvalidLHSInAssignment);
                }

                isAssignmentTarget = isBindingElement = false;

                token = lex();
                expr = new WrappingNode(startToken).finishPostfixExpression(token.value, expr);
            }
        }

        return expr;
    }

    // 11.4 Unary Operators

    function parseUnaryExpression() {
        var token, expr, startToken;

        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
            expr = parsePostfixExpression();
        } else if (match('++') || match('--')) {
            startToken = lookahead;
            token = lex();
            expr = inheritCoverGrammar(parseUnaryExpression);
            // 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                tolerateError(Messages.StrictLHSPrefix);
            }

            if (!isAssignmentTarget) {
                tolerateError(Messages.InvalidLHSInAssignment);
            }
            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
            isAssignmentTarget = isBindingElement = false;
        } else if (match('+') || match('-') || match('~') || match('!')) {
            startToken = lookahead;
            token = lex();
            expr = inheritCoverGrammar(parseUnaryExpression);
            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
            isAssignmentTarget = isBindingElement = false;
        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            startToken = lookahead;
            token = lex();
            expr = inheritCoverGrammar(parseUnaryExpression);
            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                tolerateError(Messages.StrictDelete);
            }
            isAssignmentTarget = isBindingElement = false;
        } else {
            expr = parsePostfixExpression();
        }

        return expr;
    }

    function binaryPrecedence(token, allowIn) {
        var prec = 0;

        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return 0;
        }

        switch (token.value) {
        case '||':
            prec = 1;
            break;

        case '&&':
            prec = 2;
            break;

        case '|':
            prec = 3;
            break;

        case '^':
            prec = 4;
            break;

        case '&':
            prec = 5;
            break;

        case '==':
        case '!=':
        case '===':
        case '!==':
            prec = 6;
            break;

        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec = 7;
            break;

        case 'in':
            prec = allowIn ? 7 : 0;
            break;

        case '<<':
        case '>>':
        case '>>>':
            prec = 8;
            break;

        case '+':
        case '-':
            prec = 9;
            break;

        case '*':
        case '/':
        case '%':
            prec = 11;
            break;

        default:
            break;
        }

        return prec;
    }

    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators

    function parseBinaryExpression() {
        var marker, markers, expr, token, prec, stack, right, operator, left, i;

        marker = lookahead;
        left = inheritCoverGrammar(parseUnaryExpression);

        token = lookahead;
        prec = binaryPrecedence(token, state.allowIn);
        if (prec === 0) {
            return left;
        }
        isAssignmentTarget = isBindingElement = false;
        token.prec = prec;
        lex();

        markers = [marker, lookahead];
        right = isolateCoverGrammar(parseUnaryExpression);

        stack = [left, token, right];

        while ((prec = binaryPrecedence(lookahead, state.allowIn)) > 0) {

            // Reduce: make a binary expression from the three topmost entries.
            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                right = stack.pop();
                operator = stack.pop().value;
                left = stack.pop();
                markers.pop();
                expr = new WrappingNode(markers[markers.length - 1]).finishBinaryExpression(operator, left, right);
                stack.push(expr);
            }

            // Shift.
            token = lex();
            token.prec = prec;
            stack.push(token);
            markers.push(lookahead);
            expr = isolateCoverGrammar(parseUnaryExpression);
            stack.push(expr);
        }

        // Final reduce to clean-up the stack.
        i = stack.length - 1;
        expr = stack[i];
        markers.pop();
        while (i > 1) {
            expr = new WrappingNode(markers.pop()).finishBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
            i -= 2;
        }

        return expr;
    }


    // 11.12 Conditional Operator

    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent, alternate, startToken;

        startToken = lookahead;

        expr = inheritCoverGrammar(parseBinaryExpression);
        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = isolateCoverGrammar(parseAssignmentExpression);
            state.allowIn = previousAllowIn;
            expect(':');
            alternate = isolateCoverGrammar(parseAssignmentExpression);

            expr = new WrappingNode(startToken).finishConditionalExpression(expr, consequent, alternate);
            isAssignmentTarget = isBindingElement = false;
        }

        return expr;
    }

    // [ES6] 14.2 Arrow Function

    function parseConciseBody() {
        if (match('{')) {
            return parseFunctionSourceElements();
        }
        return isolateCoverGrammar(parseAssignmentExpression);
    }

    function checkPatternParam(options, param) {
        var i;
        switch (param.type) {
        case Syntax.Identifier:
            validateParam(options, param, param.name);
            break;
        case Syntax.RestElement:
            checkPatternParam(options, param.argument);
            break;
        case Syntax.AssignmentPattern:
            checkPatternParam(options, param.left);
            break;
        case Syntax.ArrayPattern:
            for (i = 0; i < param.elements.length; i++) {
                if (param.elements[i] !== null) {
                    checkPatternParam(options, param.elements[i]);
                }
            }
            break;
        default:
            assert(param.type === Syntax.ObjectPattern, 'Invalid type');
            for (i = 0; i < param.properties.length; i++) {
                checkPatternParam(options, param.properties[i].value);
            }
            break;
        }
    }
    function reinterpretAsCoverFormalsList(expr) {
        var i, len, param, params, defaults, defaultCount, options, token;

        defaults = [];
        defaultCount = 0;
        params = [expr];

        switch (expr.type) {
        case Syntax.Identifier:
            break;
        case PlaceHolders.ArrowParameterPlaceHolder:
            params = expr.params;
            break;
        default:
            return null;
        }

        options = {
            paramSet: {}
        };

        for (i = 0, len = params.length; i < len; i += 1) {
            param = params[i];
            switch (param.type) {
            case Syntax.AssignmentPattern:
                params[i] = param.left;
                defaults.push(param.right);
                ++defaultCount;
                checkPatternParam(options, param.left);
                break;
            default:
                checkPatternParam(options, param);
                params[i] = param;
                defaults.push(null);
                break;
            }
        }

        if (options.message === Messages.StrictParamDupe) {
            token = strict ? options.stricted : options.firstRestricted;
            throwUnexpectedToken(token, options.message);
        }

        if (defaultCount === 0) {
            defaults = [];
        }

        return {
            params: params,
            defaults: defaults,
            stricted: options.stricted,
            firstRestricted: options.firstRestricted,
            message: options.message
        };
    }

    function parseArrowFunctionExpression(options, node) {
        var previousStrict, body;

        if (hasLineTerminator) {
            tolerateUnexpectedToken(lookahead);
        }
        expect('=>');
        previousStrict = strict;

        body = parseConciseBody();

        if (strict && options.firstRestricted) {
            throwUnexpectedToken(options.firstRestricted, options.message);
        }
        if (strict && options.stricted) {
            tolerateUnexpectedToken(options.stricted, options.message);
        }

        strict = previousStrict;

        return node.finishArrowFunctionExpression(options.params, options.defaults, body, body.type !== Syntax.BlockStatement);
    }

    // 11.13 Assignment Operators

    function parseAssignmentExpression() {
        var token, expr, right, list, startToken;

        startToken = lookahead;
        token = lookahead;

        expr = parseConditionalExpression();

        if (expr.type === PlaceHolders.ArrowParameterPlaceHolder || match('=>')) {
            isAssignmentTarget = isBindingElement = false;
            list = reinterpretAsCoverFormalsList(expr);

            if (list) {
                firstCoverInitializedNameError = null;
                return parseArrowFunctionExpression(list, new WrappingNode(startToken));
            }

            return expr;
        }

        if (matchAssign()) {
            if (!isAssignmentTarget) {
                tolerateError(Messages.InvalidLHSInAssignment);
            }

            // 11.13.1
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                tolerateUnexpectedToken(token, Messages.StrictLHSAssignment);
            }

            if (!match('=')) {
                isAssignmentTarget = isBindingElement = false;
            } else {
                reinterpretExpressionAsPattern(expr);
            }

            token = lex();
            right = isolateCoverGrammar(parseAssignmentExpression);
            expr = new WrappingNode(startToken).finishAssignmentExpression(token.value, expr, right);
            firstCoverInitializedNameError = null;
        }

        return expr;
    }

    // 11.14 Comma Operator

    function parseExpression() {
        var expr, startToken = lookahead, expressions;

        expr = isolateCoverGrammar(parseAssignmentExpression);

        if (match(',')) {
            expressions = [expr];

            while (startIndex < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expressions.push(isolateCoverGrammar(parseAssignmentExpression));
            }

            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
        }

        return expr;
    }

    // 12.1 Block

    function parseStatementListItem() {
        if (lookahead.type === Token.Keyword) {
            switch (lookahead.value) {
            case 'export':
                if (sourceType !== 'module') {
                    tolerateUnexpectedToken(lookahead, Messages.IllegalExportDeclaration);
                }
                return parseExportDeclaration();
            case 'import':
                if (sourceType !== 'module') {
                    tolerateUnexpectedToken(lookahead, Messages.IllegalImportDeclaration);
                }
                return parseImportDeclaration();
            case 'const':
            case 'let':
                return parseLexicalDeclaration({inFor: false});
            case 'function':
                return parseFunctionDeclaration(new Node());
            case 'class':
                return parseClassDeclaration();
            }
        }

        return parseStatement();
    }

    function parseStatementList() {
        var list = [];
        while (startIndex < length) {
            if (match('}')) {
                break;
            }
            list.push(parseStatementListItem());
        }

        return list;
    }

    function parseBlock() {
        var block, node = new Node();

        expect('{');

        block = parseStatementList();

        expect('}');

        return node.finishBlockStatement(block);
    }

    // 12.2 Variable Statement

    function parseVariableIdentifier() {
        var token, node = new Node();

        token = lex();

        if (token.type !== Token.Identifier) {
            if (strict && token.type === Token.Keyword && isStrictModeReservedWord(token.value)) {
                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
            } else {
                throwUnexpectedToken(token);
            }
        }

        return node.finishIdentifier(token.value);
    }

    function parseVariableDeclaration() {
        var init = null, id, node = new Node();

        id = parsePattern();

        // 12.2.1
        if (strict && isRestrictedWord(id.name)) {
            tolerateError(Messages.StrictVarName);
        }

        if (match('=')) {
            lex();
            init = isolateCoverGrammar(parseAssignmentExpression);
        } else if (id.type !== Syntax.Identifier) {
            expect('=');
        }

        return node.finishVariableDeclarator(id, init);
    }

    function parseVariableDeclarationList() {
        var list = [];

        do {
            list.push(parseVariableDeclaration());
            if (!match(',')) {
                break;
            }
            lex();
        } while (startIndex < length);

        return list;
    }

    function parseVariableStatement(node) {
        var declarations;

        expectKeyword('var');

        declarations = parseVariableDeclarationList();

        consumeSemicolon();

        return node.finishVariableDeclaration(declarations);
    }

    function parseLexicalBinding(kind, options) {
        var init = null, id, node = new Node();

        id = parsePattern();

        // 12.2.1
        if (strict && id.type === Syntax.Identifier && isRestrictedWord(id.name)) {
            tolerateError(Messages.StrictVarName);
        }

        if (kind === 'const') {
            if (!matchKeyword('in')) {
                expect('=');
                init = isolateCoverGrammar(parseAssignmentExpression);
            }
        } else if ((!options.inFor && id.type !== Syntax.Identifier) || match('=')) {
            expect('=');
            init = isolateCoverGrammar(parseAssignmentExpression);
        }

        return node.finishVariableDeclarator(id, init);
    }

    function parseBindingList(kind, options) {
        var list = [];

        do {
            list.push(parseLexicalBinding(kind, options));
            if (!match(',')) {
                break;
            }
            lex();
        } while (startIndex < length);

        return list;
    }

    function parseLexicalDeclaration(options) {
        var kind, declarations, node = new Node();

        kind = lex().value;
        assert(kind === 'let' || kind === 'const', 'Lexical declaration must be either let or const');

        declarations = parseBindingList(kind, options);

        consumeSemicolon();

        return node.finishLexicalDeclaration(declarations, kind);
    }

    function parseRestElement() {
        var param, node = new Node();

        lex();

        if (match('{')) {
            throwError(Messages.ObjectPatternAsRestParameter);
        }

        param = parseVariableIdentifier();

        if (match('=')) {
            throwError(Messages.DefaultRestParameter);
        }

        if (!match(')')) {
            throwError(Messages.ParameterAfterRestParameter);
        }

        return node.finishRestElement(param);
    }

    // 12.3 Empty Statement

    function parseEmptyStatement(node) {
        expect(';');
        return node.finishEmptyStatement();
    }

    // 12.4 Expression Statement

    function parseExpressionStatement(node) {
        var expr = parseExpression();
        consumeSemicolon();
        return node.finishExpressionStatement(expr);
    }

    // 12.5 If statement

    function parseIfStatement(node) {
        var test, consequent, alternate;

        expectKeyword('if');

        expect('(');

        test = parseExpression();

        expect(')');

        consequent = parseStatement();

        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }

        return node.finishIfStatement(test, consequent, alternate);
    }

    // 12.6 Iteration Statements

    function parseDoWhileStatement(node) {
        var body, test, oldInIteration;

        expectKeyword('do');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        if (match(';')) {
            lex();
        }

        return node.finishDoWhileStatement(body, test);
    }

    function parseWhileStatement(node) {
        var test, body, oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return node.finishWhileStatement(test, body);
    }

    function parseForStatement(node) {
        var init, initSeq, initStartToken, test, update, left, right, kind, declarations,
            body, oldInIteration, previousAllowIn = state.allowIn;

        init = test = update = null;

        expectKeyword('for');

        expect('(');

        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var')) {
                init = new Node();
                lex();

                state.allowIn = false;
                init = init.finishVariableDeclaration(parseVariableDeclarationList());
                state.allowIn = previousAllowIn;

                if (init.declarations.length === 1 && matchKeyword('in')) {
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                } else {
                    expect(';');
                }
            } else if (matchKeyword('const') || matchKeyword('let')) {
                init = new Node();
                kind = lex().value;

                state.allowIn = false;
                declarations = parseBindingList(kind, {inFor: true});
                state.allowIn = previousAllowIn;

                if (declarations.length === 1 && declarations[0].init === null && matchKeyword('in')) {
                    init = init.finishLexicalDeclaration(declarations, kind);
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                } else {
                    consumeSemicolon();
                    init = init.finishLexicalDeclaration(declarations, kind);
                }
            } else {
                initStartToken = lookahead;
                state.allowIn = false;
                init = inheritCoverGrammar(parseAssignmentExpression);
                state.allowIn = previousAllowIn;

                if (matchKeyword('in')) {
                    if (!isAssignmentTarget) {
                        tolerateError(Messages.InvalidLHSInForIn);
                    }

                    lex();
                    reinterpretExpressionAsPattern(init);
                    left = init;
                    right = parseExpression();
                    init = null;
                } else {
                    if (match(',')) {
                        initSeq = [init];
                        while (match(',')) {
                            lex();
                            initSeq.push(isolateCoverGrammar(parseAssignmentExpression));
                        }
                        init = new WrappingNode(initStartToken).finishSequenceExpression(initSeq);
                    }
                    expect(';');
                }
            }
        }

        if (typeof left === 'undefined') {

            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');

            if (!match(')')) {
                update = parseExpression();
            }
        }

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = isolateCoverGrammar(parseStatement);

        state.inIteration = oldInIteration;

        return (typeof left === 'undefined') ?
                node.finishForStatement(init, test, update, body) :
                node.finishForInStatement(left, right, body);
    }

    // 12.7 The continue statement

    function parseContinueStatement(node) {
        var label = null, key;

        expectKeyword('continue');

        // Optimize the most common form: 'continue;'.
        if (source.charCodeAt(startIndex) === 0x3B) {
            lex();

            if (!state.inIteration) {
                throwError(Messages.IllegalContinue);
            }

            return node.finishContinueStatement(null);
        }

        if (hasLineTerminator) {
            if (!state.inIteration) {
                throwError(Messages.IllegalContinue);
            }

            return node.finishContinueStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError(Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !state.inIteration) {
            throwError(Messages.IllegalContinue);
        }

        return node.finishContinueStatement(label);
    }

    // 12.8 The break statement

    function parseBreakStatement(node) {
        var label = null, key;

        expectKeyword('break');

        // Catch the very common case first: immediately a semicolon (U+003B).
        if (source.charCodeAt(lastIndex) === 0x3B) {
            lex();

            if (!(state.inIteration || state.inSwitch)) {
                throwError(Messages.IllegalBreak);
            }

            return node.finishBreakStatement(null);
        }

        if (hasLineTerminator) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError(Messages.IllegalBreak);
            }

            return node.finishBreakStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError(Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError(Messages.IllegalBreak);
        }

        return node.finishBreakStatement(label);
    }

    // 12.9 The return statement

    function parseReturnStatement(node) {
        var argument = null;

        expectKeyword('return');

        if (!state.inFunctionBody) {
            tolerateError(Messages.IllegalReturn);
        }

        // 'return' followed by a space and an identifier is very common.
        if (source.charCodeAt(lastIndex) === 0x20) {
            if (isIdentifierStart(source.charCodeAt(lastIndex + 1))) {
                argument = parseExpression();
                consumeSemicolon();
                return node.finishReturnStatement(argument);
            }
        }

        if (hasLineTerminator) {
            // HACK
            return node.finishReturnStatement(null);
        }

        if (!match(';')) {
            if (!match('}') && lookahead.type !== Token.EOF) {
                argument = parseExpression();
            }
        }

        consumeSemicolon();

        return node.finishReturnStatement(argument);
    }

    // 12.10 The with statement

    function parseWithStatement(node) {
        var object, body;

        if (strict) {
            tolerateError(Messages.StrictModeWith);
        }

        expectKeyword('with');

        expect('(');

        object = parseExpression();

        expect(')');

        body = parseStatement();

        return node.finishWithStatement(object, body);
    }

    // 12.10 The swith statement

    function parseSwitchCase() {
        var test, consequent = [], statement, node = new Node();

        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');

        while (startIndex < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement = parseStatementListItem();
            consequent.push(statement);
        }

        return node.finishSwitchCase(test, consequent);
    }

    function parseSwitchStatement(node) {
        var discriminant, cases, clause, oldInSwitch, defaultFound;

        expectKeyword('switch');

        expect('(');

        discriminant = parseExpression();

        expect(')');

        expect('{');

        cases = [];

        if (match('}')) {
            lex();
            return node.finishSwitchStatement(discriminant, cases);
        }

        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        defaultFound = false;

        while (startIndex < length) {
            if (match('}')) {
                break;
            }
            clause = parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    throwError(Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }

        state.inSwitch = oldInSwitch;

        expect('}');

        return node.finishSwitchStatement(discriminant, cases);
    }

    // 12.13 The throw statement

    function parseThrowStatement(node) {
        var argument;

        expectKeyword('throw');

        if (hasLineTerminator) {
            throwError(Messages.NewlineAfterThrow);
        }

        argument = parseExpression();

        consumeSemicolon();

        return node.finishThrowStatement(argument);
    }

    // 12.14 The try statement

    function parseCatchClause() {
        var param, body, node = new Node();

        expectKeyword('catch');

        expect('(');
        if (match(')')) {
            throwUnexpectedToken(lookahead);
        }

        param = parsePattern();

        // 12.14.1
        if (strict && isRestrictedWord(param.name)) {
            tolerateError(Messages.StrictCatchVariable);
        }

        expect(')');
        body = parseBlock();
        return node.finishCatchClause(param, body);
    }

    function parseTryStatement(node) {
        var block, handler = null, finalizer = null;

        expectKeyword('try');

        block = parseBlock();

        if (matchKeyword('catch')) {
            handler = parseCatchClause();
        }

        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }

        if (!handler && !finalizer) {
            throwError(Messages.NoCatchOrFinally);
        }

        return node.finishTryStatement(block, handler, finalizer);
    }

    // 12.15 The debugger statement

    function parseDebuggerStatement(node) {
        expectKeyword('debugger');

        consumeSemicolon();

        return node.finishDebuggerStatement();
    }

    // 12 Statements

    function parseStatement() {
        var type = lookahead.type,
            expr,
            labeledBody,
            key,
            node;

        if (type === Token.EOF) {
            throwUnexpectedToken(lookahead);
        }

        if (type === Token.Punctuator && lookahead.value === '{') {
            return parseBlock();
        }
        isAssignmentTarget = isBindingElement = true;
        node = new Node();

        if (type === Token.Punctuator) {
            switch (lookahead.value) {
            case ';':
                return parseEmptyStatement(node);
            case '(':
                return parseExpressionStatement(node);
            default:
                break;
            }
        } else if (type === Token.Keyword) {
            switch (lookahead.value) {
            case 'break':
                return parseBreakStatement(node);
            case 'continue':
                return parseContinueStatement(node);
            case 'debugger':
                return parseDebuggerStatement(node);
            case 'do':
                return parseDoWhileStatement(node);
            case 'for':
                return parseForStatement(node);
            case 'function':
                return parseFunctionDeclaration(node);
            case 'if':
                return parseIfStatement(node);
            case 'return':
                return parseReturnStatement(node);
            case 'switch':
                return parseSwitchStatement(node);
            case 'throw':
                return parseThrowStatement(node);
            case 'try':
                return parseTryStatement(node);
            case 'var':
                return parseVariableStatement(node);
            case 'while':
                return parseWhileStatement(node);
            case 'with':
                return parseWithStatement(node);
            default:
                break;
            }
        }

        expr = parseExpression();

        // 12.12 Labelled Statements
        if ((expr.type === Syntax.Identifier) && match(':')) {
            lex();

            key = '$' + expr.name;
            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError(Messages.Redeclaration, 'Label', expr.name);
            }

            state.labelSet[key] = true;
            labeledBody = parseStatement();
            delete state.labelSet[key];
            return node.finishLabeledStatement(expr, labeledBody);
        }

        consumeSemicolon();

        return node.finishExpressionStatement(expr);
    }

    // 13 Function Definition

    function parseFunctionSourceElements() {
        var statement, body = [], token, directive, firstRestricted,
            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody, oldParenthesisCount,
            node = new Node();

        expect('{');

        while (startIndex < length) {
            if (lookahead.type !== Token.StringLiteral) {
                break;
            }
            token = lookahead;

            statement = parseStatementListItem();
            body.push(statement);
            if (statement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.start + 1, token.end - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;
        oldParenthesisCount = state.parenthesizedCount;

        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;
        state.parenthesizedCount = 0;

        while (startIndex < length) {
            if (match('}')) {
                break;
            }
            body.push(parseStatementListItem());
        }

        expect('}');

        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;
        state.parenthesizedCount = oldParenthesisCount;

        return node.finishBlockStatement(body);
    }

    function validateParam(options, param, name) {
        var key = '$' + name;
        if (strict) {
            if (isRestrictedWord(name)) {
                options.stricted = param;
                options.message = Messages.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.stricted = param;
                options.message = Messages.StrictParamDupe;
            }
        } else if (!options.firstRestricted) {
            if (isRestrictedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictParamName;
            } else if (isStrictModeReservedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.firstRestricted = param;
                options.message = Messages.StrictParamDupe;
            }
        }
        options.paramSet[key] = true;
    }

    function parseParam(options) {
        var token, param, def;

        token = lookahead;
        if (token.value === '...') {
            param = parseRestElement();
            validateParam(options, param.argument, param.argument.name);
            options.params.push(param);
            options.defaults.push(null);
            return false;
        }

        param = parsePatternWithDefault();
        validateParam(options, token, token.value);

        if (param.type === Syntax.AssignmentPattern) {
            def = param.right;
            param = param.left;
            ++options.defaultCount;
        }

        options.params.push(param);
        options.defaults.push(def);

        return !match(')');
    }

    function parseParams(firstRestricted) {
        var options;

        options = {
            params: [],
            defaultCount: 0,
            defaults: [],
            firstRestricted: firstRestricted
        };

        expect('(');

        if (!match(')')) {
            options.paramSet = {};
            while (startIndex < length) {
                if (!parseParam(options)) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        if (options.defaultCount === 0) {
            options.defaults = [];
        }

        return {
            params: options.params,
            defaults: options.defaults,
            stricted: options.stricted,
            firstRestricted: options.firstRestricted,
            message: options.message
        };
    }

    function parseFunctionDeclaration(node, identifierIsOptional) {
        var id = null, params = [], defaults = [], body, token, stricted, tmp, firstRestricted, message, previousStrict;

        expectKeyword('function');
        if (!identifierIsOptional || !match('(')) {
            token = lookahead;
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        defaults = tmp.defaults;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwUnexpectedToken(firstRestricted, message);
        }
        if (strict && stricted) {
            tolerateUnexpectedToken(stricted, message);
        }
        strict = previousStrict;

        return node.finishFunctionDeclaration(id, params, defaults, body);
    }

    function parseFunctionExpression() {
        var token, id = null, stricted, firstRestricted, message, tmp,
            params = [], defaults = [], body, previousStrict, node = new Node();

        expectKeyword('function');

        if (!match('(')) {
            token = lookahead;
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        defaults = tmp.defaults;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwUnexpectedToken(firstRestricted, message);
        }
        if (strict && stricted) {
            tolerateUnexpectedToken(stricted, message);
        }
        strict = previousStrict;

        return node.finishFunctionExpression(id, params, defaults, body);
    }


    function parseClassBody() {
        var classBody, token, isStatic, hasConstructor = false, body, method, computed, key;

        classBody = new Node();

        expect('{');
        body = [];
        while (!match('}')) {
            if (match(';')) {
                lex();
            } else {
                method = new Node();
                token = lookahead;
                isStatic = false;
                computed = match('[');
                key = parseObjectPropertyKey();
                if (key.name === 'static' && lookaheadPropertyName()) {
                    token = lookahead;
                    isStatic = true;
                    computed = match('[');
                    key = parseObjectPropertyKey();
                }
                method = tryParseMethodDefinition(token, key, computed, method);
                if (method) {
                    method['static'] = isStatic;
                    if (method.kind === 'init') {
                        method.kind = 'method';
                    }
                    if (!isStatic) {
                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'constructor') {
                            if (method.kind !== 'method' || !method.method || method.value.generator) {
                                throwUnexpectedToken(token, Messages.ConstructorSpecialMethod);
                            }
                            if (hasConstructor) {
                                throwUnexpectedToken(token, Messages.DuplicateConstructor);
                            } else {
                                hasConstructor = true;
                            }
                            method.kind = 'constructor';
                        }
                    } else {
                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'prototype') {
                            throwUnexpectedToken(token, Messages.StaticPrototype);
                        }
                    }
                    method.type = Syntax.MethodDefinition;
                    delete method.method;
                    delete method.shorthand;
                    body.push(method);
                } else {
                    throwUnexpectedToken(lookahead);
                }
            }
        }
        lex();
        return classBody.finishClassBody(body);
    }

    function parseClassDeclaration(identifierIsOptional) {
        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
        strict = true;

        expectKeyword('class');

        if (!identifierIsOptional || lookahead.type === Token.Identifier) {
            id = parseVariableIdentifier();
        }

        if (matchKeyword('extends')) {
            lex();
            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
        }
        classBody = parseClassBody();
        strict = previousStrict;

        return classNode.finishClassDeclaration(id, superClass, classBody);
    }

    function parseClassExpression() {
        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
        strict = true;

        expectKeyword('class');

        if (lookahead.type === Token.Identifier) {
            id = parseVariableIdentifier();
        }

        if (matchKeyword('extends')) {
            lex();
            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
        }
        classBody = parseClassBody();
        strict = previousStrict;

        return classNode.finishClassExpression(id, superClass, classBody);
    }

    // Modules grammar from:
    // people.mozilla.org/~jorendorff/es6-draft.html

    function parseModuleSpecifier() {
        var node = new Node();

        if (lookahead.type !== Token.StringLiteral) {
            throwError(Messages.InvalidModuleSpecifier);
        }
        return node.finishLiteral(lex());
    }

    function parseExportSpecifier() {
        var exported, local, node = new Node(), def;
        if (matchKeyword('default')) {
            // export {default} from 'something';
            def = new Node();
            lex();
            local = def.finishIdentifier('default');
        } else {
            local = parseVariableIdentifier();
        }
        if (matchContextualKeyword('as')) {
            lex();
            exported = parseNonComputedProperty();
        }
        return node.finishExportSpecifier(local, exported);
    }

    function parseExportNamedDeclaration(node) {
        var declaration = null,
            isExportFromIdentifier,
            src = null, specifiers = [];

        // non-default export
        if (lookahead.type === Token.Keyword) {
            // covers:
            // export var f = 1;
            switch (lookahead.value) {
                case 'let':
                case 'const':
                case 'var':
                case 'class':
                case 'function':
                    declaration = parseStatementListItem();
                    return node.finishExportNamedDeclaration(declaration, specifiers, null);
            }
        }

        expect('{');
        if (!match('}')) {
            do {
                isExportFromIdentifier = isExportFromIdentifier || matchKeyword('default');
                specifiers.push(parseExportSpecifier());
            } while (match(',') && lex());
        }
        expect('}');

        if (matchContextualKeyword('from')) {
            // covering:
            // export {default} from 'foo';
            // export {foo} from 'foo';
            lex();
            src = parseModuleSpecifier();
            consumeSemicolon();
        } else if (isExportFromIdentifier) {
            // covering:
            // export {default}; // missing fromClause
            throwError(lookahead.value ?
                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
        } else {
            // cover
            // export {foo};
            consumeSemicolon();
        }
        return node.finishExportNamedDeclaration(declaration, specifiers, src);
    }

    function parseExportDefaultDeclaration(node) {
        var declaration = null,
            expression = null;

        // covers:
        // export default ...
        expectKeyword('default');

        if (matchKeyword('function')) {
            // covers:
            // export default function foo () {}
            // export default function () {}
            declaration = parseFunctionDeclaration(new Node(), true);
            return node.finishExportDefaultDeclaration(declaration);
        }
        if (matchKeyword('class')) {
            declaration = parseClassDeclaration(true);
            return node.finishExportDefaultDeclaration(declaration);
        }

        if (matchContextualKeyword('from')) {
            throwError(Messages.UnexpectedToken, lookahead.value);
        }

        // covers:
        // export default {};
        // export default [];
        // export default (1 + 2);
        if (match('{')) {
            expression = parseObjectInitialiser();
        } else if (match('[')) {
            expression = parseArrayInitialiser();
        } else {
            expression = parseAssignmentExpression();
        }
        consumeSemicolon();
        return node.finishExportDefaultDeclaration(expression);
    }

    function parseExportAllDeclaration(node) {
        var src;

        // covers:
        // export * from 'foo';
        expect('*');
        if (!matchContextualKeyword('from')) {
            throwError(lookahead.value ?
                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
        }
        lex();
        src = parseModuleSpecifier();
        consumeSemicolon();

        return node.finishExportAllDeclaration(src);
    }

    function parseExportDeclaration() {
        var node = new Node();
        if (state.inFunctionBody) {
            throwError(Messages.IllegalExportDeclaration);
        }

        expectKeyword('export');

        if (matchKeyword('default')) {
            return parseExportDefaultDeclaration(node);
        }
        if (match('*')) {
            return parseExportAllDeclaration(node);
        }
        return parseExportNamedDeclaration(node);
    }

    function parseImportSpecifier() {
        // import {<foo as bar>} ...;
        var local, imported, node = new Node();

        imported = parseNonComputedProperty();
        if (matchContextualKeyword('as')) {
            lex();
            local = parseVariableIdentifier();
        }

        return node.finishImportSpecifier(local, imported);
    }

    function parseNamedImports() {
        var specifiers = [];
        // {foo, bar as bas}
        expect('{');
        if (!match('}')) {
            do {
                specifiers.push(parseImportSpecifier());
            } while (match(',') && lex());
        }
        expect('}');
        return specifiers;
    }

    function parseImportDefaultSpecifier() {
        // import <foo> ...;
        var local, node = new Node();

        local = parseNonComputedProperty();

        return node.finishImportDefaultSpecifier(local);
    }

    function parseImportNamespaceSpecifier() {
        // import <* as foo> ...;
        var local, node = new Node();

        expect('*');
        if (!matchContextualKeyword('as')) {
            throwError(Messages.NoAsAfterImportNamespace);
        }
        lex();
        local = parseNonComputedProperty();

        return node.finishImportNamespaceSpecifier(local);
    }

    function parseImportDeclaration() {
        var specifiers, src, node = new Node();

        if (state.inFunctionBody) {
            throwError(Messages.IllegalImportDeclaration);
        }

        expectKeyword('import');
        specifiers = [];

        if (lookahead.type === Token.StringLiteral) {
            // covers:
            // import 'foo';
            src = parseModuleSpecifier();
            consumeSemicolon();
            return node.finishImportDeclaration(specifiers, src);
        }

        if (!matchKeyword('default') && isIdentifierName(lookahead)) {
            // covers:
            // import foo
            // import foo, ...
            specifiers.push(parseImportDefaultSpecifier());
            if (match(',')) {
                lex();
            }
        }
        if (match('*')) {
            // covers:
            // import foo, * as foo
            // import * as foo
            specifiers.push(parseImportNamespaceSpecifier());
        } else if (match('{')) {
            // covers:
            // import foo, {bar}
            // import {bar}
            specifiers = specifiers.concat(parseNamedImports());
        }

        if (!matchContextualKeyword('from')) {
            throwError(lookahead.value ?
                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
        }
        lex();
        src = parseModuleSpecifier();
        consumeSemicolon();

        return node.finishImportDeclaration(specifiers, src);
    }

    // 14 Program

    function parseScriptBody() {
        var statement, body = [], token, directive, firstRestricted;

        while (startIndex < length) {
            token = lookahead;
            if (token.type !== Token.StringLiteral) {
                break;
            }

            statement = parseStatementListItem();
            body.push(statement);
            if (statement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.start + 1, token.end - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        while (startIndex < length) {
            statement = parseStatementListItem();
            /* istanbul ignore if */
            if (typeof statement === 'undefined') {
                break;
            }
            body.push(statement);
        }
        return body;
    }

    function parseProgram() {
        var body, node;

        peek();
        node = new Node();

        body = parseScriptBody();
        return node.finishProgram(body);
    }

    function filterTokenLocation() {
        var i, entry, token, tokens = [];

        for (i = 0; i < extra.tokens.length; ++i) {
            entry = extra.tokens[i];
            token = {
                type: entry.type,
                value: entry.value
            };
            if (entry.regex) {
                token.regex = {
                    pattern: entry.regex.pattern,
                    flags: entry.regex.flags
                };
            }
            if (extra.range) {
                token.range = entry.range;
            }
            if (extra.loc) {
                token.loc = entry.loc;
            }
            tokens.push(token);
        }

        extra.tokens = tokens;
    }

    function tokenize(code, options) {
        var toString,
            tokens;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
            curlyStack: []
        };

        extra = {};

        // Options matching.
        options = options || {};

        // Of course we collect tokens here.
        options.tokens = true;
        extra.tokens = [];
        extra.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra.openParenToken = -1;
        extra.openCurlyToken = -1;

        extra.range = (typeof options.range === 'boolean') && options.range;
        extra.loc = (typeof options.loc === 'boolean') && options.loc;

        if (typeof options.comment === 'boolean' && options.comment) {
            extra.comments = [];
        }
        if (typeof options.tolerant === 'boolean' && options.tolerant) {
            extra.errors = [];
        }

        try {
            peek();
            if (lookahead.type === Token.EOF) {
                return extra.tokens;
            }

            lex();
            while (lookahead.type !== Token.EOF) {
                try {
                    lex();
                } catch (lexError) {
                    if (extra.errors) {
                        recordError(lexError);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError;
                    }
                }
            }

            filterTokenLocation();
            tokens = extra.tokens;
            if (typeof extra.comments !== 'undefined') {
                tokens.comments = extra.comments;
            }
            if (typeof extra.errors !== 'undefined') {
                tokens.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }
        return tokens;
    }

    function parse(code, options) {
        var program, toString;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        startIndex = index;
        startLineNumber = lineNumber;
        startLineStart = lineStart;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
            curlyStack: []
        };
        sourceType = 'script';
        strict = false;

        extra = {};
        if (typeof options !== 'undefined') {
            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;
            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;

            if (extra.loc && options.source !== null && options.source !== undefined) {
                extra.source = toString(options.source);
            }

            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
            if (extra.attachComment) {
                extra.range = true;
                extra.comments = [];
                extra.bottomRightStack = [];
                extra.trailingComments = [];
                extra.leadingComments = [];
            }
            if (options.sourceType === 'module') {
                // very restrictive condition for now
                sourceType = options.sourceType;
                strict = true;
            }
        }

        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }

        return program;
    }

    // Sync with *.json manifests.
    exports.version = '2.2.0';

    exports.tokenize = tokenize;

    exports.parse = parse;

    // Deep copy.
    /* istanbul ignore next */
    exports.Syntax = (function () {
        var name, types = {};

        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }

        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }

        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }

        return types;
    }());

}));
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],121:[function(require,module,exports){
/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*jslint vars:false, bitwise:true*/
/*jshint indent:4*/
/*global exports:true*/
(function clone(exports) {
    'use strict';

    var Syntax,
        isArray,
        VisitorOption,
        VisitorKeys,
        objectCreate,
        objectKeys,
        BREAK,
        SKIP,
        REMOVE;

    function ignoreJSHintError() { }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                val = obj[key];
                if (typeof val === 'object' && val !== null) {
                    ret[key] = deepCopy(val);
                } else {
                    ret[key] = val;
                }
            }
        }
        return ret;
    }

    function shallowCopy(obj) {
        var ret = {}, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    ignoreJSHintError(shallowCopy);

    // based on LLVM libc++ upper_bound / lower_bound
    // MIT License

    function upperBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                len = diff;
            } else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

    function lowerBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                i = current + 1;
                len -= diff + 1;
            } else {
                len = diff;
            }
        }
        return i;
    }
    ignoreJSHintError(lowerBound);

    objectCreate = Object.create || (function () {
        function F() { }

        return function (o) {
            F.prototype = o;
            return new F();
        };
    })();

    objectKeys = Object.keys || function (o) {
        var keys = [], key;
        for (key in o) {
            keys.push(key);
        }
        return keys;
    };

    function extend(to, from) {
        var keys = objectKeys(from), key, i, len;
        for (i = 0, len = keys.length; i < len; i += 1) {
            key = keys[i];
            to[key] = from[key];
        }
        return to;
    }

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        AssignmentPattern: 'AssignmentPattern',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        AwaitExpression: 'AwaitExpression', // CAUTION: It's deferred to ES7.
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ComprehensionBlock: 'ComprehensionBlock',  // CAUTION: It's deferred to ES7.
        ComprehensionExpression: 'ComprehensionExpression',  // CAUTION: It's deferred to ES7.
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExportAllDeclaration: 'ExportAllDeclaration',
        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
        ExportNamedDeclaration: 'ExportNamedDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        GeneratorExpression: 'GeneratorExpression',  // CAUTION: It's deferred to ES7.
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MetaProperty: 'MetaProperty',
        MethodDefinition: 'MethodDefinition',
        ModuleSpecifier: 'ModuleSpecifier',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        RestElement: 'RestElement',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        Super: 'Super',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        AssignmentPattern: ['left', 'right'],
        ArrayExpression: ['elements'],
        ArrayPattern: ['elements'],
        ArrowFunctionExpression: ['params', 'body'],
        AwaitExpression: ['argument'], // CAUTION: It's deferred to ES7.
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ClassBody: ['body'],
        ClassDeclaration: ['id', 'superClass', 'body'],
        ClassExpression: ['id', 'superClass', 'body'],
        ComprehensionBlock: ['left', 'right'],  // CAUTION: It's deferred to ES7.
        ComprehensionExpression: ['blocks', 'filter', 'body'],  // CAUTION: It's deferred to ES7.
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExportAllDeclaration: ['source'],
        ExportDefaultDeclaration: ['declaration'],
        ExportNamedDeclaration: ['declaration', 'specifiers', 'source'],
        ExportSpecifier: ['exported', 'local'],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        ForOfStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'body'],
        FunctionExpression: ['id', 'params', 'body'],
        GeneratorExpression: ['blocks', 'filter', 'body'],  // CAUTION: It's deferred to ES7.
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        ImportDeclaration: ['specifiers', 'source'],
        ImportDefaultSpecifier: ['local'],
        ImportNamespaceSpecifier: ['local'],
        ImportSpecifier: ['imported', 'local'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        MetaProperty: ['meta', 'property'],
        MethodDefinition: ['key', 'value'],
        ModuleSpecifier: [],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        RestElement: [ 'argument' ],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SpreadElement: ['argument'],
        Super: [],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        TaggedTemplateExpression: ['tag', 'quasi'],
        TemplateElement: [],
        TemplateLiteral: ['quasis', 'expressions'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handler', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body'],
        YieldExpression: ['argument']
    };

    // unique id
    BREAK = {};
    SKIP = {};
    REMOVE = {};

    VisitorOption = {
        Break: BREAK,
        Skip: SKIP,
        Remove: REMOVE
    };

    function Reference(parent, key) {
        this.parent = parent;
        this.key = key;
    }

    Reference.prototype.replace = function replace(node) {
        this.parent[this.key] = node;
    };

    Reference.prototype.remove = function remove() {
        if (isArray(this.parent)) {
            this.parent.splice(this.key, 1);
            return true;
        } else {
            this.replace(null);
            return false;
        }
    };

    function Element(node, path, wrap, ref) {
        this.node = node;
        this.path = path;
        this.wrap = wrap;
        this.ref = ref;
    }

    function Controller() { }

    // API:
    // return property path array from root to current node
    Controller.prototype.path = function path() {
        var i, iz, j, jz, result, element;

        function addToPath(result, path) {
            if (isArray(path)) {
                for (j = 0, jz = path.length; j < jz; ++j) {
                    result.push(path[j]);
                }
            } else {
                result.push(path);
            }
        }

        // root node
        if (!this.__current.path) {
            return null;
        }

        // first node is sentinel, second node is root element
        result = [];
        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
            element = this.__leavelist[i];
            addToPath(result, element.path);
        }
        addToPath(result, this.__current.path);
        return result;
    };

    // API:
    // return type of current node
    Controller.prototype.type = function () {
        var node = this.current();
        return node.type || this.__current.wrap;
    };

    // API:
    // return array of parent elements
    Controller.prototype.parents = function parents() {
        var i, iz, result;

        // first node is sentinel
        result = [];
        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
            result.push(this.__leavelist[i].node);
        }

        return result;
    };

    // API:
    // return current node
    Controller.prototype.current = function current() {
        return this.__current.node;
    };

    Controller.prototype.__execute = function __execute(callback, element) {
        var previous, result;

        result = undefined;

        previous  = this.__current;
        this.__current = element;
        this.__state = null;
        if (callback) {
            result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        }
        this.__current = previous;

        return result;
    };

    // API:
    // notify control skip / break
    Controller.prototype.notify = function notify(flag) {
        this.__state = flag;
    };

    // API:
    // skip child nodes of current node
    Controller.prototype.skip = function () {
        this.notify(SKIP);
    };

    // API:
    // break traversals
    Controller.prototype['break'] = function () {
        this.notify(BREAK);
    };

    // API:
    // remove node
    Controller.prototype.remove = function () {
        this.notify(REMOVE);
    };

    Controller.prototype.__initialize = function(root, visitor) {
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
        this.__current = null;
        this.__state = null;
        this.__fallback = visitor.fallback === 'iteration';
        this.__keys = VisitorKeys;
        if (visitor.keys) {
            this.__keys = extend(objectCreate(this.__keys), visitor.keys);
        }
    };

    function isNode(node) {
        if (node == null) {
            return false;
        }
        return typeof node === 'object' && typeof node.type === 'string';
    }

    function isProperty(nodeType, key) {
        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === key;
    }

    Controller.prototype.traverse = function traverse(root, visitor) {
        var worklist,
            leavelist,
            element,
            node,
            nodeType,
            ret,
            key,
            current,
            current2,
            candidates,
            candidate,
            sentinel;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        worklist.push(new Element(root, null, null, null));
        leavelist.push(new Element(null, null, null, null));

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                ret = this.__execute(visitor.leave, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }
                continue;
            }

            if (element.node) {

                ret = this.__execute(visitor.enter, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }

                worklist.push(sentinel);
                leavelist.push(element);

                if (this.__state === SKIP || ret === SKIP) {
                    continue;
                }

                node = element.node;
                nodeType = element.wrap || node.type;
                candidates = this.__keys[nodeType];
                if (!candidates) {
                    if (this.__fallback) {
                        candidates = objectKeys(node);
                    } else {
                        throw new Error('Unknown node type ' + nodeType + '.');
                    }
                }

                current = candidates.length;
                while ((current -= 1) >= 0) {
                    key = candidates[current];
                    candidate = node[key];
                    if (!candidate) {
                        continue;
                    }

                    if (isArray(candidate)) {
                        current2 = candidate.length;
                        while ((current2 -= 1) >= 0) {
                            if (!candidate[current2]) {
                                continue;
                            }
                            if (isProperty(nodeType, candidates[current])) {
                                element = new Element(candidate[current2], [key, current2], 'Property', null);
                            } else if (isNode(candidate[current2])) {
                                element = new Element(candidate[current2], [key, current2], null, null);
                            } else {
                                continue;
                            }
                            worklist.push(element);
                        }
                    } else if (isNode(candidate)) {
                        worklist.push(new Element(candidate, key, null, null));
                    }
                }
            }
        }
    };

    Controller.prototype.replace = function replace(root, visitor) {
        function removeElem(element) {
            var i,
                key,
                nextElem,
                parent;

            if (element.ref.remove()) {
                // When the reference is an element of an array.
                key = element.ref.key;
                parent = element.ref.parent;

                // If removed from array, then decrease following items' keys.
                i = worklist.length;
                while (i--) {
                    nextElem = worklist[i];
                    if (nextElem.ref && nextElem.ref.parent === parent) {
                        if  (nextElem.ref.key < key) {
                            break;
                        }
                        --nextElem.ref.key;
                    }
                }
            }
        }

        var worklist,
            leavelist,
            node,
            nodeType,
            target,
            element,
            current,
            current2,
            candidates,
            candidate,
            sentinel,
            outer,
            key;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        outer = {
            root: root
        };
        element = new Element(root, null, null, new Reference(outer, 'root'));
        worklist.push(element);
        leavelist.push(element);

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                target = this.__execute(visitor.leave, element);

                // node may be replaced with null,
                // so distinguish between undefined and null in this place
                if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                    // replace
                    element.ref.replace(target);
                }

                if (this.__state === REMOVE || target === REMOVE) {
                    removeElem(element);
                }

                if (this.__state === BREAK || target === BREAK) {
                    return outer.root;
                }
                continue;
            }

            target = this.__execute(visitor.enter, element);

            // node may be replaced with null,
            // so distinguish between undefined and null in this place
            if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                // replace
                element.ref.replace(target);
                element.node = target;
            }

            if (this.__state === REMOVE || target === REMOVE) {
                removeElem(element);
                element.node = null;
            }

            if (this.__state === BREAK || target === BREAK) {
                return outer.root;
            }

            // node may be null
            node = element.node;
            if (!node) {
                continue;
            }

            worklist.push(sentinel);
            leavelist.push(element);

            if (this.__state === SKIP || target === SKIP) {
                continue;
            }

            nodeType = element.wrap || node.type;
            candidates = this.__keys[nodeType];
            if (!candidates) {
                if (this.__fallback) {
                    candidates = objectKeys(node);
                } else {
                    throw new Error('Unknown node type ' + nodeType + '.');
                }
            }

            current = candidates.length;
            while ((current -= 1) >= 0) {
                key = candidates[current];
                candidate = node[key];
                if (!candidate) {
                    continue;
                }

                if (isArray(candidate)) {
                    current2 = candidate.length;
                    while ((current2 -= 1) >= 0) {
                        if (!candidate[current2]) {
                            continue;
                        }
                        if (isProperty(nodeType, candidates[current])) {
                            element = new Element(candidate[current2], [key, current2], 'Property', new Reference(candidate, current2));
                        } else if (isNode(candidate[current2])) {
                            element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));
                        } else {
                            continue;
                        }
                        worklist.push(element);
                    }
                } else if (isNode(candidate)) {
                    worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                }
            }
        }

        return outer.root;
    };

    function traverse(root, visitor) {
        var controller = new Controller();
        return controller.traverse(root, visitor);
    }

    function replace(root, visitor) {
        var controller = new Controller();
        return controller.replace(root, visitor);
    }

    function extendCommentRange(comment, tokens) {
        var target;

        target = upperBound(tokens, function search(token) {
            return token.range[0] > comment.range[0];
        });

        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }

        target -= 1;
        if (target >= 0) {
            comment.extendedRange[0] = tokens[target].range[1];
        }

        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        // At first, we should calculate extended comment ranges.
        var comments = [], comment, len, i, cursor;

        if (!tree.range) {
            throw new Error('attachComments needs range information');
        }

        // tokens array is empty, we attach comments to tree as 'leadingComments'
        if (!tokens.length) {
            if (providedComments.length) {
                for (i = 0, len = providedComments.length; i < len; i += 1) {
                    comment = deepCopy(providedComments[i]);
                    comment.extendedRange = [0, tree.range[0]];
                    comments.push(comment);
                }
                tree.leadingComments = comments;
            }
            return tree;
        }

        for (i = 0, len = providedComments.length; i < len; i += 1) {
            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }

        // This is based on John Freeman's implementation.
        cursor = 0;
        traverse(tree, {
            enter: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) {
                        break;
                    }

                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) {
                            node.leadingComments = [];
                        }
                        node.leadingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        cursor = 0;
        traverse(tree, {
            leave: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) {
                        break;
                    }

                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) {
                            node.trailingComments = [];
                        }
                        node.trailingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        return tree;
    }

    exports.version = require('./package.json').version;
    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.Controller = Controller;
    exports.cloneEnvironment = function () { return clone({}); };

    return exports;
}(exports));
/* vim: set sw=4 ts=4 et tw=80 : */

},{"./package.json":122}],122:[function(require,module,exports){
module.exports={
  "name": "estraverse",
  "description": "ECMAScript JS AST traversal functions",
  "homepage": "https://github.com/estools/estraverse",
  "main": "estraverse.js",
  "version": "4.1.0",
  "engines": {
    "node": ">=0.10.0"
  },
  "maintainers": [
    {
      "name": "constellation",
      "email": "utatane.tea@gmail.com"
    },
    {
      "name": "michaelficarra",
      "email": "npm@michael.ficarra.me"
    }
  ],
  "repository": {
    "type": "git",
    "url": "git+ssh://git@github.com/estools/estraverse.git"
  },
  "devDependencies": {
    "chai": "^2.1.1",
    "coffee-script": "^1.8.0",
    "espree": "^1.11.0",
    "gulp": "^3.8.10",
    "gulp-bump": "^0.2.2",
    "gulp-filter": "^2.0.0",
    "gulp-git": "^1.0.1",
    "gulp-tag-version": "^1.2.1",
    "jshint": "^2.5.6",
    "mocha": "^2.1.0"
  },
  "licenses": [
    {
      "type": "BSD",
      "url": "http://github.com/estools/estraverse/raw/master/LICENSE.BSD"
    }
  ],
  "scripts": {
    "test": "npm run-script lint && npm run-script unit-test",
    "lint": "jshint estraverse.js",
    "unit-test": "mocha --compilers coffee:coffee-script/register"
  },
  "gitHead": "347d52996336719b5910c7ffb5ff3ea8ecb87cf3",
  "bugs": {
    "url": "https://github.com/estools/estraverse/issues"
  },
  "_id": "estraverse@4.1.0",
  "_shasum": "40f23a76092041be6467d7f235c933b670766e05",
  "_from": "estraverse@>=4.0.0 <5.0.0",
  "_npmVersion": "2.8.3",
  "_nodeVersion": "1.8.1",
  "_npmUser": {
    "name": "constellation",
    "email": "utatane.tea@gmail.com"
  },
  "dist": {
    "shasum": "40f23a76092041be6467d7f235c933b670766e05",
    "tarball": "http://registry.npmjs.org/estraverse/-/estraverse-4.1.0.tgz"
  },
  "directories": {},
  "_resolved": "https://registry.npmjs.org/estraverse/-/estraverse-4.1.0.tgz",
  "readme": "ERROR: No README data found!"
}

},{}]},{},[50])(50)
});