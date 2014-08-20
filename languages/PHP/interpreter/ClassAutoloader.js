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

    var MAGIC_AUTOLOAD_FUNCTION = '__autoload';

    function ClassAutoloader(valueFactory) {
        this.globalNamespace = null;
        this.splStack = null;
        this.valueFactory = valueFactory;
    }

    util.extend(ClassAutoloader.prototype, {
        appendAutoloadFunction: function (autoloadFunction) {
            var autoloader = this,
                splStack = autoloader.splStack;

            if (!splStack) {
                splStack = [];
                autoloader.splStack = splStack;
            }

            splStack.push(autoloadFunction);
        },

        autoloadClass: function (name) {
            var autoloader = this,
                globalNamespace = autoloader.globalNamespace,
                magicAutoloadFunction,
                splStack = autoloader.splStack;

            if (splStack) {
                util.each(splStack, function (autoloadFunction) {
                    autoloadFunction(autoloader.valueFactory.createString(name));
                });
            } else {
                magicAutoloadFunction = globalNamespace.getOwnFunction(MAGIC_AUTOLOAD_FUNCTION);

                if (magicAutoloadFunction) {
                    magicAutoloadFunction(autoloader.valueFactory.createString(name));
                }
            }
        },

        setGlobalNamespace: function (globalNamespace) {
            this.globalNamespace = globalNamespace;
        }
    });

    return ClassAutoloader;
});
