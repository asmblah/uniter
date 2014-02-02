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
    './Error'
], function (
    util,
    PHPError
) {
    'use strict';

    function CallStack(stderr) {
        this.calls = [];
        this.stderr = stderr;
    }

    util.extend(CallStack.prototype, {
        getCurrent: function () {
            var chain = this;

            return chain.calls[chain.calls.length - 1];
        },

        pop: function () {
            this.calls.pop();
        },

        push: function (call) {
            this.calls.push(call);
        },

        raiseError: function (level, message) {
            var call,
                chain = this,
                calls = chain.calls,
                error,
                index = 0;

            for (index = calls.length - 1; index >= 0; --index) {
                call = calls[index];

                if (call.getScope().suppressesErrors()) {
                    return;
                }
            }

            error = new PHPError(level, message);

            chain.stderr.write(error.getMessage());
        }
    });

    return CallStack;
});
