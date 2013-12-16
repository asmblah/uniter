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
    '../Reference/ObjectProperty',
    '../Error',
    '../Value'
], function (
    util,
    ObjectPropertyReference,
    PHPError,
    Value
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function ObjectValue(factory, value, className) {
        Value.call(this, factory, 'object', value);

        this.className = className;
    }

    util.inherit(ObjectValue).from(Value);

    util.extend(ObjectValue.prototype, {
        coerceToKey: function (scopeChain) {
            scopeChain.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        getClassName: function () {
            return this.className;
        },

        getPropertyByKey: function (key, scopeChain) {
            var keyValue,
                value = this;

            key = key.coerceToKey(scopeChain);

            if (!key) {
                // Could not be coerced to a key: error will already have been handled, just return NULL
                return value.factory.createNull();
            }

            keyValue = key.get();

            if (!hasOwn.call(value.value, keyValue)) {
                scopeChain.raiseError(PHPError.E_NOTICE, 'Undefined property: ' + value.className + '::$' + keyValue);
                return value.factory.createNull();
            }

            return value.value[keyValue];
        },

        getPropertyReferenceByKey: function (key, scopeChain) {
            var keyValue,
                value = this;

            key = key.coerceToKey(scopeChain);

            if (!key) {
                // Could not be coerced to a key: error will already have been handled, just return NULL
                return value.factory.createNull();
            }

            keyValue = key.get();

            return new ObjectPropertyReference(value, value.value, keyValue);
        }
    });

    return ObjectValue;
});
