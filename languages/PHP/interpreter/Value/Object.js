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
    './Array',
    '../Error',
    '../Error/Fatal'
], function (
    util,
    ArrayValue,
    PHPError,
    PHPFatalError
) {
    'use strict';

    function ObjectValue(factory, scopeChain, object, className, id) {
        ArrayValue.call(this, factory, scopeChain, object, 'object');

        this.className = className;
        this.id = id;
        this.object = object;
    }

    util.inherit(ObjectValue).from(ArrayValue);

    util.extend(ObjectValue.prototype, {
        callMethod: function (name, args) {
            var value = this,
                object = value.object;

            name = name.getNative();

            if (!util.isFunction(object[name])) {
                throw new PHPFatalError(PHPFatalError.UNDEFINED_METHOD, {className: value.className, methodName: name});
            }

            return value.factory.coerce(object[name].apply(object, [value.scopeChain].concat(args)));
        },

        clone: function () {
            throw new Error('Unimplemented');
        },

        coerceToKey: function () {
            this.scopeChain.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        getClassName: function () {
            return this.className;
        },

        getForAssignment: function () {
            return this;
        },

        getID: function () {
            return this.id;
        },

        getNative: function () {
            return this.object;
        },

        referToElement: function (key) {
            return 'property: ' + this.className + '::$' + key;
        }
    });

    return ObjectValue;
});
