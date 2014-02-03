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
    'languages/PHP/interpreter/Variable'
], function (
    Variable
) {
    'use strict';

    return function (internals) {
        var state = internals.state;

        return {
            'set_time_limit': function (maxSecondsReference) {
                var isReference = (maxSecondsReference instanceof Variable),
                    maxSeconds = (isReference ? maxSecondsReference.getValue() : maxSecondsReference).getNative();

                state.setTimeLimit(maxSeconds);
            }
        };
    };
});
