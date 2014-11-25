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
    var statementIndex = 0, temp0, temp1;
    function doThings(num1, num2) {
    }
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
                temp0 = exports;
                statementIndex = 1;
            case 1:
                temp1 = doThings(2, 3);
                statementIndex = 2;
            case 2:
                temp0.result = temp1;
                statementIndex = 3;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1'
                    },
                    temp0: temp0,
                    temp1: temp1
                });
            }
            throw e;
        }
    }();
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

        it('should correctly transpile a function call', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
doSomething();
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0, temp0;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            temp0 = Resumable._resumeState_.temp0;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                temp0 = doSomething;
                statementIndex = 1;
            case 1:
                temp0();
                statementIndex = 2;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: { '0': 'temp0' },
                    temp0: temp0
                });
            }
            throw e;
        }
    }();
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
    var statementIndex = 0, temp0, temp1;
    function doThings(num1, num2) {
        var statementIndex = 0, num3;
        return function resumableScope() {
            if (Resumable._resumeState_) {
                statementIndex = Resumable._resumeState_.statementIndex;
                Resumable._resumeState_ = null;
            }
            try {
                switch (statementIndex) {
                case 0:
                    num3 = 2 + 4;
                    statementIndex = 1;
                case 1:
                    return num3;
                    statementIndex = 2;
                }
            } catch (e) {
                if (e instanceof Resumable.PauseException) {
                    e.add({
                        func: resumableScope,
                        statementIndex: statementIndex + 1,
                        assignments: {},
                        num1: num1,
                        num2: num2,
                        num3: num3
                    });
                }
                throw e;
            }
        }();
    }
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
                temp0 = exports;
                statementIndex = 1;
            case 1:
                temp1 = doThings(2, 3);
                statementIndex = 2;
            case 2:
                temp0.result = temp1;
                statementIndex = 3;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1'
                    },
                    temp0: temp0,
                    temp1: temp1
                });
            }
            throw e;
        }
    }();
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
    var statementIndex = 0, temp0, temp1;
    function doThings(num1, num2) {
        var statementIndex = 0, num3, temp0;
        return function resumableScope() {
            if (Resumable._resumeState_) {
                statementIndex = Resumable._resumeState_.statementIndex;
                temp0 = Resumable._resumeState_.temp0;
                Resumable._resumeState_ = null;
            }
            try {
                switch (statementIndex) {
                case 0:
                    num3 = 0;
                    statementIndex = 1;
                case 1:
                    temp0 = num1;
                    statementIndex = 2;
                case 2:
                    num3 = num3 + (temp0 + 1);
                    statementIndex = 3;
                case 3:
                    return num3;
                    statementIndex = 4;
                }
            } catch (e) {
                if (e instanceof Resumable.PauseException) {
                    e.add({
                        func: resumableScope,
                        statementIndex: statementIndex + 1,
                        assignments: { '1': 'temp0' },
                        num1: num1,
                        num2: num2,
                        num3: num3,
                        temp0: temp0
                    });
                }
                throw e;
            }
        }();
    }
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
                temp0 = exports;
                statementIndex = 1;
            case 1:
                temp1 = doThings(2, 3);
                statementIndex = 2;
            case 2:
                temp0.result = temp1;
                statementIndex = 3;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1'
                    },
                    temp0: temp0,
                    temp1: temp1
                });
            }
            throw e;
        }
    }();
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

        it('should correctly transpile an assignment of method call result to property', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
exports.result = tools.getOne();
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
                temp0 = exports;
                statementIndex = 1;
            case 1:
                temp1 = tools;
                statementIndex = 2;
            case 2:
                temp2 = temp1.getOne;
                statementIndex = 3;
            case 3:
                temp3 = temp2.call(temp1);
                statementIndex = 4;
            case 4:
                temp0.result = temp3;
                statementIndex = 5;
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
                        '3': 'temp3'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2,
                    temp3: temp3
                });
            }
            throw e;
        }
    }();
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

        it('should correctly transpile an if (...) {...} statement', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
if (tools.sayYes) {
    exports.result = 'yes';
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
                temp0 = tools;
                statementIndex = 1;
            case 1:
                temp1 = temp0.sayYes;
                statementIndex = 2;
            case 2:
                statementIndex = 3;
            case 3:
            case 4:
                if (statementIndex > 3 || temp1) {
                    switch (statementIndex) {
                    case 3:
                        temp2 = exports;
                        statementIndex = 4;
                    case 4:
                        temp2.result = 'yes';
                        statementIndex = 5;
                    }
                }
                statementIndex = 5;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1',
                        '3': 'temp2'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2
                });
            }
            throw e;
        }
    }();
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

        it('should correctly transpile an if (...) {...} statement inside a block', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
{
    if (tools.sayYes) {
        exports.result = 'yes';
    }
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
            case 5: {
                    switch (statementIndex) {
                    case 1:
                        temp0 = tools;
                        statementIndex = 2;
                    case 2:
                        temp1 = temp0.sayYes;
                        statementIndex = 3;
                    case 3:
                        statementIndex = 4;
                    case 4:
                    case 5:
                        if (statementIndex > 4 || temp1) {
                            switch (statementIndex) {
                            case 4:
                                temp2 = exports;
                                statementIndex = 5;
                            case 5:
                                temp2.result = 'yes';
                                statementIndex = 6;
                            }
                        }
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
                        '2': 'temp1',
                        '4': 'temp2'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2
                });
            }
            throw e;
        }
    }();
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

        it('should correctly transpile a while (...) {...} statement', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
while (a > 4) {
    exports.result = doSomething();
}
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
                statementIndex = 1;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                label0:
                    for (;;) {
                        switch (statementIndex) {
                        case 1:
                            temp0 = a;
                            statementIndex = 2;
                        case 2:
                            if (!(temp0 > 4)) {
                                break label0;
                            }
                            statementIndex = 3;
                        case 3:
                            temp1 = exports;
                            statementIndex = 4;
                        case 4:
                            temp2 = doSomething;
                            statementIndex = 5;
                        case 5:
                            temp3 = temp2();
                            statementIndex = 6;
                        case 6:
                            temp1.result = temp3;
                            statementIndex = 7;
                        }
                        statementIndex = 1;
                    }
                statementIndex = 7;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '1': 'temp0',
                        '3': 'temp1',
                        '4': 'temp2',
                        '5': 'temp3'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2,
                    temp3: temp3
                });
            }
            throw e;
        }
    }();
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

        it('should correctly transpile an unlabelled "break;" statement', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
while (true) {
    break;
}
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
(function () {
    var statementIndex = 0;
    return function resumableScope() {
        if (Resumable._resumeState_) {
            statementIndex = Resumable._resumeState_.statementIndex;
            Resumable._resumeState_ = null;
        }
        try {
            switch (statementIndex) {
            case 0:
                statementIndex = 1;
            case 1:
            case 2:
                label0:
                    for (;;) {
                        switch (statementIndex) {
                        case 1:
                            if (!true) {
                                break label0;
                            }
                            statementIndex = 2;
                        case 2:
                            break label0;
                            statementIndex = 3;
                        }
                        statementIndex = 1;
                    }
                statementIndex = 3;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {}
                });
            }
            throw e;
        }
    }();
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

        it('should correctly transpile multiple reads of the same variable', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
exports.result = myVar + myVar;
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
                temp0 = exports;
                statementIndex = 1;
            case 1:
                temp1 = myVar;
                statementIndex = 2;
            case 2:
                temp2 = myVar;
                statementIndex = 3;
            case 3:
                temp0.result = temp1 + temp2;
                statementIndex = 4;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1',
                        '2': 'temp2'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2
                });
            }
            throw e;
        }
    }();
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

        it('should correctly transpile each argument passed in a function call', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
exports.result = sum(a + 1, b + 2);
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
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
                temp0 = exports;
                statementIndex = 1;
            case 1:
                temp1 = sum;
                statementIndex = 2;
            case 2:
                temp2 = a;
                statementIndex = 3;
            case 3:
                temp3 = b;
                statementIndex = 4;
            case 4:
                temp4 = temp1(temp2 + 1, temp3 + 2);
                statementIndex = 5;
            case 5:
                temp0.result = temp4;
                statementIndex = 6;
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
                        '3': 'temp3',
                        '4': 'temp4'
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
    }();
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

        it('should correctly transpile a call to a method of a property', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
exports.result = first.second.third();
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
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
                temp0 = exports;
                statementIndex = 1;
            case 1:
                temp1 = first;
                statementIndex = 2;
            case 2:
                temp2 = temp1.second;
                statementIndex = 3;
            case 3:
                temp3 = temp2.third;
                statementIndex = 4;
            case 4:
                temp4 = temp3.call(temp2);
                statementIndex = 5;
            case 5:
                temp0.result = temp4;
                statementIndex = 6;
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
                        '3': 'temp3',
                        '4': 'temp4'
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
    }();
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

        it('should correctly transpile a logical expression', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
exports.result = first.second || third.fourth;
EOS
*/) {}),
                expectedOutputJS = util.heredoc(function (/*<<<EOS
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
                temp0 = exports;
                statementIndex = 1;
            case 1:
                temp1 = first;
                statementIndex = 2;
            case 2:
                temp2 = temp1.second;
                statementIndex = 3;
            case 3:
                statementIndex = 4;
            case 4:
            case 5:
                if (statementIndex > 4 || !temp2) {
                    switch (statementIndex) {
                    case 4:
                        temp3 = third;
                        statementIndex = 5;
                    case 5:
                        temp4 = temp3.fourth;
                        statementIndex = 6;
                    }
                }
                statementIndex = 6;
            case 6:
                temp0.result = temp2 || temp4;
                statementIndex = 7;
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
                        '5': 'temp4'
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
    }();
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

        it('should correctly transpile a read->write->read', function () {
            var inputJS = util.heredoc(function (/*<<<EOS
a = a + b;
c = a;
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
                temp0 = a;
                statementIndex = 1;
            case 1:
                temp1 = b;
                statementIndex = 2;
            case 2:
                a = temp0 + temp1;
                statementIndex = 3;
            case 3:
                temp2 = a;
                statementIndex = 4;
            case 4:
                c = temp2;
                statementIndex = 5;
            }
        } catch (e) {
            if (e instanceof Resumable.PauseException) {
                e.add({
                    func: resumableScope,
                    statementIndex: statementIndex + 1,
                    assignments: {
                        '0': 'temp0',
                        '1': 'temp1',
                        '3': 'temp2'
                    },
                    temp0: temp0,
                    temp1: temp1,
                    temp2: temp2
                });
            }
            throw e;
        }
    }();
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
