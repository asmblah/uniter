/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global console, __dirname, require */
(function () {
    'use strict';

    var express = require('express'),
        http = require('http'),
        app = express(),
        bddPath = __dirname,
        modular = require('modular-amd'),
        rootPath = bddPath + '/../..',
        nodeModulesPath = rootPath + '/node_modules',
        port = 6700,
        server = http.createServer(app),
        util = modular.util,
        vendorPath = rootPath + '/vendor';

    function mapPaths(map) {
        util.each(map, function (realPath, virtualPath) {
            if (/\/$/.test(realPath)) {
                app.use(virtualPath, express.static(realPath));
            } else {
                app.get(virtualPath, function (request, response) {
                    response.sendfile(realPath);
                });
            }
        });
    }

    server.listen(port);

    mapPaths({
        '/chai': nodeModulesPath + '/chai/',
        '/index.html': bddPath + '/index.html',
        '/tests': rootPath + '/tests/',
        '/js': rootPath + '/js/',
        '/languages': rootPath + '/languages/',
        '/mocha': nodeModulesPath + '/mocha/',
        '/modular': nodeModulesPath + '/modular-amd/',
        '/sinon': vendorPath + '/sinon/',
        '/sinon-chai': nodeModulesPath + '/sinon-chai/lib/'
    });

    app.get('/', function (request, response) {
        response.redirect('/index.html');
    });

    console.log('Started server, visit http://127.0.0.1:' + port + '/ to run the tests');
}());
