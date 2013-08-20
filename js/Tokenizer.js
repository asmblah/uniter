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
    'js/Exception'
], function (
    util,
    Exception
) {
    'use strict';

    function Tokenizer(spec) {
        this.regex = null;
        this.spec = spec;
        this.tokenSpecs = null;
    }

    util.extend(Tokenizer.prototype, {
        getRegex: function () {
            var capturingGroups = 0,
                caseIgnored = null,
                parts = [],
                tokenizer = this,
                tokenSpecs = [],
                options = tokenizer.spec.options || {},
                defaults = options.defaults || {},
                prefix;

            if (tokenizer.regex) {
                return tokenizer.regex;
            }

            util.each(tokenizer.spec.tokens, function (data, name) {
                var modes,
                    source,
                    tokenSpec = {
                        lowPriority: false,
                        matchHandler: null,
                        name: name,
                        requires: util.extend({
                            mode: null
                        }, defaults.requires)
                    };

                tokenSpecs[capturingGroups] = tokenSpec;
                capturingGroups++;

                if (util.isPlainObject(data)) {
                    if (data.matchHandler) {
                        tokenSpec.matchHandler = data.matchHandler;
                    }
                    util.extend(tokenSpec.requires, data.requires);
                    if (typeof data.lowPriority !== 'undefined') {
                        tokenSpec.lowPriority = data.lowPriority;
                    }
                    data = data.pattern;
                }

                if (data instanceof RegExp) {
                    source = data.source;

                    if (/[a-z]/i.test(source)) {
                        if (caseIgnored === null) {
                            caseIgnored = data.ignoreCase;
                        } else {
                            /*if (data.ignoreCase !== caseIgnored) {
                                throw new Exception('Tokenizer.getRegex() :: Token "' + name + '" is' + (data.ignoreCase ? '' : ' not') + ' case insensitive, when preceding tokens are' + (caseIgnored ? '' : ' not'));
                            }*/
                        }
                    }

                    (function () {
                        function partial(regex) {
                            return regex.toString().replace(/^\/|\/$/g, '');
                        }

                        var CHARACTER_CLASS = partial(/\[\]?(?:[^\]]|\\\])*\]/),
                            OUTSIDE = '(?:(?:' + CHARACTER_CLASS + '|\\\\\\(|(?!\\\\\\d)[^\\(]|\\(\\?)*)',
                            match,
                            pos = 0,
                            regex = new RegExp('^(?:(' + OUTSIDE + '?' + partial(/(\()?/) + ')' + partial(/(?:\\(\d+))?/) + ')');

                        while (pos < source.length && (match = source.substr(pos).match(regex))) {
                            // Fix backreferences in character classes (are these valid?) and free context
                            if (match[1] || match[3]) {
                                source = source.substr(0, pos) + match[0].replace(/([^\\]\\(?:\\\\)*)(\d+)/g, function (all, leading, index) {
                                    var oldBackreference = index * 1,
                                        newBackreference = capturingGroups + oldBackreference - 2;
                                    return leading + newBackreference;
                                }) + source.substr(pos + match[0].length);
                            }

                            if (match[2]) {
                                capturingGroups++;
                            }

                            pos += match[0].length;
                        }
                    }());

                    data = source;
                } else if (util.isString(data)) {
                    data = util.regexEscape(data);
                } else {
                    throw new Exception('Tokenizer.getRegex() :: Unsupported token data: ' + data);
                }

                if (!tokenSpec.requires.mode) {
                    prefix = '[^@]*';
                } else {
                    if (util.isArray(tokenSpec.requires.mode)) {
                        modes = tokenSpec.requires.mode;
                        util.each(modes, function (mode, index) {
                            modes[index] = util.regexEscape(mode);
                        });
                        prefix = '(?:' + modes.join('|') + ')';
                    } else {
                        prefix = util.regexEscape(tokenSpec.requires.mode);
                    }
                }

                parts.push(prefix + '@(?:' + data + ')(?:\\b|$|(?=[^a-z0-9]))');
            });

            tokenizer.regex = new RegExp('^(?=(' + parts.join(')?)(?=(') + ')?)', caseIgnored ? 'i' : '');
            tokenizer.tokenSpecs = tokenSpecs;

            return tokenizer.regex;
        },

        parse: function (code) {
            var capture,
                captureIndex,
                captures,
                codePos = 0,
                delimiter,
                index,
                length,
                longestMatchedTokenData,
                lowPriorityTokenDatas,
                match,
                matchedTokenDatas,
                modePrefix = '@',
                noCapturesRegex,
                options,
                pushedTokenSpecNames = {},
                pushedTokenSpecs = [],
                state = {
                    getLastToken: function () {
                        return tokens[tokens.length - 1];
                    },
                    getMode: function () {
                        return modePrefix.replace(/@$/, '');
                    },
                    halt: function () {
                        codePos = code.length;
                    },
                    popTokenSpec: function (name) {
                        var index,
                            length;
                        for (index = 0, length = pushedTokenSpecs.length; index < length; index++) {
                            if (pushedTokenSpecs[index].name === name) {
                                pushedTokenSpecs.splice(index, 1);
                                break;
                            }
                        }
                        delete pushedTokenSpecNames[name];
                    },
                    pushTokenSpec: function (name, tokenSpec) {
                        pushedTokenSpecs.push(util.extend({
                            name: name,
                            requires: {}
                        }, tokenSpec));
                        pushedTokenSpecNames[name] = true;
                    },
                    regexEscape: util.regexEscape,
                    setMode: function (mode) {
                        modePrefix = mode + '@';
                    }
                },
                token,
                tokenizer = this,
                tokens = [],
                tokenData,
                tokenSpec,
                regex = tokenizer.getRegex();

            if (tokenizer.spec.options) {
                options = tokenizer.spec.options;
                if (options.initialMode) {
                    modePrefix = options.initialMode + '@';
                }
            }

            (function () {
                var delimiterLength = 1,
                    delimiterPattern;

                function getDelimiter() {
                    return new Array(delimiterLength + 1).join('\u0000\u0001');
                }

                while (code.indexOf(getDelimiter()) > -1) {
                    delimiterLength += 1;
                }

                delimiter = getDelimiter();
                delimiterPattern = '(?:\\u0000\\u0001){' + delimiterLength + '}';

                noCapturesRegex = new RegExp('^(?:' + delimiterPattern + ')*$');
            }());

            while (true) {
                match = null;
                matchedTokenDatas = [];

                for (index = 0; index < pushedTokenSpecs.length; index++) {
                    tokenSpec = pushedTokenSpecs[index];
                    match = code.substr(codePos).match(tokenSpec.pattern);

                    if (match) {
                        capture = match[0];
                        token = {
                            name: tokenSpec.name,
                            offset: codePos,
                            text: capture
                        };
                        tokenData = {
                            captures: match,
                            token: token,
                            tokenSpec: tokenSpec
                        };

                        matchedTokenDatas.push(tokenData);
                    }
                }

                match = (modePrefix + code.substr(codePos)).match(regex);

                if (match) {
                    for (captureIndex = 1, length = match.length; captureIndex < length; captureIndex++) {
                        capture = match[captureIndex];
                        if (capture !== undefined) {
                            tokenSpec = tokenizer.tokenSpecs[captureIndex - 1];

                            if (!tokenSpec || !pushedTokenSpecNames[tokenSpec.name]) {
                                if (tokenSpec) {
                                    capture = capture.substr(modePrefix.length);
                                    captures = [];
                                    token = {
                                        name: tokenSpec.name,
                                        offset: codePos,
                                        text: capture
                                    };
                                    tokenData = {
                                        captures: captures,
                                        token: token,
                                        tokenSpec: tokenSpec
                                    };

                                    matchedTokenDatas.push(tokenData);
                                }

                                captures.push(capture);
                            }
                        }
                    }
                }

                if (matchedTokenDatas.length === 0) {
                    break;
                }

                longestMatchedTokenData = null;
                lowPriorityTokenDatas = [];
                for (index = 0; (tokenData = matchedTokenDatas[index]); index++) {
                    if (tokenData.tokenSpec.lowPriority) {
                        lowPriorityTokenDatas.push(tokenData);
                    } else {
                        if (!longestMatchedTokenData || tokenData.token.text.length > longestMatchedTokenData.token.text.length) {
                            if (!tokenData.tokenSpec.requires.condition || tokenData.tokenSpec.requires.condition(state, tokenData.captures) !== false) {
                                longestMatchedTokenData = tokenData;
                            }
                        }
                    }
                }

                if (!longestMatchedTokenData) {
                    for (index = 0; (tokenData = lowPriorityTokenDatas[index]); index++) {
                        if (!longestMatchedTokenData || tokenData.token.text.length > longestMatchedTokenData.token.text.length) {
                            if (!tokenData.tokenSpec.requires.condition || tokenData.tokenSpec.requires.condition(state, tokenData.captures) !== false) {
                                longestMatchedTokenData = tokenData;
                            }
                        }
                    }
                }

                if (!longestMatchedTokenData) {
                    break;
                }

                token = longestMatchedTokenData.token;

                if (token.text.length === 0) {
                    throw new Exception('Tokenizer.parse() :: Matched a zero-length "' + token.name + '" token');
                }

                tokens.push(token);

                codePos += token.text.length;

                if (longestMatchedTokenData.tokenSpec.matchHandler) {
                    longestMatchedTokenData.tokenSpec.matchHandler(state, longestMatchedTokenData.captures);
                }
            }

            if (codePos < code.length) {
                throw new Exception('Tokenizer.parse() :: Unrecognized token "' + code.substr(codePos) + '..." at offset ' + codePos);
            }

            return tokens;
        }
    });

    return Tokenizer;
});
