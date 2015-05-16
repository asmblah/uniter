'use strict';

var files,
    glob = require('glob'),
    requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname,
    map: {
        '*': {
            'js': '../../../js',
            'languages': '../../../languages'
        }
    }
});

// Pull in the shared test harness
require('./common');

// Fetch all test files to load
files = glob.sync('../@(integration|unit)/**/*Test.js', {cwd: __dirname});

// Convert to AMD IDs by stripping '.js' suffix
files = files.map(function (path) {
    return path.replace(/\.js$/, '');
});

// Require each module synchronously (as Mocha will run the tests synchronously.)
files.forEach(function (file) {
    requirejs(file);
});
