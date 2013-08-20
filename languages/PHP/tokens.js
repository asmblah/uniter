/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*
 * PHP Tokens
 */

/*global define */
define(function () {
    'use strict';

    var HEREDOC = '1',
        HTML = '2',
        NOWDOC = '3',
        PHP = '4',
        STRING = '5',
        STRING_ARRAY_VARIABLE = '6',
        STRING_FREE_VARIABLE = '7',
        STRING_WRAPPED_VARIABLE = '8';

    return {
        options: {
            initialMode: HTML,
            defaults: {
                requires: {
                    mode: PHP
                }
            }
        },
        tokens: {
            'T_ABSTRACT': /abstract/i,
            'T_AND_EQUAL': /&=/i,
            'T_ARRAY': /array/i,
            'T_ARRAY_CAST': /\(\s*array\s*\)/i,
            'T_AS': /as/i,

            // Anything below ASCII 32 except \t (0x09), \n (0x0a) and \r (0x0d)
            'T_BAD_CHARACTER': /(?![\u0009\u000A\u000D])[\u0000-\u001F]/,

            'T_BOOLEAN_AND': /&&/i,
            'T_BOOLEAN_OR': /\|\|/,
            'T_BOOL_CAST': /\(\s*bool(ean)?\s*\)/i,
            'T_BREAK': /break/i,
            'T_CALLABLE': /callable/i,
            'T_CASE': /case/i,
            'T_CATCH': /catch/i,

            'T_CHARACTER': {
                matchHandler: function (state, match) {
                    var map = {};

                    if (match[0] === '"') {
                        // Quotation mark toggles between PHP and string mode

                        map[PHP] = STRING;
                        map[STRING] = PHP;
                        map[STRING_FREE_VARIABLE] = PHP;
                        // Invalid, but this is the expected behaviour
                        map[STRING_WRAPPED_VARIABLE] = STRING;
                        if (!map[state.getMode()]) {
                            debugger;
                        }
                        state.setMode(map[state.getMode()]);
                    } else if (match[0] === '}' && state.getMode() === STRING_WRAPPED_VARIABLE) {
                        // Brace escapes from wrapped variable mode
                        state.setMode(STRING);
                    } else if (match[0] === ']' && state.getMode() === STRING_ARRAY_VARIABLE) {
                        // Bracket escapes from array variable mode
                        state.setMode(STRING_FREE_VARIABLE);
                    } else if (match[0] === '[' && state.getMode() === STRING_FREE_VARIABLE) {
                        state.setMode(STRING_ARRAY_VARIABLE);
                    }
                },
                pattern: /[\(\)\[\]\{\}<>:;=,.@^&|%"'*\/+-](?=([\s\S]?))/,
                requires: {
                    condition: function (state, match) {
                        // Don't match if it should be a T_CURLY_OPEN
                        if (match[0] === '{' && (state.getMode() === STRING || state.getMode() === STRING_FREE_VARIABLE) && match[1] === '$') {
                            return false;
                        }
                        // Only match certain special characters in strings
                        if (state.getMode() === STRING && !/[\[\]"]/.test(match[0])) {
                            return false;
                        }
                    },
                    mode: [PHP, STRING, STRING_ARRAY_VARIABLE, STRING_FREE_VARIABLE, STRING_WRAPPED_VARIABLE]
                }
            },

            'T_CLASS': /class/i,
            'T_CLASS_C': /__CLASS__/i,
            'T_CLONE': /clone/i,
            'T_CLOSE_TAG': {
                matchHandler: function (state) {
                    state.setMode(HTML);
                },
                pattern: /[?%]>\n?/,
                requires: {
                    mode: PHP
                }
            },
            'T_COMMENT': /(?:\/\/|#)(.*?)[\r\n]+|\/\*(?!\*)([\s\S]*?)\*\//,
            'T_CONCAT_EQUAL': /\.=/,
            'T_CONST': /const/i,
            'T_CONSTANT_ENCAPSED_STRING': {
                matchHandler: function (state) {
                    if (state.getMode() === NOWDOC) {
                        state.setMode(PHP);
                    }
                },
                pattern: /(['"])((?:(?!\$\{?[\$a-z0-9_]+)(?:(?!\1)[\s\S]|\\\1))*)\1/,
                requires: {
                    mode: [PHP, NOWDOC]
                }
            },
            'T_CONTINUE': /continue/i,
            'T_CURLY_OPEN': {
                matchHandler: function (state) {
                    state.setMode(STRING_WRAPPED_VARIABLE);
                },
                pattern: /\{(?=\$)/,
                requires: {
                    mode: [STRING, STRING_FREE_VARIABLE]
                }
            },
            'T_DEC': /--/i,
            'T_DECLARE': /declare/i,
            'T_DEFAULT': /default/i,
            'T_DIR': /__DIR__/i,
            'T_DIV_EQUAL': '/=',

            // See http://www.php.net/manual/en/language.types.float.php
            'T_DNUMBER': /\d+\.\d+|\d\.\d+e\d+|\d+e[+-]\d+/i,

            'T_DOC_COMMENT': /\/\*\*([\s\S]*?)\*\//,
            'T_DO': /do/i,
            'T_DOLLAR_OPEN_CURLY_BRACES': {
                matchHandler: function (state) {
                    state.setMode(STRING_WRAPPED_VARIABLE);
                },
                pattern: /\$\{/,
                requires: {
                    mode: STRING
                }
            },
            'T_DOUBLE_ARROW': '=>',
            'T_DOUBLE_CAST': /\((real|double|float)\)/i,

            // Also defined as T_PAAMAYIM_NEKUDOTAYIM
            'T_DOUBLE_COLON': /::/i,

            'T_ECHO': /echo/i,
            'T_ELSE': /else/i,
            'T_ELSEIF': /elseif/i,
            'T_EMPTY': /empty/i,
            'T_ENCAPSED_AND_WHITESPACE': {
                matchHandler: function (state) {
                    if (state.getMode() === STRING_FREE_VARIABLE) {
                        state.setMode(STRING);
                    }
                },
                pattern: /(?:[^"\${]|\\["\${])+/,
                requires: {
                    condition: function (state, match) {
                        if (
                            // Don't match an array index in a string
                            (match[0].charAt(0) === '[' && state.getLastToken().name === 'T_VARIABLE') ||
                            (state.getLastToken().text === '[')
                        ) {
                            return false;
                        }
                    },
                    mode: [STRING, STRING_FREE_VARIABLE, HEREDOC]
                }
            },
            'T_ENDDECLARE': /enddeclare/i,
            'T_ENDFOR': /endfor/i,
            'T_ENDFOREACH': /endforeach/i,
            'T_ENDIF': /endif/i,
            'T_ENDSWITCH': /endswitch/i,
            'T_ENDWHILE': /endwhile/i,

            // Token gets defined as a pushed token after a Heredoc is found
            'T_END_HEREDOC': /(?!)/,

            'T_EVAL': /eval/i,
            'T_EXIT': /exit|die/i,
            'T_EXTENDS': /extends/i,
            'T_FILE': /__FILE__/i,
            'T_FINAL': /final/i,
            'T_FINALLY': /finally/i,
            'T_FOR': /for/i,
            'T_FOREACH': /foreach/i,
            'T_FUNCTION': /function/i,
            'T_FUNC_C': /__FUNCTION__/i,
            'T_GLOBAL': /global/i,
            'T_GOTO': /goto/i,
            'T_HALT_COMPILER': {
                matchHandler: function (state) {
                    state.halt();
                },
                pattern: /__halt_compiler(?=\(\)|\s|;)/
            },
            'T_IF': /if/i,
            'T_IMPLEMENTS': /implements/i,
            'T_INC': '++',
            'T_INCLUDE': /include/i,
            'T_INCLUDE_ONCE': /include_once/i,
            'T_INLINE_HTML': {
                pattern: /(?:[^<]|<[^?%]|<\?(?!php)[\s\S]{3})+/,
                requires: {
                    mode: HTML
                }
            },
            'T_INSTANCEOF': /instanceof/i,
            'T_INSTEADOF': /insteadof/i,
            'T_INT_CAST': /\(\s*int(eger)?\s*\)/i,
            'T_INTERFACE': /interface/i,
            'T_ISSET': /isset/i,
            'T_IS_EQUAL': /==/i,
            'T_IS_GREATER_OR_EQUAL': '>=',
            'T_IS_IDENTICAL': /===/i,
            'T_IS_NOT_EQUAL': /!=|<>/,
            'T_IS_NOT_IDENTICAL': '!==',
            'T_IS_SMALLER_OR_EQUAL': '<=',
            'T_LINE': /__LINE__/i,
            'T_LIST': /list/i,
            'T_LNUMBER': {
                pattern: /\d+|0x[0-9a-f]/i,
                requires: {
                    mode: [PHP, STRING_WRAPPED_VARIABLE]
                }
            },
            'T_LOGICAL_AND': /and/i,
            'T_LOGICAL_OR': /or/i,
            'T_LOGICAL_XOR': /xor/i,
            'T_METHOD_C': /__METHOD__/i,
            'T_MINUS_EQUAL': /-=/i,

            // Not used anymore (PHP 4 only)
            'T_ML_COMMENT': /(?!)/,

            'T_MOD_EQUAL': /%=/i,
            'T_MUL_EQUAL': '*=',
            'T_NAMESPACE': /namespace/i,
            'T_NS_C': /__NAMESPACE__/i,
            'T_NS_SEPARATOR': '\\',
            'T_NEW': /new/i,
            'T_NUM_STRING': {
                pattern: /\d+/,
                requires: {
                    mode: STRING_ARRAY_VARIABLE
                }
            },
            'T_OBJECT_CAST': /\(\s*object\s*\)/i,
            'T_OBJECT_OPERATOR': '->',

            // Not used anymore (PHP 4 only)
            'T_OLD_FUNCTION': /old_function/i,

            'T_OPEN_TAG': {
                matchHandler: function (state) {
                    state.setMode(PHP);
                },
                pattern: /(?:<\?(php)?|<%)\s?(?!=)/,
                requires: {
                    mode: HTML
                }
            },

            'T_OPEN_TAG_WITH_ECHO': {
                matchHandler: function (state) {
                    state.setMode(PHP);
                },
                pattern: /<[?%]=/,
                requires: {
                    mode: HTML
                }
            },
            'T_OR_EQUAL': '|=',

            // Also defined as T_DOUBLE_COLON
            'T_PAAMAYIM_NEKUDOTAYIM': /::/i,

            'T_PLUS_EQUAL': '+=',
            'T_PRINT': /print/i,
            'T_PRIVATE': /private/i,
            'T_PUBLIC': /public/i,
            'T_PROTECTED': /protected/i,
            'T_REQUIRE': /require/i,
            'T_REQUIRE_ONCE': /require_once/i,
            'T_RETURN': /return/i,
            'T_SL': '<<',
            'T_SL_EQUAL': '<<=',
            'T_SR': '>>',
            'T_SR_EQUAL': '>>=',
            'T_START_HEREDOC': {
                matchHandler: function (state, match) {
                    var identifier = match[2],
                        isHeredoc = match[1] !== '\'',
                        escapedIdentifier = state.regexEscape(identifier);

                    state.setMode(isHeredoc ? HEREDOC : NOWDOC);

                    if (isHeredoc) {
                        state.pushTokenSpec('T_ENCAPSED_AND_WHITESPACE', {
                            pattern: new RegExp('^[\\s\\S]*?[\\r\\n]+(?=' + escapedIdentifier + ')')
                        });
                        state.pushTokenSpec('T_END_HEREDOC', {
                            matchHandler: function () {
                                state.popTokenSpec('T_ENCAPSED_AND_WHITESPACE');
                                state.popTokenSpec('T_END_HEREDOC');

                                state.setMode(PHP);
                            },
                            pattern: new RegExp(escapedIdentifier)
                        });
                    } else {
                        state.pushTokenSpec('T_CONSTANT_ENCAPSED_STRING', {
                            pattern: new RegExp('^[\\s\\S]*?[\\r\\n]+(?=' + escapedIdentifier + ')')
                        });
                        state.pushTokenSpec('T_END_HEREDOC', {
                            matchHandler: function () {
                                state.popTokenSpec('T_CONSTANT_ENCAPSED_STRING');
                                state.popTokenSpec('T_END_HEREDOC');

                                state.setMode(PHP);
                            },
                            pattern: new RegExp(escapedIdentifier)
                        });
                    }
                },
                pattern: /<<<(["']?)([\$a-z0-9_]+)\1\n?/
            },
            'T_STATIC': /static/i,
            'T_STRING': {
                lowPriority: true,
                pattern: /(?![\$0-9])[\$a-z0-9_]+/i,
                requires: {
                    mode: [PHP, STRING_ARRAY_VARIABLE]
                }
            },
            'T_STRING_CAST': /\(\s*string\s*\)/i,
            'T_STRING_VARNAME': {
                pattern: /(?![\$0-9])[\$a-z0-9_]+/,
                requires: {
                    mode: STRING_WRAPPED_VARIABLE
                }
            },
            'T_SWITCH': /switch/i,
            'T_THROW': /throw/i,
            'T_TRAIT': /trait/i,
            'T_TRAIT_C': /__TRAIT__/i,
            'T_TRY': /try/i,
            'T_UNSET': /unset/i,
            'T_UNSET_CAST': /\(\s*unset\s*\)/i,
            'T_USE': /use/i,
            'T_VAR': /var/i,
            'T_VARIABLE': {
                matchHandler: function (state) {
                    if (state.getMode() === STRING) {
                        state.setMode(STRING_FREE_VARIABLE);
                    }
                },
                pattern: /\$[\$a-z0-9_]+/,
                requires: {
                    mode: [PHP, STRING, STRING_WRAPPED_VARIABLE]
                }
            },
            'T_WHILE': /while/i,
            'T_WHITESPACE': /[\r\n\t ]+/,
            'T_XOR_EQUAL': /\^=/i,
            'T_YIELD': /yield/i
        }
    };
});
