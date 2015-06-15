var BasicMediaSubBlock = require('./basic-media.class.js');

var VideoSubBlock = function() {
    BasicMediaSubBlock.apply(this, arguments);
};

VideoSubBlock.prototype = Object.create(BasicMediaSubBlock.prototype);

VideoSubBlock.prototype.constructor = BasicMediaSubBlock;

var prototype = {

};

Object.assign(VideoSubBlock.prototype, prototype);

module.exports = VideoSubBlock;
