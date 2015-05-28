var _ = require('../lodash.js');

var BasicSubBlock = require('./basicSubBlock.js');

var smallTemplate = _.template([
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block__<%= type %>">',
        '<img class="st-sub-block-image" src="<%= image %>" />',
        '<h3><%= title %></h3>',
        '<a class="st-sub-block-link" href="<%= url %>" target="_blank">Voir le <%= type %></a>',
    '</div>'
].join('\n'));

var largeTemplate = _.template([
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block__<%= type %>">',
        '<img class="st-sub-block-image" src="<%= image %>" />',
        '<h3><%= title %></h3>',
        '<a class="st-sub-block-link" href="<%= url %>" target="_blank">Voir le <%= type %></a>',
    '</div>'
].join('\n'));

var JcsSubBlock = function() {
    BasicSubBlock.apply(this, arguments);

    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;
};

JcsSubBlock.prototype = Object.create(BasicSubBlock.prototype);

JcsSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {

};

Object.assign(JcsSubBlock.prototype, prototype);

module.exports = JcsSubBlock;
