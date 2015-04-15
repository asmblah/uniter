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
    'js/Stream'
], function (
    util,
    Stream
) {
    'use strict';

    describe('Stream', function () {
        var stream;

        beforeEach(function () {
            stream = new Stream();
        });

        describe('read()/write()', function () {
            util.each([
                {
                    writes: [],
                    readBytes: 512,
                    expectedReads: ['']
                },
                {
                    writes: ['test'],
                    readBytes: 512,
                    expectedReads: ['test']
                },
                {
                    writes: ['world'],
                    readBytes: 3,
                    expectedReads: ['wor', 'ld']
                }
            ], function (scenario) {
                describe('when the stream has had [' + scenario.writes.join(', ') + '] written to it', function () {
                    beforeEach(function () {
                        util.each(scenario.writes, function (data) {
                            stream.write(data);
                        });
                    });

                    it('should return the correct data when ' + scenario.readBytes + ' bytes are read each time', function () {
                        util.each(scenario.expectedReads, function (expectedData) {
                            expect(stream.read(scenario.readBytes)).to.equal(expectedData);
                        });
                    });
                });
            });
        });

        describe('readAll()', function () {
            util.each([
                {
                    writes: [],
                    expectedData: ''
                },
                {
                    writes: ['test'],
                    expectedData: 'test'
                },
                {
                    writes: ['world'],
                    expectedData: 'world'
                }
            ], function (scenario) {
                describe('when the stream has had [' + scenario.writes.join(', ') + '] written to it', function () {
                    beforeEach(function () {
                        util.each(scenario.writes, function (data) {
                            stream.write(data);
                        });
                    });

                    it('should return the correct data', function () {
                        expect(stream.readAll()).to.equal(scenario.expectedData);
                    });
                });
            });
        });

        describe('write()', function () {
            util.each(['some new data', 'other new data'], function (data) {
                it('should emit a "data" event with the newly written data when "' + data + '"', function () {
                    var onData = sinon.spy();
                    stream.on('data', onData);

                    stream.write(data);

                    expect(onData).to.have.been.calledOnce;
                    expect(onData).to.have.been.calledWith(data);
                });
            });
        });
    });
});
