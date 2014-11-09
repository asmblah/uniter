/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, require */
require.config({
    paths: {
        'bdd': '.'
    },
    map: {
        '*': {
            'chai': 'bower_components/chai/chai',
            'packager': 'vendor/packager/packager',
            'sinon': 'bower_components/sinonjs-built/pkg/sinon',
            'sinon-chai': 'bower_components/sinon-chai/lib/sinon-chai'
        }
    },
    // Defeat caching
    urlArgs: '__r=' + Math.random()
});

define([
    'require',

    // Mocha has to be handled specially as it is not an AMD module
    'bower_components/mocha/mocha'
], function (
    require
) {
    'use strict';

    var global = /*jshint evil:true */new Function('return this;')()/*jshint evil:false */,
        query = global.Mocha.utils.parseQuery(global.location.search || '');

    define('test-environment', {});

    define('mocha', function () {
        return global.Mocha;
    });

    require([
        './runner'
    ], function (
        runner
    ) {
        runner({
            grep: query.grep,
            reporter: 'html'
        });
    });
});
