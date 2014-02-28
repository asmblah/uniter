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

    function HostEnvironment(sandboxGlobalFactory) {
        this.sandboxGlobal = null;
        this.sandboxGlobalFactory = sandboxGlobalFactory;
    }

    util.extend(HostEnvironment.prototype, {
        getSandboxGlobal: function () {
            var hostEnvironment = this;

            if (!hostEnvironment.sandboxGlobal) {
                hostEnvironment.sandboxGlobal = this.sandboxGlobalFactory();
            }

            return hostEnvironment.sandboxGlobal;
        },

        evaluateScript: function (script) {
            /*jshint evil:true */
            var sandboxGlobal = this.getSandboxGlobal();

            return sandboxGlobal.eval(script);
        }
    });

    return HostEnvironment;
});
