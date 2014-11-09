/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, require */
require.config({
    'map': {
        '*': {
            'packager': '../vendor/packager/packager'
        }
    }
});

define([
    'packager!./interactive-package'
], function () {});
