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
    'js/util',
    'js/Exception'
], function (
    util,
    Exception
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function Interpreter(spec, stdin, stdout, stderr) {
        this.environment = null;
        this.spec = spec;
        this.state = null;
        this.stderr = stderr;
        this.stdin = stdin;
        this.stdout = stdout;
    }

    util.extend(Interpreter.prototype, {
        expose: function (object, name) {
            var globalScope = this.getEnvironment().getGlobalScope();

            globalScope.expose(object, name);
        },

        getEnvironment: function () {
            var interpreter = this;

            if (!interpreter.environment) {
                interpreter.environment = new interpreter.spec.Environment(interpreter.getState());
            }

            return interpreter.environment;
        },

        getState: function () {
            var interpreter = this,
                spec = interpreter.spec;

            if (!interpreter.state && spec.State) {
                interpreter.state = new spec.State();
            }

            return interpreter.state;
        },

        interpret: function (node, data) {
            var interpreter = this,
                nodeName,
                spec = interpreter.spec,
                stderr = interpreter.stderr,
                stdin = interpreter.stdin,
                stdout = interpreter.stdout;

            if (!hasOwn.call(node, 'name')) {
                throw new Exception('Interpreter.interpret() :: Invalid AST node provided');
            }

            if (arguments.length === 1) {
                data = interpreter.getState();
            }

            nodeName = node.name;

            if (!hasOwn.call(spec.nodes, nodeName)) {
                throw new Exception('Interpreter.interpret() :: Spec does not define how to handle node "' + nodeName + '"');
            }

            return spec.nodes[nodeName].call(interpreter, node, function (node, newData) {
                if (arguments.length === 1) {
                    newData = data;
                } else if (newData && (typeof newData === 'object')) {
                    newData = util.extend({}, data, newData);
                }

                if (util.isString(node)) {
                    return node;
                } else {
                    return interpreter.interpret(node, newData);
                }
            }, data, stdin, stdout, stderr);
        }
    });

    return Interpreter;
});
