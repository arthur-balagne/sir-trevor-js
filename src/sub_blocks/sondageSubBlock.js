var _ = require('../lodash.js');

var BasicSubBlock = require('./basicSubBlock.js');

var sondageTemplate = _.template([
    '<div data-sub-block-id="<%= id %>" class="st-sub-block__sondage">',
        '<img src="<%= image %>" />',
        '<span><%= title %></span>',
        '<span><%= description %></span>',
    '</div>'
].join('\n'));

var SondageSubBlock = function() {
    BasicSubBlock.apply(this, arguments);

    this.template = sondageTemplate;
};

SondageSubBlock.prototype = Object.create(BasicSubBlock.prototype);

SondageSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {

};

Object.assign(SondageSubBlock.prototype, prototype);

module.exports = SondageSubBlock;
