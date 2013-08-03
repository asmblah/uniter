

<?php

    function file_get_contents($path)
    {
        $file = fopen($path, 'r');
        if ($file === false) {
            trigger_error('Could not open file', E_WARNING);
            return false;
        }

        $data = '';

        while (!feof($file)) {
            $data .= fread($file, 1024);
        }

        fclose($file);

        return $data;
    }
?>

<?php

    class File
    {
        private $data = null;
        private $path;

        public function __construct($path)
        {
            $this->path = $path;
        }

        public function read()
        {
            $this->data = file_get_contents($this->path);

            return $this->data;
        }
    }

    $file = new File('test.txt');
    echo $file->read();
?>

(function (global, state) {
    "use strict";

    var args,
        result,
        $file;

    function File() {
        this.$data = null;
    }

    util.extend(File.prototype, {
        read: function ($path) {
            result = global.file_get_contents($path); if (state.stopped) { return state.pushContext(0, {this: this, $path: $path}); }; this.$data = result;
            return this.$data;
        }
    });

    result = new File('test.txt'); if (state.stopped) { return state.pushContext(1, {this: this, $file: $file}); }; $file = result;

    args = [$file->read()]; if (state.stopped) { return state.pushContext(2, {this: this, $file: $file}); }
    global.echo(args[0]);
}( ... ));
