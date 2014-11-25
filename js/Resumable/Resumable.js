/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, escodegen */
define([
    'vendor/esparse/esprima',
    'js/util',
    './PauseException',
    'js/Promise',
    'vendor/esparse/escodegen'
], function (
    esprima,
    util,
    PauseException,
    Promise
) {
    'use strict';

    function Resumable(transpiler) {
        this.transpiler = transpiler;
    }

    util.extend(Resumable, {
        _resumeState_: null,
        PauseException: PauseException
    });

    util.extend(Resumable.prototype, {
        createPause: function () {
            var pause = new PauseException(function (promise, result, states) {
                    var i,
                        lastResult = result,
                        state;

                    for (i = 0; i < states.length; i++) {
                        state = states[i];

                        if (state.assignments[state.statementIndex - 1]) {
                            state[state.assignments[state.statementIndex - 1]] = lastResult;
                        }

                        Resumable._resumeState_ = state;

                        try {
                            lastResult = state.func();
                        } catch (e) {
                            if (e instanceof PauseException) {
                                e.setPromise(promise);

                                return;
                            }

                            throw e;
                        }
                    }

                    promise.resolve();
                });

            return pause;
        },

        execute: function (code, options) {
            var ast = esprima.parse(code),
                expose,
                func,
                names = ['Resumable'],
                promise = new Promise(),
                transpiledCode,
                values = [Resumable];

            options = options || {};
            expose = options.expose || {};

            util.each(expose, function (value, name) {
                names.push(name);
                values.push(value);
            }, {keys: true});

            ast = this.transpiler.transpile(ast);

            transpiledCode = escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    }
                }
            });

            //console.log(transpiledCode);

            //debugger;

            /*jshint evil:true */
            func = new Function(names, 'return ' + transpiledCode);

            try {
                func.apply(null, values)();
            } catch (e) {
                if (e instanceof PauseException) {
                    e.setPromise(promise);
                } else {
                    promise.reject(e);
                }

                return promise;
            }

            promise.resolve();

            return promise;
        }
    });

    return Resumable;
});
