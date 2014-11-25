/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define({
    'paths': {
        'languages': './languages',
        'js': './js'
    },
    'map': {
        '*': {
            'pcrelib': './vendor/pcrelib/pcrelib16.js'
        }
    },
    'main': 'js/main'
});
