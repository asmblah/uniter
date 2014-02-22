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
    './Reference/StaticProperty'
], function (
    util,
    StaticPropertyReference
) {
    'use strict';

    function Class(valueFactory, name, constructorName, InternalClass, staticPropertiesData) {
        var classObject = this,
            staticProperties = {};

        this.constructorName = constructorName;
        this.InternalClass = InternalClass;
        this.name = name;
        this.staticProperties = staticProperties;
        this.valueFactory = valueFactory;

        util.each(staticPropertiesData, function (value, name) {
            staticProperties[name] = new StaticPropertyReference(classObject, name, value);
        });
    }

    util.extend(Class.prototype, {
        getInternalClass: function () {
            return this.InternalClass;
        },

        getName: function () {
            return this.name;
        },

        getStaticPropertyByName: function (name) {
            return this.staticProperties[name];
        },

        instantiate: function (args) {
            var classObject = this,
                nativeObject = new classObject.InternalClass(),
                objectValue = classObject.valueFactory.createObject(nativeObject, classObject.getName());

            if (classObject.constructorName) {
                objectValue.callMethod(classObject.constructorName, args);
            }

            return objectValue;
        }
    });

    return Class;
});
