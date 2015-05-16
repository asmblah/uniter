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
    'js/EventEmitter'
], function (
    util,
    EventEmitter
) {
    'use strict';

    function Stream() {
        EventEmitter.call(this);

        this.data = '';
    }

    util.inherit(Stream).from(EventEmitter);

    util.extend(Stream.prototype, {
        read: function (length) {
            var data,
                stream = this;

            if (!length && length !== 0) {
                data = stream.data;
                stream.data = '';
            } else {
                data = stream.data.substr(0, length);
                stream.data = stream.data.substr(length);
            }

            return data;
        },

        readAll: function () {
            var stream = this;

            return stream.read(stream.data.length);
        },

        write: function (data) {
            var stream = this;

            stream.data += data;
            stream.emit('data', data);
        }
    });

    return Stream;
});
