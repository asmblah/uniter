/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    engineTools = require('../tools'),
    expect = require('chai').expect,
    nowdoc = require('nowdoc'),
    phpTools = require('../../tools');

describe('PHP Engine object property bridge integration', function () {
    var engine;

    function check(scenario) {
        engineTools.check(function () {
            return {
                engine: engine
            };
        }, scenario);
    }

    beforeEach(function () {
        engine = phpTools.createEngine();
    });

    describe('exposing as global PHP variables', function () {
        _.each({
            'object from JavaScript with inherited instance property': {
                code: nowdoc(function () {/*<<<EOS
<?php
return $info->planet;
EOS
*/;}), // jshint ignore:line
                expose: {
                    'info': Object.create({
                        'planet': 'Earth'
                    })
                },
                expectedResult: 'Earth',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'assigning string value to JavaScript object property': {
                code: nowdoc(function () {/*<<<EOS
<?php
$document->body->innerHTML = '<p>Earth</p>';
EOS
*/;}), // jshint ignore:line
                expose: function () {
                    var document = {
                        toForceObjectCast: function () {},
                        body: {
                            toForceObjectCast: function () {}
                        }
                    };

                    this.document = document;

                    return {
                        document: document
                    };
                },
                expectedResultCallback: function () {
                    expect(this.document.body.innerHTML).to.equal('<p>Earth</p>');
                },
                expectedStderr: '',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
