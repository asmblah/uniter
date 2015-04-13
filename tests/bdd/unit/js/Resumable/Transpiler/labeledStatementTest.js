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

    describe('Resumable Transpiler labeled statement', function () {
        var transpiler;

        beforeEach(function () {
            transpiler = new Transpiler();
        });

        it('should correctly transpile a break out of labeled statement', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
my_block: {
    print(1);
    if (true) {
        print(2);
        break my_block;
    }
    print(3);
}
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0, temp1, temp2;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            temp1 = Resumable._resumeState_.temp1;
            temp2 = Resumable._resumeState_.temp2;
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
                        if (statementIndex > 4 || true) {
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
                            }
                        }
                        statementIndex = 7;
                    case 7:
                        temp2 = print;
                        statementIndex = 8;
                    case 8:
                        temp2(3);
                        statementIndex = 9;
                    }
                }
                statementIndex = 9;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '1': 'temp0',
                        '4': 'temp1',
                        '7': 'temp2'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2
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
