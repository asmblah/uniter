![Uniter PHP](https://asmblah.github.io/uniter/img/logo.jpg)
======

[![Build Status](https://secure.travis-ci.org/asmblah/uniter.png?branch=master)](http://travis-ci.org/asmblah/uniter) [![Join the chat at https://gitter.im/asmblah/uniter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/asmblah/uniter?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Run PHP client-side in the browser or in Node.js.

[
![Manipulating the DOM using PHP with Uniter](https://asmblah.github.io/uniter/img/uniter_dom_demo.gif)
](https://asmblah.github.io/uniter/demo/interactive.html)

[Try it now](https://asmblah.github.io/uniter/demo/interactive.html)

Demos
-----
- [jQuery + PHP + Browserify (with PHPUnit)](https://uniter.github.io/uniter-jquery)
- [Interactive demo (above)](https://asmblah.github.io/uniter/demo/interactive.html)

Packages
--------
Uniter is split into several NPM packages, each with a separate repository:

| Package | Version | Dependencies |
|--------|-------|------------|
| [`uniter`](https://github.com/asmblah/uniter) | [![npm](https://img.shields.io/npm/v/uniter.svg?maxAge=2592000)](https://www.npmjs.com/package/uniter) | [![Dependency Status](https://david-dm.org/asmblah/uniter.svg)](https://david-dm.org/asmblah/uniter) |
| [`phptoast`](https://github.com/uniter/phptoast) | [![npm](https://img.shields.io/npm/v/phptoast.svg?maxAge=2592000)](https://www.npmjs.com/package/phptoast) | [![Dependency Status](https://david-dm.org/uniter/phptoast.svg)](https://david-dm.org/uniter/phptoast) |
| [`phptojs`](https://github.com/uniter/phptojs) | [![npm](https://img.shields.io/npm/v/phptojs.svg?maxAge=2592000)](https://www.npmjs.com/package/phptojs) | [![Dependency Status](https://david-dm.org/uniter/phptojs.svg)](https://david-dm.org/uniter/phptojs) |
| [`phpcore`](https://github.com/uniter/phpcore) | [![npm](https://img.shields.io/npm/v/phpcore.svg?maxAge=2592000)](https://www.npmjs.com/package/phpcore) | [![Dependency Status](https://david-dm.org/uniter/phpcore.svg)](https://david-dm.org/uniter/phpcore) |
| [`phpruntime`](https://github.com/uniter/phpruntime) | [![npm](https://img.shields.io/npm/v/phpruntime.svg?maxAge=2592000)](https://www.npmjs.com/package/phpruntime) | [![Dependency Status](https://david-dm.org/uniter/phpruntime.svg)](https://david-dm.org/uniter/phpruntime) |
| [`phpcommon`](https://github.com/uniter/phpcommon) | [![npm](https://img.shields.io/npm/v/phpcommon.svg?maxAge=2592000)](https://www.npmjs.com/package/phpcommon) | [![Dependency Status](https://david-dm.org/uniter/phpcommon.svg)](https://david-dm.org/uniter/phpcommon) |
| [`phpify`](https://github.com/uniter/phpify) | [![npm](https://img.shields.io/npm/v/phpify.svg?maxAge=2592000)](https://www.npmjs.com/package/phpify) | [![Dependency Status](https://david-dm.org/uniter/phpify.svg)](https://david-dm.org/uniter/phpify) |
| [`dotphp`](https://github.com/uniter/dotphp) | [![npm](https://img.shields.io/npm/v/dotphp.svg?maxAge=2592000)](https://www.npmjs.com/package/dotphp) | [![Dependency Status](https://david-dm.org/uniter/dotphp.svg)](https://david-dm.org/uniter/dotphp) |

[`uniter`](https://github.com/asmblah/uniter) is the main Uniter library (this repository).
It pulls in all the required components (below) to take a string of PHP code, evaluate it and return the result
with a simple API.

[`phptoast`](https://github.com/uniter/phptoast) is the parser for Uniter. It takes PHP code as a string
and returns an AST comprised of plain JavaScript objects.

[`phptojs`](https://github.com/uniter/phptojs) is the transpiler. It takes an AST (such as the one returned by `phptoast`)
and translates it into JavaScript
that can then be executed.

[`phpcore`](https://github.com/uniter/phpcore) is the minimal runtime library required for code transpiled by `phptojs` to execute.
It contains some builtin PHP classes and functions, but only those that are required
(eg. the `Closure` class or `spl_autoload_register(...)` function).

[`phpruntime`](https://github.com/uniter/phpruntime) is the extended "full" runtime library.
After pulling in `phpcore`, it installs the remaining builtin classes and functions, such as `array_merge(...)`.
Only a small subset of PHP's standard library has been implemented so far - please open a GitHub issue
in the `phpruntime` repository if you would like to request something that is missing.

[`phpcommon`](https://github.com/uniter/phpcommon) contains various tools that are shared between the different
packages, such as the `PHPFatalError` class used by both the parser (`phptoast`) and runtime (`phpcore`).

[`phpify`](https://github.com/uniter/phpify) is a Browserify transform that can be used to require PHP modules
(and entire libraries) from JavaScript.
For an example of compiling a PHP library down to JavaScript,
see the [Uniter Symfony EventDispatcher demo](https://github.com/uniter/event-dispatcher-demo).

[`dotphp`](https://github.com/uniter/dotphp) allows for easily including PHP files from Node.js.
A `require(...)` extension may be installed by using the `/register` script or PHP files may simply be required
with the exported `.require(...)` method. Stderr and stdout are mapped to the process' stderr and stdout respectively,
and the filesystem/ `include/require/_once(...)` access is mapped to the real filesystem.

Getting started
---------------
```shell
$ npm install uniter
$ node
```
```javascript
> var php = require('uniter').createEngine('PHP');
> php.getStdout().on('data', function (text) { console.log(text); });
> php.execute('<?php print "Hello from PHP!";');
Hello from PHP!
```

Features
--------
- Environment-agnostic architecture: should run in any modern browser (IE < 9 support coming soon) and Node.js

- PHP statements, constructs and operators:
    - `if`, `else` and `else if` statements
    - `while` loop support
    - `for` loop support
    - `foreach` loop support
    - `function` statements with type hinting (as syntactic sugar only: no enforcement is performed yet)
    - Closure `function` expressions
    - `switch` statements
    - Forward and backward `goto` statements (but no overlap support yet)
    - `class` object support (`new` operator, `extends` support etc.)
    - Instance property/method access (`->` operator)
    - Static class property/method access (`::` operator), `self::` construct
    - `use` statement for `class`, `namespace` and `function` importing and aliasing
    - Magic `__autoload(...)` function
    - Magic `__DIR__`, `__FILE__` and `__LINE__` constants
    - Ternary operator
    - Loose equality `==` and inequality `!=` comparison operators
    - Strict equality `===` and inequality `!==` comparison operators

    And others... see [the `Engine` integration tests](https://github.com/asmblah/uniter/tree/master/tests/bdd/integration/languages/PHP/engine) for more info.

Using on the command line
-------------------------
You can use Uniter from the command line after installing it via NPM, eg.:

```sh
# Install Uniter globally
$ npm install -g uniter

# Execute PHP code
$ uniter -r 'echo 7 + 2;'
9

# Parse PHP but just dump the AST as JSON, don't attempt to execute
$ uniter -r 'echo 7 + 2;' --dump-ast
{
    "statements": [
        {
            "expression": {
                "left": {
                    "number": "7",
                    "name": "N_INTEGER"
                },
                "right": [
                    {
                        "operator": "+",
                        "operand": {
                            "number": "2",
                            "name": "N_INTEGER"
                        }
                    }
                ],
                "name": "N_EXPRESSION"
            },
            "name": "N_ECHO_STATEMENT"
        }
    ],
    "name": "N_PROGRAM"
}
```

Keeping up to date
------------------
- [Follow me on Twitter](https://twitter.com/@asmblah) for updates: [https://twitter.com/@asmblah](https://twitter.com/@asmblah)

Running the tests
-----------------

There are two supported ways of running the Mocha test suite:

1. Run the tests in Node.js from the command line:

        cd uniter/
        npm test

2. Run the tests in a browser by starting a Node.js server:

        npm run-script webtest

   You should then be able to run the tests by visiting http://127.0.0.1:6700 in a supported web browser.

License
-------
[MIT](/MIT-LICENSE.txt)

Contributors
-------
[Pharaoh Tools](https://github.com/PharaohTools)
