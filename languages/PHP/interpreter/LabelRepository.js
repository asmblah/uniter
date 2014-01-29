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

        this.foundLabels = {};
        this.labels = {};
        this.pendingLabels = {};
    }

    util.inherit(LabelRepository).from(EventEmitter);

    util.extend(LabelRepository.prototype, {
        addPending: function (label) {
            var repository = this;

            repository.labels[label] = true;
            repository.pendingLabels[label] = true;
            repository.emit('pending label', label);
        },

        found: function (label) {
            var repository = this;

            repository.foundLabels[label] = true;
            repository.labels[label] = true;
            delete repository.pendingLabels[label];
            repository.emit('found label', label);
        },

        getLabels: function () {
            return Object.keys(this.labels);
        },

        hasBeenFound: function (label) {
            var repository = this;

            return repository.foundLabels[label] === true;
        },

        hasPending: function () {
            return Object.keys(this.pendingLabels).length > 0;
        },

        isPending: function (label) {
            return this.pendingLabels[label] === true;
        }
    });

    return LabelRepository;
});
