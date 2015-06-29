var $ = require('jquery');
var _ = require('../../lodash.js');
var BasicMediaSubBlock = require('./basic-media.class.js');

var renderField = require('../../helpers/field-builder.js');

var smallTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-small st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= file %>" />',
        '</figure>',
        '<h3><%= legend %></h3>',
        '<a class="st-sub-block-link st-icon" href="<%= file %>" target="_blank">link</a>',
    '</div>'
].join('\n');

var outerTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-large st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= file %>" />',
        '</figure>',
        '<%= editArea %>',
        '<%= footer %>',
    '</div>'
].join('\n');

var ImageSubBlock = function() {
    this.type = 'image';
    this.smallTemplate = smallTemplate;
    this.outerTemplate = outerTemplate;

    BasicMediaSubBlock.apply(this, arguments);
};

ImageSubBlock.prototype = Object.create(BasicMediaSubBlock.prototype);

ImageSubBlock.prototype.constructor = BasicMediaSubBlock;

module.exports = ImageSubBlock;
