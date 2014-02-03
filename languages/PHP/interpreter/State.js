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
    './builtin/builtins',
    '../util',
    'js/util',
    './CallStack',
    './ClassAutoloader',
    './Namespace',
    './ReferenceFactory',
    'js/Resumable/Resumable',
    'js/Resumable/Transpiler',
    './Scope',
    './Timer',
    './ValueFactory'
], function (
    builtinTypes,
    phpUtil,
    util,
    CallStack,
    ClassAutoloader,
    Namespace,
    ReferenceFactory,
    Resumable,
    ResumableTranspiler,
    Scope,
    Timer,
    ValueFactory
) {
    'use strict';

    var EXCEPTION_CLASS = 'Exception';

    function PHPState(stdout, stderr, engine, options) {
        var callStack = new CallStack(stderr),
            timer = new Timer(),
            valueFactory = new ValueFactory(callStack),
            classAutoloader = new ClassAutoloader(valueFactory),
            globalNamespace = new Namespace(callStack, valueFactory, classAutoloader, null, '');

        classAutoloader.setGlobalNamespace(globalNamespace);
        valueFactory.setGlobalNamespace(globalNamespace);

        this.callStack = callStack;
        this.engine = engine;
        this.globalNamespace = globalNamespace;
        this.globalScope = new Scope(callStack, valueFactory, null, null);
        this.maxSeconds = 1;
        this.options = options;
        this.path = null;
        this.referenceFactory = new ReferenceFactory(valueFactory);
        this.callStack = callStack;
        this.classAutoloader = classAutoloader;
        this.resumable = new Resumable(new ResumableTranspiler());
        this.stdout = stdout;
        this.timeoutTime = timer.getMilliseconds() + 1000;
        this.timer = timer;
        this.valueFactory = valueFactory;
        this.PHPException = null;

        setUpState(this);
    }

    util.extend(PHPState.prototype, {
        getCallStack: function () {
            return this.callStack;
        },

        getEngine: function () {
            return this.engine;
        },

        getGlobalNamespace: function () {
            return this.globalNamespace;
        },

        getGlobalScope: function () {
            return this.globalScope;
        },

        getMaxSeconds: function () {
            return this.maxSeconds;
        },

        getOptions: function () {
            return this.options;
        },

        getPath: function () {
            return phpUtil.normalizeModulePath(this.path);
        },

        getPHPExceptionClass: function () {
            return this.PHPException;
        },

        getReferenceFactory: function () {
            return this.referenceFactory;
        },

        getResumable: function () {
            return this.resumable;
        },

        getTimeoutTime: function () {
            return this.timeoutTime;
        },

        getTimer: function () {
            return this.timer;
        },

        getValueFactory: function () {
            return this.valueFactory;
        },

        isMainProgram: function () {
            return this.path === null;
        },

        setPath: function (path) {
            this.path = path;
        },

        setTimeLimit: function (maxSeconds) {
            var state = this;

            state.maxSeconds = maxSeconds;
            state.timeoutTime = state.timer.getMilliseconds() + maxSeconds * 1000;
        }
    });

    function setUpState(state) {
        var globalNamespace = state.globalNamespace,
            internals = {
                callStack: state.callStack,
                classAutoloader: state.classAutoloader,
                globalNamespace: globalNamespace,
                resumable: state.resumable,
                state: state,
                stdout: state.stdout,
                valueFactory: state.valueFactory
            };

        util.each(builtinTypes.functionGroups, function (groupFactory) {
            var groupBuiltins = groupFactory(internals);

            util.each(groupBuiltins, function (fn, name) {
                globalNamespace.defineFunction(name, fn);
            });
        });

        util.each(builtinTypes.classes, function (classFactory, name) {
            var Class = classFactory(internals);

            if (name === EXCEPTION_CLASS) {
                state.PHPException = Class;
            }

            globalNamespace.defineClass(name, Class);
        });
    }

    return PHPState;
});
