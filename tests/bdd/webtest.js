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
        rootPath = bddPath + '/../..',
        port = 6700,
        server = http.createServer(app);

    app.use('/', express.static(bddPath));
    app.use('/bower_components', express.static(rootPath + '/bower_components'));
    app.use('/js', express.static(rootPath + '/js'));
    app.use('/languages', express.static(rootPath + '/languages'));

    app.get('/', function (request, response) {
        response.redirect('/index.html');
    });

    server.listen(port);

    console.log('Started server, visit http://127.0.0.1:' + port + '/ to run the tests');
}());
