var eventablejs = require('eventablejs');
var BasicSubBlock = require('../basic.class.js');

var BasicMediaSubBlock = function() {
    BasicSubBlock.apply(this, arguments);
};

BasicMediaSubBlock.prototype = Object.create(BasicSubBlock.prototype);

BasicMediaSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {
    appendTo: function($container) {
        if (this.$elem) {
            this.$elem.appendTo($container);
        }
        else {
            console.error('This block has no $elem - did you activate it ?');
        }
    }
}

Object.assign(BasicMediaSubBlock.prototype, prototype, eventablejs);

module.exports = BasicMediaSubBlock;
