/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define(function () {
    'use strict';

    return {
        generators: {
            'N_COMPOUND_STATEMENT': function (node) {
                var result = '';

                node.each(function (node) {
                    result += node.recompile() + '\n';
                });

                return result;
            },
            'N_IF': function (node) {
                return 'if (' + node.getChild('condition').recompile() + ') ' + node.getChild('thenStatements').recompile();
            }
        }
    };
});
