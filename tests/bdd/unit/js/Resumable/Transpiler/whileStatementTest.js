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

    describe('Resumable Transpiler while statement', function () {
        var transpiler;

        beforeEach(function () {
            transpiler = new Transpiler();
        });

        it('should correctly transpile a nested while loop with break statement', function () {
            var inputJS = util.heredoc(function () {/*<<<EOS
print(1);
while (a < 4) {
    print(2);
    while (b < 3) {
        print(3);
        break;
    }
    print(4);
    break;
}
print(5);
EOS
*/;}), // jshint ignore:line
                expectedOutputJS = util.heredoc(function () {/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1, temp2, temp3, temp4, temp5, temp6;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            temp2 = Resumable._resumeState_.temp2;
            temp3 = Resumable._resumeState_.temp3;
            temp4 = Resumable._resumeState_.temp4;
            temp5 = Resumable._resumeState_.temp5;
            temp6 = Resumable._resumeState_.temp6;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                temp0 = print;
                statementIndex = 1;
            case 1:
                temp0(1);
                statementIndex = 2;
            case 2:
                statementIndex = 3;
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
            case 14:
            case 15:
                label0:
                    for (;;) {
                        switch (statementIndex) {
                        case 3:
                            temp1 = a;
                            statementIndex = 4;
                        case 4:
                            if (!(temp1 < 4)) {
                                break label0;
                            }
                            statementIndex = 5;
                        case 5:
                            temp2 = print;
                            statementIndex = 6;
                        case 6:
                            temp2(2);
                            statementIndex = 7;
                        case 7:
                            statementIndex = 8;
                        case 8:
                        case 9:
                        case 10:
                        case 11:
                        case 12:
                            label1:
                                for (;;) {
                                    switch (statementIndex) {
                                    case 8:
                                        temp3 = b;
                                        statementIndex = 9;
                                    case 9:
                                        if (!(temp3 < 3)) {
                                            break label1;
                                        }
                                        statementIndex = 10;
                                    case 10:
                                        temp4 = print;
                                        statementIndex = 11;
                                    case 11:
                                        temp4(3);
                                        statementIndex = 12;
                                    case 12:
                                        break label1;
                                        statementIndex = 13;
                                    }
                                    statementIndex = 8;
                                }
                            statementIndex = 13;
                        case 13:
                            temp5 = print;
                            statementIndex = 14;
                        case 14:
                            temp5(4);
                            statementIndex = 15;
                        case 15:
                            break label0;
                            statementIndex = 16;
                        }
                        statementIndex = 3;
                    }
                statementIndex = 16;
            case 16:
                temp6 = print;
                statementIndex = 17;
            case 17:
                temp6(5);
                statementIndex = 18;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '3': 'temp1',
                        '5': 'temp2',
                        '8': 'temp3',
                        '10': 'temp4',
                        '13': 'temp5',
                        '16': 'temp6'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2,
                    temp3: temp3,
                    temp4: temp4,
                    temp5: temp5,
                    temp6: temp6
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

        it('should correctly transpile a nested while loop with continue statement', function () {
            var inputJS = util.heredoc(function () {/*<<<EOS
print(1);
while (a < 4) {
    print(2);
    while (b < 3) {
        print(3);
        continue;
    }
    print(4);
    continue;
}
print(5);
EOS
*/;}), // jshint ignore:line
                expectedOutputJS = util.heredoc(function () {/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1, temp2, temp3, temp4, temp5, temp6;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            temp2 = Resumable._resumeState_.temp2;
            temp3 = Resumable._resumeState_.temp3;
            temp4 = Resumable._resumeState_.temp4;
            temp5 = Resumable._resumeState_.temp5;
            temp6 = Resumable._resumeState_.temp6;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                temp0 = print;
                statementIndex = 1;
            case 1:
                temp0(1);
                statementIndex = 2;
            case 2:
                statementIndex = 3;
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
            case 14:
            case 15:
                label0:
                    for (;;) {
                        switch (statementIndex) {
                        case 3:
                            temp1 = a;
                            statementIndex = 4;
                        case 4:
                            if (!(temp1 < 4)) {
                                break label0;
                            }
                            statementIndex = 5;
                        case 5:
                            temp2 = print;
                            statementIndex = 6;
                        case 6:
                            temp2(2);
                            statementIndex = 7;
                        case 7:
                            statementIndex = 8;
                        case 8:
                        case 9:
                        case 10:
                        case 11:
                        case 12:
                            label1:
                                for (;;) {
                                    switch (statementIndex) {
                                    case 8:
                                        temp3 = b;
                                        statementIndex = 9;
                                    case 9:
                                        if (!(temp3 < 3)) {
                                            break label1;
                                        }
                                        statementIndex = 10;
                                    case 10:
                                        temp4 = print;
                                        statementIndex = 11;
                                    case 11:
                                        temp4(3);
                                        statementIndex = 12;
                                    case 12:
                                        continue label1;
                                        statementIndex = 13;
                                    }
                                    statementIndex = 8;
                                }
                            statementIndex = 13;
                        case 13:
                            temp5 = print;
                            statementIndex = 14;
                        case 14:
                            temp5(4);
                            statementIndex = 15;
                        case 15:
                            continue label0;
                            statementIndex = 16;
                        }
                        statementIndex = 3;
                    }
                statementIndex = 16;
            case 16:
                temp6 = print;
                statementIndex = 17;
            case 17:
                temp6(5);
                statementIndex = 18;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '3': 'temp1',
                        '5': 'temp2',
                        '8': 'temp3',
                        '10': 'temp4',
                        '13': 'temp5',
                        '16': 'temp6'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2,
                    temp3: temp3,
                    temp4: temp4,
                    temp5: temp5,
                    temp6: temp6
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
