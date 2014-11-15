/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, describe, escodegen, expect, it */
define([
    'vendor/esparse/esprima',
    'js/util',
    'js/Resumable/Transpiler',
    'vendor/esparse/escodegen'
], function (
    esprima,
    util,
    Transpiler
) {
    'use strict';

    describe('Resumable Transpiler', function () {
        var transpiler;

        beforeEach(function () {
            transpiler = new Transpiler();
        });

        it('should correctly transpile an empty function', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
function doThings(num1, num2) {}
exports.result = doThings(2, 3);
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = Resumable._resumeState_ ? Resumable._resumeState_.statementIndex : 0;
    try {
        switch (statementIndex) {
        case 0:
            ++statementIndex;
            function doThings(num1, num2) {
            }
        case 1:
            ++statementIndex;
            exports.result = doThings(2, 3);
        }
    } catch (e) {
        if (e instanceof Resumable.PauseException) {
            e.add({
                func: arguments.callee,
                statementIndex: statementIndex
            });
        }
        throw e;
    }
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });

        it('should correctly transpile a simple function with one calculation', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
function doThings(num1, num2) {
    var num3 = 2 + 4;

    return num3;
}
exports.result = doThings(2, 3);
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = Resumable._resumeState_ ? Resumable._resumeState_.statementIndex : 0;
    try {
        switch (statementIndex) {
        case 0:
            ++statementIndex;
            function doThings(num1, num2) {
                var statementIndex = Resumable._resumeState_ ? Resumable._resumeState_.statementIndex : 0;
                try {
                    switch (statementIndex) {
                    case 0:
                        ++statementIndex;
                        var num3 = 2 + 4;
                    case 1:
                        ++statementIndex;
                        return num3;
                    }
                } catch (e) {
                    if (e instanceof Resumable.PauseException) {
                        e.add({
                            func: arguments.callee,
                            statementIndex: statementIndex,
                            num1: num1,
                            num2: num2,
                            num3: num3
                        });
                    }
                    throw e;
                }
            }
        case 1:
            ++statementIndex;
            exports.result = doThings(2, 3);
        }
    } catch (e) {
        if (e instanceof Resumable.PauseException) {
            e.add({
                func: arguments.callee,
                statementIndex: statementIndex
            });
        }
        throw e;
    }
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });

        it('should correctly transpile a simple function with no control structures', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
function doThings(num1, num2) {
    var num3 = 0;

    num3 += num1 + 1;

    return num3;
}
exports.result = doThings(2, 3);
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = Resumable._resumeState_ ? Resumable._resumeState_.statementIndex : 0;
    try {
        switch (statementIndex) {
        case 0:
            ++statementIndex;
            function doThings(num1, num2) {
                var statementIndex = Resumable._resumeState_ ? Resumable._resumeState_.statementIndex : 0, temp0, temp1;
                try {
                    switch (statementIndex) {
                    case 0:
                        ++statementIndex;
                        var num3 = 0;
                    case 1:
                        ++statementIndex;
                        temp0 = num3;
                    case 2:
                        ++statementIndex;
                        temp1 = num1;
                    case 3:
                        ++statementIndex;
                        num3 = temp0 + (temp1 + 1);
                    case 4:
                        ++statementIndex;
                        return num3;
                    }
                } catch (e) {
                    if (e instanceof Resumable.PauseException) {
                        e.add({
                            func: arguments.callee,
                            statementIndex: statementIndex,
                            num1: num1,
                            num2: num2,
                            num3: num3,
                            temp0: temp0,
                            temp1: temp1
                        });
                    }
                    throw e;
                }
            }
        case 1:
            ++statementIndex;
            exports.result = doThings(2, 3);
        }
    } catch (e) {
        if (e instanceof Resumable.PauseException) {
            e.add({
                func: arguments.callee,
                statementIndex: statementIndex
            });
        }
        throw e;
    }
});
EOS
*/) {}),
                ast = esprima.parse(inputJS);

            ast = transpiler.transpile(ast);

            expect(escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            })).to.equal(expectedOutputJS);
        });
    });
});
