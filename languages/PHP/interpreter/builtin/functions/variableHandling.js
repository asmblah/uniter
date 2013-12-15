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
    'languages/PHP/interpreter/Variable'
], function (
    util,
    Variable
) {
    'use strict';

    return function (internals) {
        var stdout = internals.stdout;

        return {
            'var_dump': function (scopeChain, valueReference) {
                var isReference = (valueReference instanceof Variable),
                    value = isReference ? valueReference.get() : valueReference;

                function dump(value) {
                    var representation,
                        string;

                    switch (value.getType()) {
                    case 'array':
                        representation = 'array(' + value.getLength() + ') {\n';

                        util.each(value.get(), function (value, key) {
                            representation += '  [' + key + ']=>\n  ' + dump(value);
                        });

                        representation += '}';
                        break;
                    case 'boolean':
                        representation = 'bool(' + (value.get() ? 'true' : 'false') + ')';
                        break;
                    case 'float':
                        representation = 'float(' + value.get() + ')';
                        break;
                    case 'integer':
                        representation = 'int(' + value.get() + ')';
                        break;
                    case 'null':
                        representation = 'NULL';
                        break;
                    case 'string':
                        string = value.get();
                        representation = 'string(' + string.length + ') "' + string + '"';
                        break;
                    }

                    return representation + '\n';
                }

                stdout.write(dump(value));
            }
        };
    };
});
