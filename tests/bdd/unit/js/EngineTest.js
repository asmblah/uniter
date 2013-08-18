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
    'js/Engine',
    'js/Promise'
], function (
    util,
    Engine,
    Promise
) {
    'use strict';

    describe('Engine', function () {
        var engine;

        beforeEach(function () {
            engine = new Engine();
        });

        describe('execute()', function () {
            util.each([
                {
                    code: ''
                }, {
                    code: '<a></b>'
                }, {
                    code: '<?php'
                }, {
                    code: '<?php return 0;'
                }, {
                    code: '<?php return 7;'
                }, {
                    code: '<?php return "world";'
                }
            ], function (scenario) {
                describe('when the code is "' + scenario.code + '"', function () {
                    it('should return a Promise', function () {
                        expect(engine.execute(scenario.code)).to.be.an.instanceOf(Promise);
                    });
                });
            });
        });
    });
});
