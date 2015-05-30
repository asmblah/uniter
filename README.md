Uniter
======

[![Build Status](https://secure.travis-ci.org/asmblah/uniter.png?branch=master)](http://travis-ci.org/asmblah/uniter)

Run PHP client-side in the browser or in Node.js.

As an on-the-fly recompiling interpreter (or transpiler) it results in the closest possible translation
from PHP to native JavaScript code.

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

Can I try it now?
-----------------

[Sure you can](http://asmblah.github.io/uniter/demo/interactive.html).

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
