/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define(function () {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    return {
        check: function (getData, scenario) {
            describe('when the code is ' + JSON.stringify(scenario.code), function () {
                var parser;

                beforeEach(function () {
                    parser = getData().parser;
                });

                if (scenario.expectedException) {
                    it('should throw the expected Exception', function () {
                        try {
                            parser.parse(scenario.code);
                        } catch (exception) {
                            if (hasOwn.call(scenario.expectedException, 'instanceOf')) {
                                expect(exception).to.be.an.instanceOf(scenario.expectedException.instanceOf);
                            }
                            if (hasOwn.call(scenario.expectedException, 'match')) {
                                expect(exception.message).to.match(scenario.expectedException.match);
                            }
                            return;
                        }

                        throw new Error('Expected an Exception to be thrown');
                    });
                } else if (hasOwn.call(scenario, 'expectedAST')) {
                    it('should return the expected result', function () {
                        var result = parser.parse(scenario.code);

                        expect(result).to.deep.equal(scenario.expectedAST);
                    });
                }
            });
        }
    };
});
