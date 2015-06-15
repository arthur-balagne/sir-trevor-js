var BasicMediaSubBlock = require('./basic-media.class.js');

var smallTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-small st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= image %>" />',
        '</figure>',
        '<h3><%= legend %></h3>',
        '<a class="st-sub-block-link st-icon" href="<%= image %>" target="_blank">link</a>',
    '</div>'
].join('\n');

var largeTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-large st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= image %>" />',
        '</figure>',
        '<h3><%= legend %></h3>',
        '<a class="st-sub-block-link st-icon" href="<%= image %>" target="_blank">link</a>',
    '</div>'
].join('\n');

var ImageSubBlock = function() {
    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;

    BasicMediaSubBlock.apply(this, arguments);
};

ImageSubBlock.prototype = Object.create(BasicMediaSubBlock.prototype);

ImageSubBlock.prototype.constructor = BasicMediaSubBlock;

var prototype = {

};

Object.assign(ImageSubBlock.prototype, prototype);

module.exports = ImageSubBlock;
