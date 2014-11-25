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
    './StatementTranspiler/BreakStatementTranspiler',
    './ExpressionTranspiler/CallExpressionTranspiler',
    './StatementTranspiler/ExpressionStatementTranspiler',
    './ExpressionTranspiler/ExpressionTranspiler',
    './StatementTranspiler/FunctionDeclarationTranspiler',
    './ExpressionTranspiler/FunctionExpressionTranspiler',
    './FunctionTranspiler',
    './ExpressionTranspiler/IdentifierTranspiler',
    './StatementTranspiler/IfStatementTranspiler',
    './ExpressionTranspiler/LogicalExpressionTranspiler',
    './ExpressionTranspiler/MemberExpressionTranspiler',
    './StatementTranspiler/ProgramTranspiler',
    './StatementTranspiler/ReturnStatementTranspiler',
    './StatementTranspiler/StatementTranspiler',
    './StatementTranspiler/VariableDeclarationTranspiler',
    './StatementTranspiler/WhileStatementTranspiler',
    'vendor/esparse/escodegen'
], function (
    esprima,
    estraverse,
    util,
    AssignmentExpressionTranspiler,
    BinaryExpressionTranspiler,
    BlockStatementTranspiler,
    BreakStatementTranspiler,
    CallExpressionTranspiler,
    ExpressionStatementTranspiler,
    ExpressionTranspiler,
    FunctionDeclarationTranspiler,
    FunctionExpressionTranspiler,
    FunctionTranspiler,
    IdentifierTranspiler,
    IfStatementTranspiler,
    LogicalExpressionTranspiler,
    MemberExpressionTranspiler,
    ProgramTranspiler,
    ReturnStatementTranspiler,
    StatementTranspiler,
    VariableDeclarationTranspiler,
    WhileStatementTranspiler
) {
    'use strict';

    function Transpiler() {
        var expressionTranspiler = new ExpressionTranspiler(),
            statementTranspiler = new StatementTranspiler(),
            functionTranspiler = new FunctionTranspiler(statementTranspiler);

        util.each([
            BlockStatementTranspiler,
            BreakStatementTranspiler,
            ExpressionStatementTranspiler,
            IfStatementTranspiler,
            ProgramTranspiler,
            ReturnStatementTranspiler,
            VariableDeclarationTranspiler,
            WhileStatementTranspiler
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
            IdentifierTranspiler,
            LogicalExpressionTranspiler,
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
