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
    '../Error'
], function (
    util,
    PHPError
) {
    'use strict';

    function ElementReference(valueFactory, callStack, arrayValue, key, value) {
        this.arrayValue = arrayValue;
        this.key = key;
        this.reference = null;
        this.callStack = callStack;
        this.value = value;
        this.valueFactory = valueFactory;
    }

    util.extend(ElementReference.prototype, {
        clone: function () {
            var element = this;

            return new ElementReference(element.valueFactory, element.callStack, element.arrayValue, element.key, element.value);
        },

        getKey: function () {
            return this.key;
        },

        getValue: function () {
            var element = this;

            // Special value of native null (vs. NullValue) represents undefined
            if (!element.value && !element.reference) {
                element.callStack.raiseError(PHPError.E_NOTICE, 'Undefined ' + element.arrayValue.referToElement(element.key.getNative()));
                return element.valueFactory.createNull();
            }

            return element.value ? element.value : element.reference.getValue();
        },

        isDefined: function () {
            var element = this;

            return element.value || element.reference;
        },

        isReference: function () {
            return !!this.reference;
        },

        setReference: function (reference) {
            var element = this;

            element.reference = reference;
            element.value = null;
        },

        setValue: function (value) {
            var element = this,
                isFirstElement = (element.arrayValue.getLength() === 0);

            if (element.reference) {
                element.reference.setValue(value);
            } else {
                element.value = value.getForAssignment();
            }

            if (isFirstElement) {
                element.arrayValue.setPointer(element.arrayValue.getKeys().indexOf(element.key.getNative().toString()));
            }
        }
    });

    return ElementReference;
});
