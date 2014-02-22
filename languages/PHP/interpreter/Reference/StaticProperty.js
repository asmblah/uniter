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
    'js/util'
], function (
    util
) {
    'use strict';

    function StaticPropertyReference(classObject, name, value) {
        this.classObject = classObject;
        this.name = name;
        this.reference = null;
        this.value = value;
    }

    util.extend(StaticPropertyReference.prototype, {
        getName: function () {
            return this.name;
        },

        getValue: function () {
            var property = this;

            return property.value ? property.value : property.reference.getValue();
        },

        isReference: function () {
            return !!this.reference;
        },

        setReference: function (reference) {
            var property = this;

            property.reference = reference;
            property.value = null;
        },

        setValue: function (value) {
            var property = this;

            if (property.reference) {
                property.reference.setValue(value);
            } else {
                property.value = value.getForAssignment();
            }
        }
    });

    return StaticPropertyReference;
});
