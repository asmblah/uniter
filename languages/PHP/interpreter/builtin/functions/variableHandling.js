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
    'languages/PHP/interpreter/Error'
], function (
    util,
    PHPError
) {
    'use strict';

    return function (internals) {
        var callStack = internals.callStack,
            stdout = internals.stdout;

        return {
            'var_dump': function (valueReference) {
                var value,
                    objects = [];

                if (!valueReference) {
                    callStack.raiseError(PHPError.E_WARNING, 'var_dump() expects at least 1 parameter, 0 given');
                    return;
                }

                value = valueReference.toValue();

                function dump(value, depth, isReference) {
                    var currentIndentation = new Array(depth).join('  '),
                        keys,
                        nativeValue,
                        nextIndentation = new Array(depth + 1).join('  '),
                        representation = currentIndentation;

                    if (objects.indexOf(value) > -1) {
                        representation += '*RECURSION*';
                        return representation + '\n';
                    }

                    if (isReference) {
                        objects.push(value);
                        representation += '&';
                    }

                    switch (value.getType()) {
                    case 'array':
                        representation += 'array(' + value.getLength() + ') {\n';

                        util.each(value, function (element) {
                            if (element) {
                                representation += nextIndentation + '[' + JSON.stringify(element.getKey().valueOf()) + ']=>\n' + dump(element.getValue(), depth + 1, element.isReference());
                            }
                        });

                        representation += currentIndentation + '}';
                        break;
                    case 'boolean':
                        representation += 'bool(' + (value.valueOf() ? 'true' : 'false') + ')';
                        break;
                    case 'float':
                        representation += 'float(' + value.valueOf() + ')';
                        break;
                    case 'integer':
                        representation += 'int(' + value.valueOf() + ')';
                        break;
                    case 'null':
                        representation += 'NULL';
                        break;
                    case 'object':
                        keys = value.getPropertyNames();

                        representation += 'object(' + value.getClassName() + ')#' + value.getID() + ' (' + keys.length + ') {\n';

                        objects.push(value);

                        util.each(keys, function (key) {
                            var element = value.getElementByKey(key);
                            representation += nextIndentation + '[' + JSON.stringify(key.valueOf()) + ']=>\n' + dump(element.getValue(), depth + 1, element.isReference());
                        });

                        representation += currentIndentation + '}';
                        break;
                    case 'string':
                        nativeValue = value.valueOf();
                        representation += 'string(' + nativeValue.length + ') "' + nativeValue + '"';
                        break;
                    }

                    return representation + '\n';
                }

                stdout.write(dump(value, 1));
            }
        };
    };
});
