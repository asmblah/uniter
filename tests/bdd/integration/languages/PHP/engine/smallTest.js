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
    '../tools',
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    describe('PHP Engine small program integration', function () {
        var engine;

        beforeEach(function () {
            engine = tools.createEngine();
        });

        util.each([
            {
                code: '',
                expectedResult: undefined,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<p>A test</p>',
                expectedResult: undefined,
                expectedStderr: '',
                expectedStdout: '<p>A test</p>'
            },
            {
                code: '<?php',
                expectedResult: undefined,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php ?>',
                expectedResult: undefined,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<strong><?php ?></strong>',
                expectedResult: undefined,
                expectedStderr: '',
                expectedStdout: '<strong></strong>'
            },
            {
                code: '<?php $xyz = 21;',
                // No result is returned, even though $xyz is set to 21
                expectedResult: undefined,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php return 37;',
                expectedResult: 37,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $answer = 6; return $answer;',
                expectedResult: 6,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $product = 2 * 4; return $product;',
                expectedResult: 8,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                // Checks precedence handling of explicit parentheses, as "8 - (2 * 3)" will be 2 whereas "(8 - 2) * 3" will be 18
                code: '<?php $product = (8 - 2) * 3; return $product;',
                expectedResult: 18,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php return "hello";',
                expectedResult: 'hello',
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php return \'world\';',
                expectedResult: 'world',
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php return \'hello \' . \'world\';',
                expectedResult: 'hello world',
                expectedStderr: '',
                expectedStdout: ''
            },
            // Ternary with nested ternary in condition:
            // - Common gotcha for developers, as in other languages ?: is right-associative whereas in PHP it's left-associative
            // - Result would be "Banana", but if right-associative it would be "Orange"
            {
                code: '<?php $arg = "A"; return ($arg === "A") ? "Apple" : ($arg === "B") ? "Banana" : "Orange";',
                expectedResult: 'Banana',
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $arr = array(); return $arr;',
                expectedResultCallback: function (result) {
                    expect(result).to.be.an('array');
                    expect(result).to.be.empty;
                },
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $arr = array(3 + 4, "hello " . "fred"); return $arr;',
                expectedResultCallback: function (result) {
                    expect(result).to.be.an('array');
                    expect(result).to.deep.equal([7, 'hello fred']);
                },
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $names = array(array("Barry", "baz"), array("Arthur", "arty"), array("Marge", "madge")); return $names[1][0];',
                expectedResult: 'Arthur',
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $a = 7; ++$a; return $a;',
                expectedResult: 8,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $a = 4; $a++; return $a;',
                expectedResult: 5,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $a = 7; --$a; return $a;',
                expectedResult: 6,
                expectedStderr: '',
                expectedStdout: ''
            },
            {
                code: '<?php $a = 4; $a--; return $a;',
                expectedResult: 3,
                expectedStderr: '',
                expectedStdout: ''
            }
        ], function (scenario) {
            describe('when the code is "' + scenario.code + '"', function () {
                it('should return the expected result', function (done) {
                    engine.execute(scenario.code).done(function (result) {
                        if (hasOwn.call(scenario, 'expectedResult')) {
                            expect(result).to.equal(scenario.expectedResult);
                        } else {
                            scenario.expectedResultCallback(result);
                        }
                        done();
                    }).fail(done);
                });

                it('should output the expected data to stderr', function (done) {
                    engine.execute(scenario.code).done(function () {
                        expect(engine.getStderr().readAll()).to.equal(scenario.expectedStderr);
                        done();
                    }).fail(done);
                });

                it('should output the expected data to stdout', function (done) {
                    engine.execute(scenario.code).done(function () {
                        expect(engine.getStdout().readAll()).to.equal(scenario.expectedStdout);
                        done();
                    }).fail(done);
                });
            });
        });
    });
});
