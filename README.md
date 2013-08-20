Uniter
======

Uniter is a recompiling interpreter written in JavaScript.

Interpreting a simple PHP script on the OSX command line
--------------------------------------------------------

1. Create the simple PHP script:

        echo "<?php print 'hello world'; ?>" > example.php

2. Install the Uniter program:

        npm install -g uniter

3. Run the script:

        uniter example.php

Using the Uniter API from Node.js
---------------------------------

1. Install the Uniter dependency manually `npm install uniter` or add to your project's package.json
2. Require the Uniter library to use its API:

        var uniter = require('uniter'),
            engine = uniter.createEngine('php');

        // Execute the PHP code: returns a promise that will be resolved when finished
        engine.execute('<?php print "Hello world!";').done(function (stdout, stdin, stderr) {
            // Retrieve all captured data sent to STDOUT and log to console
            console.log(stdout.readAll());
        });

Running the tests
-----------------

There are two supported ways of running the Mocha test suite:
1. Run the tests in Node.js from the command line:

        cd uniter/
        npm test

2. Run the tests in a browser by starting a Node.js server:

        npm run-script webtest

   You should then be able to run the tests by visiting http://127.0.0.1:6700 in a supported web browser.
