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
    './Reference/Null'
], function (
    util,
    NullReference
) {
    'use strict';

    function ReferenceFactory(valueFactory) {
        this.valueFactory = valueFactory;
    }

    util.extend(ReferenceFactory.prototype, {
        createNull: function () {
            return new NullReference(this.valueFactory);
        }
    });

    return ReferenceFactory;
});
