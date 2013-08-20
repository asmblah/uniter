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
    '../../tools',
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    describe('PHP Tokenizer small program integration', function () {
        var tokenizer;

        beforeEach(function () {
            tokenizer = tools.createTokenizer();
        });

        describe('execute()', function () {
            util.each([
                {
                    code: '',
                    expectedTokens: []
                }, {
                    code: '<a>42</a><b />',
                    expectedTokens: [
                        {name: 'T_INLINE_HTML', offset: 0, text: '<a>42</a><b />'}
                    ]
                }, {
                    code: '<?php',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php'}
                    ]
                }, {
                    code: '<?php return 0;',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_LNUMBER', offset: 13, text: '0'},
                        {name: 'T_CHARACTER', offset: 14, text: ';'}
                    ]
                }, {
                    code: '<?php return 7;',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_LNUMBER', offset: 13, text: '7'},
                        {name: 'T_CHARACTER', offset: 14, text: ';'}
                    ]
                }, {
                    code: '<?php return "world";',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 13, text: '"world"'},
                        {name: 'T_CHARACTER', offset: 20, text: ';'}
                    ]
                }, {
                    // Ensure valid "... $var ..." interpolation is respected
                    code: '<?php return "wor$ld";',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '"'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 14, text: 'wor'},
                        {name: 'T_VARIABLE', offset: 17, text: '$ld'},
                        {name: 'T_CHARACTER', offset: 20, text: '"'},
                        {name: 'T_CHARACTER', offset: 21, text: ';'}
                    ]
                }, {
                    // Ensure valid "... ${var} ..." interpolation is respected
                    code: '<?php return "wor${ld}ed";',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '"'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 14, text: 'wor'},
                        {name: 'T_DOLLAR_OPEN_CURLY_BRACES', offset: 17, text: '${'},
                        {name: 'T_STRING_VARNAME', offset: 19, text: 'ld'},
                        {name: 'T_CHARACTER', offset: 21, text: '}'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 22, text: 'ed'},
                        {name: 'T_CHARACTER', offset: 24, text: '"'},
                        {name: 'T_CHARACTER', offset: 25, text: ';'}
                    ]
                }, {
                    // Ensure valid "... {$var} ..." interpolation is respected
                    code: '<?php return "wor{$ld}ed";',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '"'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 14, text: 'wor'},
                        {name: 'T_CURLY_OPEN', offset: 17, text: '{'},
                        {name: 'T_VARIABLE', offset: 18, text: '$ld'},
                        {name: 'T_CHARACTER', offset: 21, text: '}'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 22, text: 'ed'},
                        {name: 'T_CHARACTER', offset: 24, text: '"'},
                        {name: 'T_CHARACTER', offset: 25, text: ';'}
                    ]
                }, {
                    // Ensure valid interpolations "$var[name]" "$var[0]", "{$var[1]}" and "{var[2]}" are supported
                    code: '<?php return "$data[type] $data[0] of {$data[1]}. ${data[2]}.";',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '"'},
                        {name: 'T_VARIABLE', offset: 14, text: '$data'},
                        {name: 'T_CHARACTER', offset: 19, text: '['},
                        {name: 'T_STRING', offset: 20, text: 'type'},
                        {name: 'T_CHARACTER', offset: 24, text: ']'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 25, text: ' '},
                        {name: 'T_VARIABLE', offset: 26, text: '$data'},
                        {name: 'T_CHARACTER', offset: 31, text: '['},
                        {name: 'T_NUM_STRING', offset: 32, text: '0'},
                        {name: 'T_CHARACTER', offset: 33, text: ']'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 34, text: ' of '},
                        {name: 'T_CURLY_OPEN', offset: 38, text: '{'},
                        {name: 'T_VARIABLE', offset: 39, text: '$data'},
                        {name: 'T_CHARACTER', offset: 44, text: '['},
                        {name: 'T_LNUMBER', offset: 45, text: '1'},
                        {name: 'T_CHARACTER', offset: 46, text: ']'},
                        {name: 'T_CHARACTER', offset: 47, text: '}'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 48, text: '. '},
                        {name: 'T_DOLLAR_OPEN_CURLY_BRACES', offset: 50, text: '${'},
                        {name: 'T_STRING_VARNAME', offset: 52, text: 'data'},
                        {name: 'T_CHARACTER', offset: 56, text: '['},
                        {name: 'T_LNUMBER', offset: 57, text: '2'},
                        {name: 'T_CHARACTER', offset: 58, text: ']'},
                        {name: 'T_CHARACTER', offset: 59, text: '}'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 60, text: '.'},
                        {name: 'T_CHARACTER', offset: 61, text: '"'},
                        {name: 'T_CHARACTER', offset: 62, text: ';'}
                    ]
                }, {
                    // Ensure interpolated variables can be touching
                    code: '<?php return "${salutation}$name{$punctuation}\\n";',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '"'},
                        {name: 'T_DOLLAR_OPEN_CURLY_BRACES', offset: 14, text: '${'},
                        {name: 'T_STRING_VARNAME', offset: 16, text: 'salutation'},
                        {name: 'T_CHARACTER', offset: 26, text: '}'},
                        {name: 'T_VARIABLE', offset: 27, text: '$name'},
                        {name: 'T_CURLY_OPEN', offset: 32, text: '{'},
                        {name: 'T_VARIABLE', offset: 33, text: '$punctuation'},
                        {name: 'T_CHARACTER', offset: 45, text: '}'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 46, text: '\\n'},
                        {name: 'T_CHARACTER', offset: 48, text: '"'},
                        {name: 'T_CHARACTER', offset: 49, text: ';'}
                    ]
                }, {
                    // Ensure that invalid "... $ ..." interpolation is ignored
                    code: '<?php return "world$";',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 13, text: '"world$"'},
                        {name: 'T_CHARACTER', offset: 21, text: ';'}
                    ]
                }, {
                    // Ensure that invalid "... ${ ..." interpolation is ignored
                    code: '<?php return "world${hi";',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_RETURN', offset: 6, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '"'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 14, text: 'world'},
                        {name: 'T_DOLLAR_OPEN_CURLY_BRACES', offset: 19, text: '${'},
                        {name: 'T_STRING_VARNAME', offset: 21, text: 'hi'},
                        {name: 'T_CHARACTER', offset: 23, text: '"'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 24, text: ';'}
                    ]
                }, {
                    // T_BAD_CHARACTER will match anything below ASCII 32 except \t (0x09), \n (0x0a) and \r (0x0d)
                    code: '<?php \u0000\u0001\u0002\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG',      offset: 0, text: '<?php '},
                        {name: 'T_BAD_CHARACTER', offset: 6, text: '\u0000'},
                        {name: 'T_BAD_CHARACTER', offset: 7, text: '\u0001'},
                        {name: 'T_BAD_CHARACTER', offset: 8, text: '\u0002'},
                        {name: 'T_BAD_CHARACTER', offset: 9, text: '\u0008'},
                        {name: 'T_WHITESPACE',    offset: 10, text: '\u0009\u000A'},
                        {name: 'T_BAD_CHARACTER', offset: 12, text: '\u000B'},
                        {name: 'T_BAD_CHARACTER', offset: 13, text: '\u000C'},
                        {name: 'T_WHITESPACE',    offset: 14, text: '\u000D'},
                        {name: 'T_BAD_CHARACTER', offset: 15, text: '\u000E'},
                        {name: 'T_BAD_CHARACTER', offset: 16, text: '\u000F'}
                    ]
                }, {
                    code: '<?php class Test { const USEFULNESS = 0.1; }',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_CLASS', offset: 6, text: 'class'},
                        {name: 'T_WHITESPACE', offset: 11, text: ' '},
                        {name: 'T_STRING', offset: 12, text: 'Test'},
                        {name: 'T_WHITESPACE', offset: 16, text: ' '},
                        {name: 'T_CHARACTER', offset: 17, text: '{'},
                        {name: 'T_WHITESPACE', offset: 18, text: ' '},
                        {name: 'T_CONST', offset: 19, text: 'const'},
                        {name: 'T_WHITESPACE', offset: 24, text: ' '},
                        {name: 'T_STRING', offset: 25, text: 'USEFULNESS'},
                        {name: 'T_WHITESPACE', offset: 35, text: ' '},
                        {name: 'T_CHARACTER', offset: 36, text: '='},
                        {name: 'T_WHITESPACE', offset: 37, text: ' '},
                        {name: 'T_DNUMBER', offset: 38, text: '0.1'},
                        {name: 'T_CHARACTER', offset: 41, text: ';'},
                        {name: 'T_WHITESPACE', offset: 42, text: ' '},
                        {name: 'T_CHARACTER', offset: 43, text: '}'}
                    ]
                }, {
                    // Legacy Heredoc syntax with trailing semicolon on same line as end token
                    code: '<?php $usage = <<<EOS\nUsage: ...\nEOS;',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_VARIABLE', offset: 6, text: '$usage'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '='},
                        {name: 'T_WHITESPACE', offset: 14, text: ' '},
                        {name: 'T_START_HEREDOC', offset: 15, text: '<<<EOS\n'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 22, text: 'Usage: ...\n'},
                        {name: 'T_END_HEREDOC', offset: 33, text: 'EOS'},
                        {name: 'T_CHARACTER', offset: 36, text: ';'}
                    ]
                }, {
                    // Legacy Heredoc syntax with trailing semicolon on line after end token
                    code: '<?php $usage = <<<EOS\nUsage: ...\nEOS\n;',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_VARIABLE', offset: 6, text: '$usage'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '='},
                        {name: 'T_WHITESPACE', offset: 14, text: ' '},
                        {name: 'T_START_HEREDOC', offset: 15, text: '<<<EOS\n'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 22, text: 'Usage: ...\n'},
                        {name: 'T_END_HEREDOC', offset: 33, text: 'EOS'},
                        {name: 'T_WHITESPACE', offset: 36, text: '\n'},
                        {name: 'T_CHARACTER', offset: 37, text: ';'}
                    ]
                }, {
                    // Newer Heredoc syntax with no interpolated variable references
                    code: '<?php $usage = <<<"EOS"\nUsage: ...\nEOS;',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_VARIABLE', offset: 6, text: '$usage'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '='},
                        {name: 'T_WHITESPACE', offset: 14, text: ' '},
                        {name: 'T_START_HEREDOC', offset: 15, text: '<<<"EOS"\n'},
                        {name: 'T_ENCAPSED_AND_WHITESPACE', offset: 24, text: 'Usage: ...\n'},
                        {name: 'T_END_HEREDOC', offset: 35, text: 'EOS'},
                        {name: 'T_CHARACTER', offset: 38, text: ';'}
                    ]
                }, {
                    // Nowdoc syntax with no (ignored) interpolated variable references
                    code: '<?php $usage = <<<\'EOS\'\nUsage: ...\nEOS;',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_VARIABLE', offset: 6, text: '$usage'},
                        {name: 'T_WHITESPACE', offset: 12, text: ' '},
                        {name: 'T_CHARACTER', offset: 13, text: '='},
                        {name: 'T_WHITESPACE', offset: 14, text: ' '},
                        {name: 'T_START_HEREDOC', offset: 15, text: '<<<\'EOS\'\n'},
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 24, text: 'Usage: ...\n'},
                        {name: 'T_END_HEREDOC', offset: 35, text: 'EOS'},
                        {name: 'T_CHARACTER', offset: 38, text: ';'}
                    ]
                }, {
                    // Halt with parentheses and semicolon
                    code: '<?php print "ok"; __halt_compiler(); Some installation data',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_PRINT', offset: 6, text: 'print'},
                        {name: 'T_WHITESPACE', offset: 11, text: ' '},
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 12, text: '"ok"'},
                        {name: 'T_CHARACTER', offset: 16, text: ';'},
                        {name: 'T_WHITESPACE', offset: 17, text: ' '},
                        {name: 'T_HALT_COMPILER', offset: 18, text: '__halt_compiler'}
                    ]
                }, {
                    // Halt with parentheses but without semicolon
                    code: '<?php print "ok"; __halt_compiler() Some installation data',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_PRINT', offset: 6, text: 'print'},
                        {name: 'T_WHITESPACE', offset: 11, text: ' '},
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 12, text: '"ok"'},
                        {name: 'T_CHARACTER', offset: 16, text: ';'},
                        {name: 'T_WHITESPACE', offset: 17, text: ' '},
                        {name: 'T_HALT_COMPILER', offset: 18, text: '__halt_compiler'}
                    ]
                }, {
                    // Halt with neither parentheses nor semicolon, just whitespace
                    code: '<?php print "ok"; __halt_compiler Some installation data',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_PRINT', offset: 6, text: 'print'},
                        {name: 'T_WHITESPACE', offset: 11, text: ' '},
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 12, text: '"ok"'},
                        {name: 'T_CHARACTER', offset: 16, text: ';'},
                        {name: 'T_WHITESPACE', offset: 17, text: ' '},
                        {name: 'T_HALT_COMPILER', offset: 18, text: '__halt_compiler'}
                    ]
                }, {
                    // Halt with no parentheses or whitespace, just semicolon
                    code: '<?php print "ok"; __halt_compiler;Some installation data',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_PRINT', offset: 6, text: 'print'},
                        {name: 'T_WHITESPACE', offset: 11, text: ' '},
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 12, text: '"ok"'},
                        {name: 'T_CHARACTER', offset: 16, text: ';'},
                        {name: 'T_WHITESPACE', offset: 17, text: ' '},
                        {name: 'T_HALT_COMPILER', offset: 18, text: '__halt_compiler'}
                    ]
                }, {
                    // Invalid: __halt_compiler must be standalone
                    code: '<?php print "ok"; __halt_compilerSome installation data',
                    expectedTokens: [
                        {name: 'T_OPEN_TAG', offset: 0, text: '<?php '},
                        {name: 'T_PRINT', offset: 6, text: 'print'},
                        {name: 'T_WHITESPACE', offset: 11, text: ' '},
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 12, text: '"ok"'},
                        {name: 'T_CHARACTER', offset: 16, text: ';'},
                        {name: 'T_WHITESPACE', offset: 17, text: ' '},
                        {name: 'T_STRING', offset: 18, text: '__halt_compilerSome'},
                        {name: 'T_WHITESPACE', offset: 37, text: ' '},
                        {name: 'T_STRING', offset: 38, text: 'installation'},
                        {name: 'T_WHITESPACE', offset: 50, text: ' '},
                        {name: 'T_STRING', offset: 51, text: 'data'}
                    ]
                }
            ], function (scenario) {
                // Pretty-print the code strings so any non-printable characters are readable
                describe('when the code is ' + JSON.stringify(scenario.code), function () {
                    it('should return the expected tokens', function () {
                        expect(tokenizer.parse(scenario.code)).to.deep.equal(scenario.expectedTokens);
                    });
                });
            });
        });
    });
});
