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
    'map': {
        '*': {
            'test-environment': 'tests/bdd/test-environment'
        }
    },
    'paths': {
        'bdd': 'tests/bdd'
    },
    'main': 'tests/bdd/runner'
});
