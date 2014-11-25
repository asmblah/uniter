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
    'pcrelib',
    'js/util',
    'languages/PHP/interpreter/KeyValuePair',
    'languages/PHP/interpreter/Error',
    'languages/PHP/interpreter/Variable'
], function (
    pcrelib,
    util,
    KeyValuePair,
    PHPError,
    Variable
) {
    'use strict';

    return function (internals) {
        var valueFactory = internals.valueFactory;

        return {
            'preg_match': function (patternReference, subjectReference, matchesReference) {
                var parts,
                    patternValue = (patternReference instanceof Variable) ?
                        patternReference.getValue() :
                        patternReference,
                    pcreResult,
                    result = [],
                    subjectValue = (subjectReference instanceof Variable) ?
                        subjectReference.getValue() :
                        subjectReference;

                parts = patternValue.getNative().match(/^(.)([\s\S]*)\1([\s\S]*)$/);

                if (parts) {
                    pcrelib.preg_compile(parts[2], parts[3].split());
                    pcreResult = pcrelib.preg_match(subjectValue.getNative());

                    if (pcreResult.result.length > 0) {
                        util.each(pcreResult.result[0], function (match) {
                            if (match.name) {
                                result.push(new KeyValuePair(valueFactory.createString(match.name), valueFactory.createString(match.content)));
                            }

                            result.push(match.content);
                        });

                        if (matchesReference) {
                            matchesReference.setValue(valueFactory.createArray(result));
                        }

                        return valueFactory.createInteger(1);
                    }

                    if (matchesReference) {
                        matchesReference.setValue(valueFactory.createArray());
                    }

                    return valueFactory.createInteger(0);
                }
            }
        };
    };
});
