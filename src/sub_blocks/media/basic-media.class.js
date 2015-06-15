var _ = require('../../lodash.js');

var BasicSubBlock = require('../basic.class.js');

var BasicMediaSubBlock = function() {
    BasicSubBlock.apply(this, arguments);
};

BasicMediaSubBlock.prototype = Object.create(BasicSubBlock.prototype);

BasicMediaSubBlock.prototype.constructor = BasicSubBlock;

module.exports = BasicMediaSubBlock;
