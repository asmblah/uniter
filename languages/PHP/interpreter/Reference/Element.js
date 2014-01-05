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

    function ElementReference(valueFactory, arrayValue, key, value) {
        this.arrayValue = arrayValue;
        this.key = key;
        this.value = value;
        this.valueFactory = valueFactory;
    }

    util.extend(ElementReference.prototype, {
        clone: function () {
            var element = this;

            return new ElementReference(element.valueFactory, element.arrayValue, element.key, element.value);
        },

        getKey: function () {
            return this.key;
        },

        getValue: function (scopeChain) {
            var element = this;

            // Special value of native null (vs. NullValue) represents undefined
            if (element.value === null) {
                scopeChain.raiseError(PHPError.E_NOTICE, 'Undefined ' + element.arrayValue.referToElement(element.key.getNative()));
                return element.valueFactory.createNull();
            }

            return element.value;
        },

        isDefined: function () {
            return this.value !== null;
        },

        setValue: function (value) {
            var element = this,
                isFirstElement = (element.arrayValue.getLength() === 0);

            element.value = value.getForAssignment();

            if (isFirstElement) {
                element.arrayValue.setPointer(element.arrayValue.getKeys().indexOf(element.key.getNative().toString()));
            }
        }
    });

    return ElementReference;
});
