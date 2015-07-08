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
        appendAutoloadCallable: function (autoloadCallable) {
            var autoloader = this,
                splStack = autoloader.splStack;

            if (!splStack) {
                splStack = [];
                autoloader.splStack = splStack;
            }

            splStack.push(autoloadCallable);
        },

        autoloadClass: function (name) {
            var autoloader = this,
                globalNamespace = autoloader.globalNamespace,
                magicAutoloadFunction,
                splStack = autoloader.splStack;

            if (splStack) {
                util.each(splStack, function (autoloadCallable) {
                    autoloadCallable.call([autoloader.valueFactory.createString(name)], globalNamespace);

                    if (globalNamespace.hasClass(name)) {
                        // Autoloader has defined the class: no need to call any further autoloaders
                        return false;
                    }
                });
            } else {
                magicAutoloadFunction = globalNamespace.getOwnFunction(MAGIC_AUTOLOAD_FUNCTION);

                if (magicAutoloadFunction) {
                    magicAutoloadFunction(autoloader.valueFactory.createString(name));
                }
            }
        },

        removeAutoloadCallable: function (autoloadCallable) {
            var found = false,
                splStack = this.splStack;

            if (!splStack) {
                // SPL stack has not been enabled: nothing to do
                return false;
            }

            util.each(splStack, function (existingAutoloadCallable, index) {
                // Callables may be different value types or different objects,
                // so compare using the *Value API
                if (existingAutoloadCallable.isEqualTo(autoloadCallable).getNative()) {
                    found = true;
                    splStack.splice(index, 1);
                    return false;
                }
            });

            return found;
        },

        setGlobalNamespace: function (globalNamespace) {
            this.globalNamespace = globalNamespace;
        }
    });

    return ClassAutoloader;
});
