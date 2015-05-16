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

    describe('Resumable Transpiler throw statement', function () {
        var transpiler;

        beforeEach(function () {
            transpiler = new Transpiler();
        });

        it('should correctly transpile a throw statement with scalar arg', function () {
            var inputJS = util.heredoc(function () {/*<<<EOS
throw 21;
EOS
*/;}), // jshint ignore:line
                expectedOutputJS = util.heredoc(function () {/*<<<EOS
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
                throw 21;
                statementIndex = 1;
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
