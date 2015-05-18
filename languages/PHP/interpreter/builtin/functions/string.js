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
    'languages/PHP/interpreter/Error',
    'languages/PHP/interpreter/Variable'
], function (
    util,
    PHPError,
    Variable
) {
    'use strict';

    return function (internals) {
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
                var count = 0,
                    search = searchReference.getNative(),
                    replacement = replaceReference.getNative(),
                    subject = subjectReference.getNative(),
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
    };
});
