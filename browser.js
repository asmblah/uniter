/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, document */
define([
    './uniter'
], function (
    uniter
) {
    'use strict';

    uniter.setHostEnvironment(uniter.createHostEnvironment(function () {
        var iframe = document.createElement('iframe');

        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        return iframe.contentWindow;
    }));

    return uniter;
});
