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
    'escodegen',
    'esprima',
    'js/util',
    'js/Resumable/Transpiler'
], function (
    escodegen,
    esprima,
    util,
    Transpiler
) {
    'use strict';

    describe('Resumable Transpiler block statement', function () {
        var transpiler;

        beforeEach(function () {
            transpiler = new Transpiler();
        });

        it('should correctly transpile a block statement containing break', function () {
            var inputJS = util.heredoc(function () {/*<<<EOS
my_block: {
    print(1);
    break my_block;
    print(2);
}
EOS
*/;}), // jshint ignore:line
                expectedOutputJS = util.heredoc(function () {/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                statementIndex = 1;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                my_block: {
                    switch (statementIndex) {
                    case 1:
                        temp0 = print;
                        statementIndex = 2;
                    case 2:
                        temp0(1);
                        statementIndex = 3;
                    case 3:
                        break my_block;
                        statementIndex = 4;
                    case 4:
                        temp1 = print;
                        statementIndex = 5;
                    case 5:
                        temp1(2);
                        statementIndex = 6;
                    }
                }
                statementIndex = 6;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '1': 'temp0',
                        '4': 'temp1'
                    },
                    temp0: temp0,
                    temp1: temp1
                });
            }
            throw e;
        }
    }.call(this);
});
EOS
*/;}), // jshint ignore:line
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

        it('should correctly transpile a nested block statement containing break', function () {
            var inputJS = util.heredoc(function () {/*<<<EOS
my_block: {
    print(1);
    another_block: {
        print(2);
        break my_block;
        print(3);
        break another_block;
        print(4);
    }
    print(5);
}
EOS
*/;}), // jshint ignore:line
                expectedOutputJS = util.heredoc(function () {/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1, temp2, temp3, temp4;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            temp2 = Resumable._resumeState_.temp2;
            temp3 = Resumable._resumeState_.temp3;
            temp4 = Resumable._resumeState_.temp4;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                statementIndex = 1;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
                my_block: {
                    switch (statementIndex) {
                    case 1:
                        temp0 = print;
                        statementIndex = 2;
                    case 2:
                        temp0(1);
                        statementIndex = 3;
                    case 3:
                        statementIndex = 4;
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                        another_block: {
                            switch (statementIndex) {
                            case 4:
                                temp1 = print;
                                statementIndex = 5;
                            case 5:
                                temp1(2);
                                statementIndex = 6;
                            case 6:
                                break my_block;
                                statementIndex = 7;
                            case 7:
                                temp2 = print;
                                statementIndex = 8;
                            case 8:
                                temp2(3);
                                statementIndex = 9;
                            case 9:
                                break another_block;
                                statementIndex = 10;
                            case 10:
                                temp3 = print;
                                statementIndex = 11;
                            case 11:
                                temp3(4);
                                statementIndex = 12;
                            }
                        }
                        statementIndex = 12;
                    case 12:
                        temp4 = print;
                        statementIndex = 13;
                    case 13:
                        temp4(5);
                        statementIndex = 14;
                    }
                }
                statementIndex = 14;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '1': 'temp0',
                        '4': 'temp1',
                        '7': 'temp2',
                        '10': 'temp3',
                        '12': 'temp4'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2,
                    temp3: temp3,
                    temp4: temp4
                });
            }
            throw e;
        }
    }.call(this);
});
EOS
*/;}), // jshint ignore:line
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
