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
    './ExpressionTranspiler/ArrayExpressionTranspiler',
    './ExpressionTranspiler/AssignmentExpressionTranspiler',
    './ExpressionTranspiler/BinaryExpressionTranspiler',
    './StatementTranspiler/BlockStatementTranspiler',
    './StatementTranspiler/BreakStatementTranspiler',
    './ExpressionTranspiler/CallExpressionTranspiler',
    './StatementTranspiler/ContinueStatementTranspiler',
    './StatementTranspiler/DoWhileStatementTranspiler',
    './StatementTranspiler/ExpressionStatementTranspiler',
    './ExpressionTranspiler/ExpressionTranspiler',
    './StatementTranspiler/ForStatementTranspiler',
    './StatementTranspiler/FunctionDeclarationTranspiler',
    './ExpressionTranspiler/FunctionExpressionTranspiler',
    './FunctionTranspiler',
    './ExpressionTranspiler/IdentifierTranspiler',
    './StatementTranspiler/IfStatementTranspiler',
    './StatementTranspiler/LabeledStatementTranspiler',
    './ExpressionTranspiler/LogicalExpressionTranspiler',
    './ExpressionTranspiler/MemberExpressionTranspiler',
    './ExpressionTranspiler/ObjectExpressionTranspiler',
    './StatementTranspiler/ProgramTranspiler',
    './ExpressionTranspiler/PropertyTranspiler',
    './StatementTranspiler/ReturnStatementTranspiler',
    './ExpressionTranspiler/SequenceExpressionTranspiler',
    './StatementTranspiler/StatementTranspiler',
    './StatementTranspiler/ThrowStatementTranspiler',
    './StatementTranspiler/TryStatementTranspiler',
    './ExpressionTranspiler/UpdateExpressionTranspiler',
    './StatementTranspiler/VariableDeclarationTranspiler',
    './StatementTranspiler/WhileStatementTranspiler',
    './StatementTranspiler/WithStatementTranspiler',
    'vendor/esparse/escodegen'
], function (
    esprima,
    estraverse,
    util,
    ArrayExpressionTranspiler,
    AssignmentExpressionTranspiler,
    BinaryExpressionTranspiler,
    BlockStatementTranspiler,
    BreakStatementTranspiler,
    CallExpressionTranspiler,
    ContinueStatementTranspiler,
    DoWhileStatementTranspiler,
    ExpressionStatementTranspiler,
    ExpressionTranspiler,
    ForStatementTranspiler,
    FunctionDeclarationTranspiler,
    FunctionExpressionTranspiler,
    FunctionTranspiler,
    IdentifierTranspiler,
    IfStatementTranspiler,
    LabeledStatementTranspiler,
    LogicalExpressionTranspiler,
    MemberExpressionTranspiler,
    ObjectExpressionTranspiler,
    ProgramTranspiler,
    PropertyTranspiler,
    ReturnStatementTranspiler,
    SequenceExpressionTranspiler,
    StatementTranspiler,
    ThrowStatementTranspiler,
    TryStatementTranspiler,
    UpdateExpressionTranspiler,
    VariableDeclarationTranspiler,
    WhileStatementTranspiler,
    WithStatementTranspiler
) {
    'use strict';

    function Transpiler() {
        var expressionTranspiler = new ExpressionTranspiler(),
            statementTranspiler = new StatementTranspiler(),
            functionTranspiler = new FunctionTranspiler(statementTranspiler);

        util.each([
            BlockStatementTranspiler,
            BreakStatementTranspiler,
            ContinueStatementTranspiler,
            DoWhileStatementTranspiler,
            ExpressionStatementTranspiler,
            ForStatementTranspiler,
            IfStatementTranspiler,
            LabeledStatementTranspiler,
            ProgramTranspiler,
            ReturnStatementTranspiler,
            ThrowStatementTranspiler,
            TryStatementTranspiler,
            VariableDeclarationTranspiler,
            WhileStatementTranspiler,
            WithStatementTranspiler
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
            ArrayExpressionTranspiler,
            AssignmentExpressionTranspiler,
            BinaryExpressionTranspiler,
            CallExpressionTranspiler,
            IdentifierTranspiler,
            LogicalExpressionTranspiler,
            MemberExpressionTranspiler,
            ObjectExpressionTranspiler,
            PropertyTranspiler,
            SequenceExpressionTranspiler,
            UpdateExpressionTranspiler
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
