var _ = require('../lodash.js');

var BasicSubBlock = require('./basicSubBlock.js');

var testTemplate = _.template([
    '<div data-sub-block-id="<%= id %>" class="st-sub-block__test">',
        '<img src="<%= image %>" />',
        '<span><%= title %></span>',
        '<span><%= description %></span>',
    '</div>'
].join('\n'));

var TestSubBlock = function() {
    BasicSubBlock.apply(this, arguments);

    this.template = testTemplate;
};

TestSubBlock.prototype = Object.create(BasicSubBlock.prototype);

TestSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {

};

Object.assign(TestSubBlock.prototype, prototype);

module.exports = TestSubBlock;
