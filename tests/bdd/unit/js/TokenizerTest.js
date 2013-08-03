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
    'js/Tokenizer'
], function (
    util,
    Tokenizer
) {
    'use strict';

    describe('Tokenizer', function () {
        var tokenSpecs,
            tokenizer;

        describe('parse()', function () {
            beforeEach(function () {
                tokenSpecs = [{
                    tokens: {
                        'NOTHING': /(?!)/,
                        'ONE_CAP_GROUP': /(a)b/,
                        'TWO_CAP_GROUPS': /c(d)(e)/
                    }
                },
                {
                    tokens: {
                        'T_ARRAY_LITERAL_OPEN': /\[/,
                        'T_CHARACTER': /[\[\]\(\)\{\};]/,
                        'T_FUNCTION': /function/,
                        'T_RETURN': /return/,
                        'T_CONSTANT_ENCAPSED_STRING': /(['"])((?:[^\1]|\\\1)*)\1/,
                        'T_WHITESPACE': /\s+/
                    }
                }];
            });

            util.each([
                {
                    tokenSpec: 0,
                    code: 'ab',
                    expectedTokens: [
                        {name: 'ONE_CAP_GROUP', offset: 0, text: 'ab'}
                    ]
                }, {
                    tokenSpec: 0,
                    code: 'cde',
                    expectedTokens: [
                        {name: 'TWO_CAP_GROUPS', offset: 0, text: 'cde'}
                    ]
                }, {
                    tokenSpec: 1,
                    code: '"hello" \'world\'',
                    expectedTokens: [
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 0, text: '"hello"'},
                        {name: 'T_WHITESPACE', offset: 7, text: ' '},
                        {name: 'T_CONSTANT_ENCAPSED_STRING', offset: 8, text: '\'world\''}
                    ]
                }, {
                    tokenSpec: 1,
                    code: 'return [function () {}];',
                    expectedTokens: [
                        {name: 'T_RETURN', offset: 0, text: 'return'},
                        {name: 'T_WHITESPACE', offset: 6, text: ' '},
                        {name: 'T_ARRAY_LITERAL_OPEN', offset: 7, text: '['},
                        {name: 'T_FUNCTION', offset: 8, text: 'function'},
                        {name: 'T_WHITESPACE', offset: 16, text: ' '},
                        {name: 'T_CHARACTER', offset: 17, text: '('},
                        {name: 'T_CHARACTER', offset: 18, text: ')'},
                        {name: 'T_WHITESPACE', offset: 19, text: ' '},
                        {name: 'T_CHARACTER', offset: 20, text: '{'},
                        {name: 'T_CHARACTER', offset: 21, text: '}'},
                        {name: 'T_CHARACTER', offset: 22, text: ']'},
                        {name: 'T_CHARACTER', offset: 23, text: ';'}
                    ]
                }
            ], function (scenario) {
                describe('when using token spec #' + scenario.tokenSpec + ' and the code is "' + scenario.code + '"', function () {
                    beforeEach(function () {
                        tokenizer = new Tokenizer(tokenSpecs[scenario.tokenSpec]);
                    });

                    it('should return the expected tokens', function () {
                        expect(tokenizer.parse(scenario.code)).to.deep.equal(scenario.expectedTokens);
                    });
                });
            });
        });
    });
});
