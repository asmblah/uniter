<?php

$path = __DIR__ . '/../../../../tests/bdd/integration/languages/PHP/fixtures/allTokens.php';
$php = file_get_contents($path);
$tokens = token_get_all($php);

array_walk($tokens, function (&$token) {
    static $lastTokenEnd = 0;

    if (is_string($token)) {
        $token = array(
            'name' => 'T_CHARACTER',
            'offset' => $lastTokenEnd,
            'text' => $token
        );
    } elseif (is_array($token)) {
        $token = array(
            'name' => token_name($token[0]),
            'offset' => $lastTokenEnd,
            'text' => $token[1]
        );
    }

    // Support T_CALLABLE in older PHP versions
    if (!defined('T_CALLABLE') && $token['text'] === 'callable') {
        $token['name'] = 'T_CALLABLE';
    }

    // Support T_FINALLY in older PHP versions
    if (!defined('T_FINALLY') && $token['text'] === 'finally') {
        $token['name'] = 'T_FINALLY';
    }

    // Support T_TRAIT in older PHP versions
    if (!defined('T_TRAIT') && $token['text'] === 'trait') {
        $token['name'] = 'T_TRAIT';
    }

    // Support T_TRAIT_C in older PHP versions
    if (!defined('T_TRAIT_C') && $token['text'] === '__TRAIT__') {
        $token['name'] = 'T_TRAIT_C';
    }

    // Support T_INSTEADOF in older PHP versions
    if (!defined('T_INSTEADOF') && $token['text'] === 'insteadof') {
        $token['name'] = 'T_INSTEADOF';
    }

    // Support T_YIELD in older PHP versions
    if (!defined('T_YIELD') && $token['text'] === 'yield') {
        $token['name'] = 'T_YIELD';
    }

    $lastTokenEnd += strlen($token['text']);
});

function encode($string)
{
    return str_replace(array("\n"), array('\n'), var_export($string, true));
}

$lines = array();

foreach ($tokens as $token) {
    $lines[] = '{name: \'' . $token['name'] . '\', offset: ' . $token['offset'] . ', text: ' . encode($token['text']) . '}';
}

print implode(",\n", $lines);
