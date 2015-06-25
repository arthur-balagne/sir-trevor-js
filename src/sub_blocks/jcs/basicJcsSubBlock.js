var _ = require('../../lodash.js');

var BasicSubBlock = require('../basicSubBlock.js');

var smallTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-small st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= image %>" />',
        '</figure>',
        '<h3><%= title %></h3>',
        '<a class="st-sub-block-link st-icon" href="<%= url %>" target="_blank">link</a>',
        '<span class="st-sub-block-site"><%= site %></span>',
    '</div>'
].join('\n');

var JcsSubBlock = function() {
    this.smallTemplate = smallTemplate;
    BasicSubBlock.apply(this, arguments);
};

JcsSubBlock.prototype = Object.create(BasicSubBlock.prototype);

JcsSubBlock.prototype.constructor = BasicSubBlock;

module.exports = JcsSubBlock;
