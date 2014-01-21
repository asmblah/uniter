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

    function LabelRepository() {
        EventEmitter.call(this);

        this.labels = {};
        this.pendingLabels = {};
    }

    util.inherit(LabelRepository).from(EventEmitter);

    util.extend(LabelRepository.prototype, {
        addPending: function (label) {
            var repository = this;

            repository.labels[label] = true;
            repository.pendingLabels[label] = true;
        },

        found: function (label) {
            var repository = this;

            delete repository.pendingLabels[label];
            repository.emit('found label', label);
        },

        getLabels: function () {
            return Object.keys(this.labels);
        },

        hasPending: function () {
            return Object.keys(this.pendingLabels).length > 0;
        },

        isPending: function (label) {
            return this.pendingLabels[label] === true;
        },

        onFound: function (callback) {
            this.on('found label', callback);
        }
    });

    return LabelRepository;
});
