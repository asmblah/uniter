/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, describe, expect, it */
define([
    'js/util'
], function (
    util
) {
    'use strict';

    describe('Util', function () {
        describe('getLineNumber()', function () {
            util.each({
                'the empty string': {
                    text: '',
                    offset: 0,
                    expectedLineNumber: 1
                },
                'a blank line followed by text on the next line': {
                    text: '\nabc',
                    offset: 0,
                    expectedLineNumber: 1
                },
                'a blank line also followed by text on the next line': {
                    text: '\ndef',
                    offset: 2,
                    expectedLineNumber: 2
                },
                'three blank lines followed by text on the next line': {
                    text: '\n\n\nmememe',
                    offset: 3,
                    expectedLineNumber: 4
                }
            }, function (scenario, description) {
                it('should return the correct line number for ' + description + ', offset ' + scenario.offset, function () {
                    expect(util.getLineNumber(scenario.text, scenario.offset)).to.equal(scenario.expectedLineNumber);
                });
            });
        });

        describe('each()', function () {
            beforeEach(function () {
                this.callback = sinon.stub();
            });

            describe('when iterating over an array with one element', function () {
                beforeEach(function () {
                    this.array = ['hello'];
                    this.callEach = function () {
                        util.each(this.array, this.callback);
                    }.bind(this);
                });

                it('should call the callback once', function () {
                    this.callEach();

                    expect(this.callback).to.have.been.calledOnce;
                });

                it('should use the value as the thisObj', function () {
                    this.callEach();

                    expect(this.callback).to.have.been.calledOn('hello');
                });

                it('should pass the value as the first argument', function () {
                    this.callEach();

                    expect(this.callback).to.have.been.calledWith('hello');
                });

                it('should pass the index as the second argument', function () {
                    this.callEach();

                    expect(this.callback).to.have.been.calledWith(sinon.match.any, 0);
                });

                it('should pass the array as the third argument', function () {
                    this.callEach();

                    expect(this.callback)
                        .to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match.same(this.array));
                });
            });

            describe('when iterating over an object with one property', function () {
                beforeEach(function () {
                    this.object = {'myProp': 'my-value'};
                    this.callEach = function () {
                        util.each(this.object, this.callback);
                    }.bind(this);
                });

                it('should call the callback once', function () {
                    this.callEach();

                    expect(this.callback).to.have.been.calledOnce;
                });

                it('should use the value as the thisObj', function () {
                    this.callEach();

                    expect(this.callback).to.have.been.calledOn('my-value');
                });

                it('should pass the value as the first argument', function () {
                    this.callEach();

                    expect(this.callback).to.have.been.calledWith('my-value');
                });

                it('should pass the property name as the second argument', function () {
                    this.callEach();

                    expect(this.callback).to.have.been.calledWith(sinon.match.any, 'myProp');
                });

                it('should pass the object as the third argument', function () {
                    this.callEach();

                    expect(this.callback)
                        .to.have.been.calledWith(sinon.match.any, sinon.match.any, sinon.match.same(this.object));
                });
            });
        });

        describe('heredoc()', function () {
            util.each([
                {
                    heredoc: util.heredoc(function () {/*<<<EOS
Line 1
Line 2
EOS
*/;}), // jshint ignore:line
                    expectedString: 'Line 1\nLine 2'
                },
                {
                    heredoc: util.heredoc(function () {/*<<<EOS
${person} walked up the stairs in ${person}'s flat.
EOS
*/;}, {person: 'Fred'}), // jshint ignore:line
                    expectedString: 'Fred walked up the stairs in Fred\'s flat.'
                },
                {
                    heredoc: util.heredoc(function () {/*<<<EOS
The ladder is ${length}cm long.
EOS
*/;}, {length: 12}), // jshint ignore:line
                    expectedString: 'The ladder is 12cm long.'
                }
            ], function (scenario, index) {
                it('should return the correct string for heredoc #' + (index + 1), function () {
                    expect(scenario.heredoc).to.equal(scenario.expectedString);
                });
            });
        });

        describe('inherit()', function () {
            it('should set the .prototype of the To class to be an object that uses the From class\' .prototype as its prototype', function () {
                function From() {}
                function To() {}

                util.inherit(To).from(From);

                expect(Object.getPrototypeOf(To.prototype)).to.equal(From.prototype);
            });
        });

        // Should only return true for values of Boolean type
        describe('isBoolean()', function () {
            util.each([
                {
                    value: true,
                    expectedIsBoolean: true
                },
                {
                    value: false,
                    expectedIsBoolean: true
                },
                {
                    value: [],
                    expectedIsBoolean: false
                },
                {
                    value: {},
                    expectedIsBoolean: false
                },
                {
                    value: 0,
                    expectedIsBoolean: false
                },
                {
                    value: 1,
                    expectedIsBoolean: false
                }
            ], function (scenario) {
                describe('for ' + JSON.stringify(scenario.value), function () {
                    if (scenario.expectedIsBoolean) {
                        it('should return true', function () {
                            expect(util.isBoolean(scenario.value)).to.be.true;
                        });
                    } else {
                        it('should return false', function () {
                            expect(util.isBoolean(scenario.value)).to.be.false;
                        });
                    }
                });
            });
        });
    });
});
