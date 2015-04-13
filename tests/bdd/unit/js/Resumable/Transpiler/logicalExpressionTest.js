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

    describe('Resumable Transpiler logical expression', function () {
        var transpiler;

        beforeEach(function () {
            transpiler = new Transpiler();
        });

        it('should correctly transpile a method call of logical expression result', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
exports.result = (first.prop1 || second.prop2).start(myArg);
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8;
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
            temp7 = Resumable._resumeState_.temp7;
            temp8 = Resumable._resumeState_.temp8;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                temp0 = exports;
                statementIndex = 1;
            case 1:
                temp1 = first;
                statementIndex = 2;
            case 2:
                temp2 = temp1.prop1;
                statementIndex = 3;
            case 3:
                statementIndex = 4;
            case 4:
            case 5:
                if (statementIndex > 4 || !temp2) {
                    switch (statementIndex) {
                    case 4:
                        temp3 = second;
                        statementIndex = 5;
                    case 5:
                        temp4 = temp3.prop2;
                        statementIndex = 6;
                    }
                }
                statementIndex = 6;
            case 6:
                temp5 = temp2 || temp4;
                statementIndex = 7;
            case 7:
                temp6 = temp5.start;
                statementIndex = 8;
            case 8:
                temp7 = myArg;
                statementIndex = 9;
            case 9:
                temp8 = temp6.call(temp5, temp7);
                statementIndex = 10;
            case 10:
                temp0.result = temp8;
                statementIndex = 11;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1',
                        '2': 'temp2',
                        '4': 'temp3',
                        '5': 'temp4',
                        '6': 'temp5',
                        '7': 'temp6',
                        '8': 'temp7',
                        '9': 'temp8'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2,
                    temp3: temp3,
                    temp4: temp4,
                    temp5: temp5,
                    temp6: temp6,
                    temp7: temp7,
                    temp8: temp8
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
