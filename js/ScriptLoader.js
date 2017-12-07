/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash');

/**
 * @param {Window} global
 * @param {string} scriptSelector
 * @param {Uniter} uniter
 * @constructor
 */
function ScriptLoader(global, scriptSelector, uniter) {
    /**
     * @type {Window}
     */
    this.global = global;
    /**
     * @type {string}
     */
    this.scriptSelector = scriptSelector;
    /**
     * @type {Uniter}
     */
    this.uniter = uniter;
}

_.extend(ScriptLoader.prototype, {
    /**
     * Finds all <script> elements on the page that have the configured selector
     * and evaluates them all in the same Uniter PHP environment
     */
    loadScripts: function () {
        var loader = this,
            phpEngine,
            scriptElements;

        if (!loader.global.document) {
            // Don't do anything else if we aren't in a browser environment
            return;
        }

        scriptElements = this.global.document.querySelectorAll(this.scriptSelector);

        if (scriptElements.length === 0) {
            // Don't create an engine if there aren't any inline Uniter PHP scripts on the page
            return;
        }

        phpEngine = loader.uniter.createEngine('PHP');

        phpEngine.expose(loader.global.document, 'document');
        phpEngine.expose(loader.global, 'window');

        phpEngine.getStdout().on('data', function (data) {
            if (loader.global.console) {
                loader.global.console.log(data);
            }
        });

        phpEngine.getStderr().on('data', function (data) {
            if (loader.global.console) {
                loader.global.console.error(data);
            }
        });

        [].forEach.call(scriptElements, function (script) {
            var phpCode = script.textContent;

            phpEngine.execute('<?php ' + phpCode).fail(function (error) {
                if (loader.global.console) {
                    loader.global.console.error(error.toString());
                    throw error;
                }
            });
        });
    }
});

module.exports = ScriptLoader;
