var BasicSubBlock = require('./basicSubBlock.js');

var VideoSubBlock = function() {};

VideoSubBlock.prototype = Object.create(BasicSubBlock.prototype);

VideoSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {

};

Object.assign(VideoSubBlock.prototype, prototype);

module.exports = VideoSubBlock;
