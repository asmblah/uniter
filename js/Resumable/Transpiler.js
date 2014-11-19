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
    'vendor/esparse/esprima',
    'vendor/esparse/estraverse',
    'js/util',
    './ExpressionTranspiler/AssignmentExpressionTranspiler',
    './ExpressionTranspiler/BinaryExpressionTranspiler',
    './StatementTranspiler/BlockStatementTranspiler',
    './ExpressionTranspiler/CallExpressionTranspiler',
    './StatementTranspiler/ExpressionStatementTranspiler',
    './ExpressionTranspiler/ExpressionTranspiler',
    './StatementTranspiler/FunctionDeclarationTranspiler',
    './ExpressionTranspiler/FunctionExpressionTranspiler',
    './FunctionTranspiler',
    './StatementTranspiler/IfStatementTranspiler',
    './ExpressionTranspiler/MemberExpressionTranspiler',
    './StatementTranspiler/ProgramTranspiler',
    './StatementTranspiler/ReturnStatementTranspiler',
    './StatementTranspiler/StatementTranspiler',
    './StatementTranspiler/VariableDeclarationTranspiler',
    'vendor/esparse/escodegen'
], function (
    esprima,
    estraverse,
    util,
    AssignmentExpressionTranspiler,
    BinaryExpressionTranspiler,
    BlockStatementTranspiler,
    CallExpressionTranspiler,
    ExpressionStatementTranspiler,
    ExpressionTranspiler,
    FunctionDeclarationTranspiler,
    FunctionExpressionTranspiler,
    FunctionTranspiler,
    IfStatementTranspiler,
    MemberExpressionTranspiler,
    ProgramTranspiler,
    ReturnStatementTranspiler,
    StatementTranspiler,
    VariableDeclarationTranspiler
) {
    'use strict';

    function Transpiler() {
        var expressionTranspiler = new ExpressionTranspiler(),
            statementTranspiler = new StatementTranspiler(),
            functionTranspiler = new FunctionTranspiler(statementTranspiler);

        util.each([
            BlockStatementTranspiler,
            ExpressionStatementTranspiler,
            IfStatementTranspiler,
            ProgramTranspiler,
            ReturnStatementTranspiler,
            VariableDeclarationTranspiler
        ], function (Class) {
            statementTranspiler.addTranspiler(new Class(statementTranspiler, expressionTranspiler));
        });

        statementTranspiler.addTranspiler(
            new FunctionDeclarationTranspiler(
                statementTranspiler,
                expressionTranspiler,
                functionTranspiler
            )
        );

        util.each([
            AssignmentExpressionTranspiler,
            BinaryExpressionTranspiler,
            CallExpressionTranspiler,
            MemberExpressionTranspiler
        ], function (Class) {
            expressionTranspiler.addTranspiler(new Class(statementTranspiler, expressionTranspiler));
        });

        expressionTranspiler.addTranspiler(
            new FunctionExpressionTranspiler(
                statementTranspiler,
                expressionTranspiler,
                functionTranspiler
            )
        );

        this.expressionTranspiler = expressionTranspiler;
        this.statementTranspiler = statementTranspiler;
    }

    util.extend(Transpiler.prototype, {
        transpile: function (ast) {
            return this.statementTranspiler.transpile(ast, null);
        }
    });

    return Transpiler;
});
