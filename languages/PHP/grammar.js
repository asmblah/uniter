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
define([
    './grammar/ErrorHandler',
    './grammar/State'
], function (
    PHPErrorHandler,
    PHPGrammarState
) {
    'use strict';

    /*
     * Elimination of left-recursion: http://web.cs.wpi.edu/~kal/PLT/PLT4.1.2.html
     */

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

    return {
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
                captureAs: 'N_METHOD_CALL',
                components: [
                    {name: 'object', what: 'N_EXPRESSION_LEVEL_1_A'},
                    {optionally: {
                        name: 'calls',
                        oneOrMoreOf: [
                            'T_OBJECT_OPERATOR',
                            {name: 'func', oneOf: ['N_STRING', 'N_VARIABLE']},
                            (/\(/),
                            {name: 'args', zeroOrMoreOf: ['N_EXPRESSION', {what: (/(,|(?=\)))()/), captureIndex: 2}]},
                            (/\)/)
                        ]
                    }}
                ],
                ifNoMatch: {component: 'calls', capture: 'object'}
            },
            'N_EXPRESSION_LEVEL_1_C': {
                captureAs: 'N_FUNCTION_CALL',
                components: {oneOf: [
                    [
                        {name: 'func', oneOf: ['N_NAMESPACED_REFERENCE', 'N_EXPRESSION_LEVEL_1_B']},
                        [
                            (/\(/),
                            {name: 'args', zeroOrMoreOf: ['N_EXPRESSION', {what: (/(,|(?=\)))()/), captureIndex: 2}]},
                            (/\)/)
                        ]
                    ],
                    {name: 'next', what: 'N_EXPRESSION_LEVEL_1_B'}
                ]},
                ifNoMatch: {component: 'func', capture: 'next'}
            },
            'N_EXPRESSION_LEVEL_1_D': {
                captureAs: 'N_UNARY_EXPRESSION',
                components: [{name: 'operator', optionally: 'T_CLONE'}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_1_C'}],
                ifNoMatch: {component: 'operator', capture: 'operand'},
                options: {prefix: true}
            },
            // Array index and object property must have identical precedence: with LL grammar we have to repeat
            'N_EXPRESSION_LEVEL_2_A': {
                captureAs: 'N_ARRAY_INDEX',
                components: [{name: 'array', what: 'N_EXPRESSION_LEVEL_1_D'}, {oneOf: ['N_EMPTY_ARRAY_INDEX', {name: 'indices', zeroOrMoreOf: [(/\[/), {name: 'index', what: 'N_EXPRESSION'}, (/\]/)]}]}],
                ifNoMatch: {component: 'indices', capture: 'array'}
            },
            'N_EMPTY_ARRAY_INDEX': {
                captureAs: 'N_ARRAY_INDEX',
                components: {name: 'indices', what: [(/\[/), (/\]/)]},
                options: {indices: true}
            },
            'N_EXPRESSION_LEVEL_2_B': {
                captureAs: 'N_OBJECT_PROPERTY',
                components: [{name: 'object', what: 'N_EXPRESSION_LEVEL_2_A'}, {name: 'properties', zeroOrMoreOf: ['T_OBJECT_OPERATOR', {name: 'property', what: 'N_INSTANCE_MEMBER'}]}],
                ifNoMatch: {component: 'properties', capture: 'object'}
            },
            // Second occurrence of N_ARRAY_INDEX (see above)
            'N_EXPRESSION_LEVEL_2_C': {
                captureAs: 'N_ARRAY_INDEX',
                components: [{name: 'array', what: 'N_EXPRESSION_LEVEL_2_B'}, {oneOf: ['N_EMPTY_ARRAY_INDEX', {name: 'indices', zeroOrMoreOf: [(/\[/), {name: 'index', what: 'N_EXPRESSION'}, (/\]/)]}]}],
                ifNoMatch: {component: 'indices', capture: 'array'}
            },
            'N_EXPRESSION_LEVEL_2_D': {
                captureAs: 'N_CLASS_CONSTANT',
                components: {oneOf: [
                    [
                        {name: 'className', oneOf: ['N_NAMESPACED_REFERENCE', 'N_EXPRESSION_LEVEL_2_C']},
                        'T_DOUBLE_COLON',
                        {name: 'constant', what: ['T_STRING', (/(?!\()/)]}
                    ],
                    {name: 'next', what: 'N_EXPRESSION_LEVEL_2_C'}
                ]},
                ifNoMatch: {component: 'constant', capture: 'next'}
            },
            'N_CLASS_CONSTANT': 'N_EXPRESSION_LEVEL_2_D',
            'N_EXPRESSION_LEVEL_2_E': {
                captureAs: 'N_STATIC_METHOD_CALL',
                components: {oneOf: [
                    [
                        {name: 'className', oneOf: ['N_NAMESPACED_REFERENCE', 'N_EXPRESSION_LEVEL_2_D']},
                        'T_DOUBLE_COLON',
                        {name: 'method', oneOf: ['N_STRING', 'N_VARIABLE', 'N_VARIABLE_EXPRESSION']},
                        (/\(/),
                        {name: 'args', zeroOrMoreOf: ['N_EXPRESSION', {what: (/(,|(?=\)))()/), captureIndex: 2}]},
                        (/\)/)
                    ],
                    {name: 'next', what: 'N_EXPRESSION_LEVEL_2_D'}
                ]},
                ifNoMatch: {component: 'method', capture: 'next'}
            },
            'N_EXPRESSION_LEVEL_2_F': {
                captureAs: 'N_STATIC_PROPERTY',
                components: {oneOf: [
                    [
                        {name: 'className', oneOf: ['N_NAMESPACED_REFERENCE', 'N_EXPRESSION_LEVEL_2_E']},
                        'T_DOUBLE_COLON',
                        {name: 'property', what: 'N_STATIC_MEMBER'}
                    ],
                    {name: 'next', what: 'N_EXPRESSION_LEVEL_2_E'}
                ]},
                ifNoMatch: {component: 'property', capture: 'next'}
            },
            'N_EXPRESSION_LEVEL_3_A': {
                oneOf: ['N_UNARY_PREFIX_EXPRESSION', 'N_UNARY_SUFFIX_EXPRESSION', 'N_EXPRESSION_LEVEL_2_F']
            },
            'N_EXPRESSION_LEVEL_3_B': {
                oneOf: ['N_ARRAY_CAST', 'N_EXPRESSION_LEVEL_3_A']
            },
            'N_ARRAY_CAST': {
                components: ['T_ARRAY_CAST', {name: 'value', rule: 'N_EXPRESSION_LEVEL_3_A'}]
            },
            'N_UNARY_PREFIX_EXPRESSION': {
                captureAs: 'N_UNARY_EXPRESSION',
                components: [{name: 'operator', oneOf: ['T_INC', 'T_DEC', (/~/)]}, {name: 'operand', what: 'N_EXPRESSION_LEVEL_2_F'}],
                ifNoMatch: {component: 'operator', capture: 'operand'},
                options: {prefix: true}
            },
            'N_UNARY_SUFFIX_EXPRESSION': {
                captureAs: 'N_UNARY_EXPRESSION',
                components: [{name: 'operand', what: 'N_EXPRESSION_LEVEL_2_F'}, {name: 'operator', oneOf: ['T_INC', 'T_DEC']}],
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
    };
});
