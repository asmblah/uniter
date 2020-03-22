/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

require('../vendor/ace/src-min-noconflict/ace');
require('../vendor/ace/src-min-noconflict/mode-javascript');
require('../vendor/ace/src-min-noconflict/mode-php');
require('../vendor/ace/src-min-noconflict/theme-twilight');

var ace = global.ace,
    nowdoc = require('nowdoc'),
    javascriptCode = '/*global phpCode, resultBody, uniter */\n' + nowdoc(function () {/*<<<EOS
'use strict';

var phpEngine = uniter.createEngine('PHP');

phpEngine.expose({
    getCC: function () {
        return 'en';
    },
    salutation: 'Hello'
}, 'info');

phpEngine.getStdout().on('data', function (data) {
    print(data);
});

phpEngine.getStderr().on('data', function (data) {
    print(data);
});

phpEngine.execute(phpCode, 'my_script.php').fail(function (error) {
    print(error.toString());
});

EOS
*/
    }),
    javascriptEditor,
    phpCode = nowdoc(function () {/*<<<EOS
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
*/
    }),
    phpEditor;

function updateResult() {
    var javascriptCode = javascriptEditor.getSession().getValue(),
        phpCode = phpEditor.getSession().getValue(),
        resultIframe = global.document.getElementById('result'),
        resultDocument = resultIframe.contentWindow.document,
        resultBody;

    function clear() {
        resultBody.innerHTML = '';
    }

    function print(html) {
        resultBody.insertAdjacentHTML('beforeEnd', html);
    }

    function printText(text) {
        resultBody.appendChild(global.document.createTextNode(text));
    }

    // Ensure the document has a body for IE9
    resultDocument.write('<body></body>');
    resultDocument.close();
    resultBody = resultDocument.body;

    clear();

    try {
        /*jshint evil: true */
        new Function('phpCode, print, resultBody', javascriptCode)(phpCode, print, resultBody);
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
