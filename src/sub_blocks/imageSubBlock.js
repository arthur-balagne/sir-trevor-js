var _ = require('../lodash.js');
var BasicSubBlock = require('./basicSubBlock.js');

var ImageSubBlock = function() {};

var smallTemplate = _.template([
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-small st-sub-block__<%= type %>">',
        '<img class="st-sub-block-image" src="<%= image %>" />',
        '<h3><%= title %></h3>',
        '<a class="st-sub-block-link" href="<%= url %>" target="_blank">Voir le <%= type %></a>',
    '</div>'
].join('\n'));

ImageSubBlock.prototype = Object.create(BasicSubBlock.prototype);

ImageSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {

};

Object.assign(ImageSubBlock.prototype, prototype);

module.exports = ImageSubBlock;



