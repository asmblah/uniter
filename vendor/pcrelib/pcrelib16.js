/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*jshint bitwise: false */
/*global define */
define([
    './pcrelib16.lib.js'
], function (
    pcrelib
) {
    'use strict';

    var PCRE_CASELESS = 1;
    var PCRE_MULTILINE = 2;
    var PCRE_DOTALL = 4;
    var PCRE_EXTENDED = 8;
    var PCRE_ANCHORED = 16;
    var PCRE_DOLLAR_ENDONLY = 32;
    var PCRE_EXTRA = 64;
    var PCRE_UNGREEDY = 512;
    var PCRE_UTF16 = 2048;
    var PCRE_NO_AUTO_CAPTURE = 4096;
    var PCRE_AUTO_CALLOUT = 16384;
    var PCRE_DUPNAMES = 524288;
    var PCRE_NO_START_OPTIMISE = 67108864;
    var PCRE_NOTEMPTY_ATSTART = 268435456;
    var PCRE_UCP = 536870912;
    var PCRE_INFO_CAPTURECOUNT = 2;
    var PCRE_INFO_NAMEENTRYSIZE = 7;
    var PCRE_INFO_NAMECOUNT = 8;
    var PCRE_INFO_NAMETABLE = 9;
    var PCRE_ERROR_NOMATCH = -1;
    var cached_pattern = {};

    function free_regex() {
        if (cached_pattern.name_table !== undefined) {
            pcrelib.free(cached_pattern.name_table);
        }

        if (cached_pattern.regex !== undefined) {
            pcrelib.free(cached_pattern.regex);
        }

        cached_pattern = {};
    }

    function preg_compile(pattern, options) {
        if (cached_pattern !== undefined) {
            if (cached_pattern.pattern === pattern && cached_pattern.options === options) {
                return cached_pattern;
            } else {
                free_regex();
            }
        }

        var option_bits = 0;
        var is_global = false;

        for (var i = 0; i < options.length; i++) {
            switch (options[i]) {
                case 'g':
                    is_global = true;
                    break;
                case 'i':
                    option_bits |= PCRE_CASELESS;
                    break;
                case 'm':
                    option_bits |= PCRE_MULTILINE;
                    break;
                case 's':
                    option_bits |= PCRE_DOTALL;
                    break;
                case 'x':
                    option_bits |= PCRE_EXTENDED;
                    break;
                case 'A':
                    option_bits |= PCRE_ANCHORED;
                    break;
                case 'C':
                    option_bits |= PCRE_AUTO_CALLOUT;
                    break;
                case 'D':
                case 'E':
                    option_bits |= PCRE_DOLLAR_ENDONLY;
                    break;
                case 'J':
                    option_bits |= PCRE_DUPNAMES;
                    break;
                case 'N':
                    option_bits |= PCRE_NO_AUTO_CAPTURE;
                    break;
                case 'S':
                    break;
                case 'U':
                    option_bits |= PCRE_UNGREEDY;
                    break;
                case 'X':
                    option_bits |= PCRE_EXTRA;
                    break;
                case 'Y':
                    option_bits |= PCRE_NO_START_OPTIMISE;
                    break;
                case 'u':
                    option_bits |= PCRE_UTF16 | PCRE_UCP;
                    break;
            }
        }

        cached_pattern.pattern = pattern;
        cached_pattern.options = options;
        cached_pattern.option_bits = option_bits;
        cached_pattern.is_global = is_global;

        var re = pcrelib.malloc((pattern.length * 2 + 1) * 2);
        pcrelib.stringToUTF16(pattern, re);
        var err = pcrelib.malloc(4);
        var err_offset = pcrelib.malloc(4);
        var regex = pcrelib.pcre_compile(re, option_bits, err, err_offset, null);

        if (!regex) {
            free_regex();
            throw new Error(pcrelib.Pointer_stringify(pcrelib.HEAP32[err >> 2]) + ' - offset: ' + pcrelib.HEAP32[err_offset >> 2]);
        }

        var named_subpattern_count = pcrelib.malloc(4);
        pcrelib.pcre_fullinfo(regex, null, PCRE_INFO_NAMECOUNT, named_subpattern_count);
        cached_pattern.named_subpats = pcrelib.HEAP32[named_subpattern_count >> 2];
        pcrelib.free(named_subpattern_count);
        var name_table = pcrelib.malloc(4);
        pcrelib.pcre_fullinfo(regex, null, PCRE_INFO_NAMETABLE, name_table);
        cached_pattern.name_table = name_table;
        var name_size = pcrelib.malloc(4);
        pcrelib.pcre_fullinfo(regex, null, PCRE_INFO_NAMEENTRYSIZE, name_size);
        cached_pattern.name_entry_size = pcrelib.HEAP32[name_size >> 2];
        pcrelib.free(name_size);
        var num_subpats = pcrelib.malloc(4);
        pcrelib.pcre_fullinfo(regex, null, PCRE_INFO_CAPTURECOUNT, num_subpats);
        cached_pattern.subpats = pcrelib.HEAP32[num_subpats >> 2];
        cached_pattern.ovector_len = (pcrelib.HEAP32[num_subpats >> 2] + 1) * 3;
        pcrelib.free(num_subpats);

        cached_pattern.regex = regex;
        pcrelib.free(re);
        pcrelib.free(err);
        pcrelib.free(err_offset);

        return cached_pattern;
    }

    function preg_match(subject) {
        if (!cached_pattern.regex) {
            throw new Error('No pattern supplied to matching function!');
        }

        var len = subject.length,
            str = pcrelib.malloc((subject.length * 2 + 1) * 2),
            matches,
            named_subpats = cached_pattern.named_subpats,
            name_table = cached_pattern.name_table,
            name_entry_size = cached_pattern.name_entry_size,
            ovector_len = cached_pattern.ovector_len,
            ovector = pcrelib.malloc(4 * ovector_len),
            ovector_ptr = ovector >> 2,
            offset = 0,
            internal_options = 0,
            result = [],
            result_num = 0,
            rc,
            sub = [];

        pcrelib.stringToUTF16(subject, str);

        do {
            rc = pcrelib.pcre_exec(cached_pattern.regex, 0, str, len, offset, internal_options, ovector, ovector_len);

            if (rc >= 0) {
                if (rc === 0) {
                    rc = ovector_len / 3;
                }

                matches = [];

                for (var i = 0; i < rc * 2; i += 2) {
                    var start = pcrelib.HEAP32[ovector_ptr + i], end = pcrelib.HEAP32[ovector_ptr + (i + 1)];

                    matches.push({
                        start: start,
                        end: end,
                        content: subject.substring(start, end),
                        subpats: cached_pattern.subpats
                    });

                    if (named_subpats > 0) {
                        var tabptr = pcrelib.HEAP32[name_table >> 2];

                        for (var k = 0; k < named_subpats; k++) {
                            var n = pcrelib.HEAP8[tabptr];

                            if (typeof matches[n] !== 'undefined') {
                                matches[n].name = pcrelib.UTF16ToString(tabptr + 2);
                            }

                            tabptr += name_entry_size * 2;
                        }
                    }
                }

                result[result_num++] = matches;
            } else if (rc === PCRE_ERROR_NOMATCH) {
                if (internal_options !== 0 && offset < len) {
                    pcrelib.HEAP32[ovector_ptr] = offset;
                    pcrelib.HEAP32[ovector_ptr + 1] = offset + 1;

                    if (offset < len - 1 && subject.charAt(offset) === '\r' && subject.charAt(offset + 1) === '\n') {
                        pcrelib.HEAP32[ovector_ptr + 1] += 1;
                    }
                } else {
                    break;
                }
            } else {
                break;
            }

            internal_options = pcrelib.HEAP32[ovector_ptr + 1] === pcrelib.HEAP32[ovector_ptr] ? PCRE_NOTEMPTY_ATSTART | PCRE_ANCHORED : 0;
            offset = pcrelib.HEAP32[ovector_ptr + 1];
        } while (cached_pattern.is_global);

        pcrelib.free(str);
        pcrelib.free(ovector);

        return {
            result: result,
            sub: sub
        };
    }

    return {
        preg_compile: preg_compile,
        preg_match: preg_match
    };
});
