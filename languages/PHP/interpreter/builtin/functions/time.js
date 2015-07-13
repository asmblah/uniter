/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, setTimeout */
define([
    'languages/PHP/interpreter/Error',
    'languages/PHP/interpreter/Variable'
], function (
    PHPError,
    Variable
) {
    'use strict';

    return function (internals) {
        var callStack = internals.callStack,
            pausable = internals.pausable;

        return {
            'usleep': function (microsecondsReference) {
                var isReference = (microsecondsReference instanceof Variable),
                    microsecondsValue = isReference ? microsecondsReference.getValue() : microsecondsReference,
                    pause;

                if (microsecondsValue.getType() !== 'integer' && microsecondsValue.getType() !== 'float') {
                    callStack.raiseError(PHPError.E_WARNING, 'usleep() expects parameter 1 to be integer or float, ' + microsecondsValue.getType() + ' given');
                    return;
                }

                pause = pausable.createPause();

                setTimeout(function () {
                    pause.resume();
                }, microsecondsValue.getNative() / 1000);

                pause.now();
            }
        };
    };
});
