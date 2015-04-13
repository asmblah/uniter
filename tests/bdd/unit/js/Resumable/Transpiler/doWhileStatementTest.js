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

    describe('Resumable Transpiler do...while statement', function () {
        var transpiler;

        beforeEach(function () {
            transpiler = new Transpiler();
        });

        it('should correctly transpile a break out of do...while statement', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
print(1);
do {
    print(2);
    break;
} while (a < 4);
print(3);
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1, temp2, temp3;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            temp2 = Resumable._resumeState_.temp2;
            temp3 = Resumable._resumeState_.temp3;
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
                label0:
                    for (;;) {
                        switch (statementIndex) {
                        case 3:
                            temp1 = print;
                            statementIndex = 4;
                        case 4:
                            temp1(2);
                            statementIndex = 5;
                        case 5:
                            break label0;
                            statementIndex = 6;
                        case 6:
                            temp2 = a;
                            statementIndex = 7;
                        case 7:
                            if (!(temp2 < 4)) {
                                break label0;
                            }
                            statementIndex = 8;
                        }
                        statementIndex = 3;
                    }
                statementIndex = 8;
            case 8:
                temp3 = print;
                statementIndex = 9;
            case 9:
                temp3(3);
                statementIndex = 10;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '3': 'temp1',
                        '6': 'temp2',
                        '8': 'temp3'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2,
                    temp3: temp3
                });
            }
            throw e;
        }
    }.call(this);
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
