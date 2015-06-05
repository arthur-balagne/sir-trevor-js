var $ = require('jquery');
var animate = require('velocity-commonjs/velocity.ui');

var Spinner = function() {
    this.$elem = $('<div class="st-block-spinner"></div>');
};

Spinner.prototype = {
    appendTo: function($elem) {
        this.$elem.appendTo($elem);
    },

    fadeIn: function() {
        return animate(this.$elem[0], 'fadeIn', { duration: 200 });
    },

    fadeOut: function() {
        return animate(this.$elem[0], 'fadeOut', { duration: 200 });
    }
};

module.exports = Spinner;
