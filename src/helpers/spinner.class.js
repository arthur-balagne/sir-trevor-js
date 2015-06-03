var _ = require('../lodash.js');
var $ = require('jquery');
var Velocity = require('velocity-animate');

var Spinner = function() {
    this.$elem = $('<div class="st-block-spinner"></div>');
};

Spinner.prototype = {
    appendTo: function($elem) {
        this.$elem.appendTo($elem);
    },

    fadeIn: function() {
        return Velocity(this.$elem[0], 'fadeIn', { duration: 200 });
    },

    fadeOut: function() {
        return Velocity(this.$elem[0], 'fadeOut', { duration: 200 });
    }
};

module.exports = Spinner;
