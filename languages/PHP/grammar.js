/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*
 * PHP Grammar
 */

/*global define */
define(function () {
    'use strict';

    return {
        delimiter: 'N_DELIMITER',
        nodes: {
            'N_COMPOUND_STATEMENT': [
                'T_CHARACTER("{")',
                'N_STATEMENT{1+} as statements',
                'T_CHARACTER("}")'
            ],
            'N_DELIMITER': [
                'T_COMMENT or T_DOC_COMMENT or T_WHITESPACE'
            ],
            'N_EXPRESSION': [],
            'N_IF': [
                'T_IF',
                'T_CHARACTER("(")',
                'N_EXPRESSION as condition',
                'T_CHARACTER(")")',
                'N_STATEMENT as thenStatements'
            ],
            'N_RETURN': [
                'T_RETURN',
                'N_EXPRESSION? as expression'
            ],
            'N_STATEMENT': [
                'N_COMPOUND_STATEMENT or N_EXPRESSION or N_ASSIGNMENT or N_RETURN',
                'T_CHARACTER(";")'
            ]
        }
    };
});
