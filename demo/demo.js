/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define({
    paths: {
        'ace': '../vendor/ace',
        'uniter': '../uniter',

        // Work around bug in Modular
        'Modular': '../node_modules/modular-amd'
    }
}, [
    'require',
    '../js/util',
    'ace/src-min-noconflict/ace'
], function (
    require,
    util
) {
    'use strict';

    var global = util.global;

    // Only load components after Ace library is loaded (as ace.define(...) is required)
    require([
        'ace/src-min-noconflict/mode-javascript',
        'ace/src-min-noconflict/mode-php',
        'ace/src-min-noconflict/theme-twilight'
    ], function () {
        var ace = global.ace,
            javascriptCode = util.heredoc(function (/*<<<EOS
require([
    'uniter'
], function (
    uniter
) {
    'use strict';

    var phpEngine = uniter.createEngine('PHP');

    function output() {
        print(phpEngine.getStdout().readAll());
        print(phpEngine.getStderr().readAll());
    }

    phpEngine.expose({
        getCC: function () {
            return 'en';
        },
        salutation: 'Hello'
    }, 'info');

    phpEngine.execute(phpCode).done(function () {
        output();
    }).fail(function (exception) {
        output();
    });
});

EOS
*/) {}),
            javascriptEditor,
            phpCode = util.heredoc(function (/*<<<EOS
<?php

$project = 'Uniter';

class English {
    public function exclaim($text) {
        return $text . '!';
    }
}

$lang = ($info->getCC() === 'en') ? new English : null;

echo $info->salutation .
    ' from ' .
    $lang->exclaim($project);
EOS
*/) {}),
            phpEditor;

        function updateResult() {
            var javascriptCode = javascriptEditor.getSession().getValue(),
                phpCode = phpEditor.getSession().getValue(),
                resultIframe = global.document.getElementById('result'),
                resultBody = resultIframe.contentWindow.document.body;

            function print(html) {
                resultBody.insertAdjacentHTML('beforeEnd', html);
            }

            function printText(text) {
                resultBody.appendChild(global.document.createTextNode(text));
            }

            resultBody.innerHTML = '';

            try {
                /*jshint evil: true */
                new Function('require, phpCode, print', javascriptCode)(require, phpCode, print);
            } catch (error) {
                printText('<JavaScript error> ' + error.toString());
            }
        }

        ace.config.set('basePath', '/uniter/vendor/ace/src-min-noconflict');

        javascriptEditor = ace.edit('javascriptEditor');
        javascriptEditor.setTheme('ace/theme/twilight');
        javascriptEditor.getSession().setValue(javascriptCode);
        javascriptEditor.getSession().setMode('ace/mode/javascript');
        javascriptEditor.on('change', updateResult);

        phpEditor = ace.edit('phpEditor');
        phpEditor.setTheme('ace/theme/twilight');
        phpEditor.getSession().setValue(phpCode);
        phpEditor.getSession().setMode('ace/mode/php');
        phpEditor.on('change', updateResult);

        // Initial run
        updateResult();
    });
});
