var BasicSubBlock = require('./basicSubBlock.js');

var ImageSubBlock = function() {};

ImageSubBlock.prototype = Object.create(BasicSubBlock.prototype);

ImageSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {

};

Object.assign(ImageSubBlock.prototype, prototype);

module.exports = ImageSubBlock;
